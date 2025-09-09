import mongoose from "mongoose";
import Product from "../models/Product.model.js";
import Wishlist from "../models/Wishlist.model.js";

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const data = await Wishlist.aggregate([
      { $match: { user: userId } },

      {
        $lookup: {
          from: "products",
          let: { pidList: "$items" },
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

      {
        $addFields: {
          items: {
            $map: {
              input: "$items",
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

      { $project: { productDocs: 0 } },
    ]);

    const wishlist = data[0] || null;

    if (!wishlist) {
      return res
        .status(200)
        .json({ success: false, message: "Wishlist is empty!" });
    }

    return res.status(200).json({ success: true, wishlist });
  } catch (error) {
    console.error("getWishlist error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
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

    const productExists = await Wishlist.findOne({
      user: userId,
      items: productId,
    });

    if (productExists) {
      return res.status(400).json({
        success: false,
        message: "Product already added to Wishlist!",
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
