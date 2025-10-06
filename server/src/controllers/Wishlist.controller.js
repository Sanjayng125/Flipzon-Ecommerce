import mongoose from "mongoose";
import Product from "../models/Product.model.js";
import Wishlist from "../models/Wishlist.model.js";

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const data = await Wishlist.aggregate([
      { $match: { user: userId } },

      // Get total count before pagination
      {
        $addFields: {
          totalProducts: { $size: "$items" },
        },
      },

      // Slice items array for pagination
      {
        $addFields: {
          paginatedItems: {
            $slice: ["$items", skip, Number(limit)],
          },
        },
      },

      // Lookup only the paginated items
      {
        $lookup: {
          from: "products",
          let: { pidList: "$paginatedItems" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$pidList"] } } },
            {
              $project: {
                _id: 1,
                name: 1,
                price: 1,
                discount: 1,
                images: 1,
              },
            },
          ],
          as: "productDocs",
        },
      },

      // Map paginated items with product details
      {
        $addFields: {
          products: {
            $map: {
              input: "$paginatedItems",
              as: "pid",
              in: {
                $let: {
                  vars: {
                    matched: {
                      $first: {
                        $filter: {
                          input: "$productDocs",
                          cond: { $eq: ["$$this._id", "$$pid"] },
                        },
                      },
                    },
                  },
                  in: {
                    _id: { $ifNull: ["$$matched._id", "$$pid"] },
                    name: { $ifNull: ["$$matched.name", "Product not found"] },
                    price: { $ifNull: ["$$matched.price", 0] },
                    discount: { $ifNull: ["$$matched.discount", null] },
                    images: { $ifNull: ["$$matched.images", []] },
                  },
                },
              },
            },
          },
        },
      },

      {
        $project: {
          totalProducts: 1,
          products: 1,
        },
      },
    ]);

    const result = data[0];

    if (!result || result.totalProducts === 0) {
      return res.status(200).json({
        success: true,
        totalProducts: 0,
        currentPage: Number(page),
        totalPages: 0,
        products: [],
      });
    }

    return res.status(200).json({
      success: true,
      totalProducts: result.totalProducts,
      currentPage: Number(page),
      totalPages: Math.ceil(result.totalProducts / Number(limit)),
      products: result.products,
    });
  } catch (error) {
    console.error("getWishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

export const addItem = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id: productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID!" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }

    const wishlist = await Wishlist.findOne({
      user: userId,
    });

    if (!wishlist) {
      const newWishlist = await Wishlist.create({
        user: userId,
        items: [productId],
      });

      if (!newWishlist) {
        return res
          .status(500)
          .json({
            success: false,
            message: "Failed to add product to wishlist!",
          });
      }

      return res.status(200).json({
        success: true,
        message: "Product added to Wishlist!",
      });
    }

    const itemExists = wishlist.items.some(
      (product) => product.toString() === productId
    );

    if (itemExists) {
      return res.status(400).json({
        success: false,
        message: "Product already exists in Wishlist!",
      });
    }

    if (wishlist.items.length >= 50) {
      return res.status(400).json({
        success: false,
        message: "You can only add upto 50 products to wishlist at a time!",
      });
    }

    const updatedWishlist = await Wishlist.findOneAndUpdate(
      {
        user: userId,
      },
      {
        $push: { items: productId },
      },
      { new: true, upsert: true }
    );

    if (!updatedWishlist) {
      return res.status(400).json({
        success: false,
        message: "Failed to add product to Wishlist!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product added to Wishlist!",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const removeItem = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id: productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID!" });
    }

    const updatedWishlist = await Wishlist.findOneAndUpdate(
      {
        user: userId,
      },
      {
        $pull: { items: productId },
      },
      { new: true }
    );

    if (!updatedWishlist) {
      return res.status(400).json({
        success: false,
        message: "Failed to remove product from Wishlist!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from Wishlist!",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const clearWishlist = async (req, res) => {
  try {
    const { _id: userId } = req.user;

    const updatedWishlist = await Wishlist.findOneAndUpdate(
      {
        user: userId,
      },
      {
        items: [],
      },
      { new: true }
    );

    if (!updatedWishlist) {
      return res.status(400).json({
        success: false,
        message: "Failed to clear Wishlist!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Wishlist cleared!",
      wishlist: updatedWishlist,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};
