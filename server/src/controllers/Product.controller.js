import mongoose from "mongoose";
import Product from "../models/Product.model.js";
import Review from "../models/Review.model.js";
import { deleteImage } from "../utils/index.js";

export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      sort,
      priceMin = 0,
      priceMax = Infinity,
      page = 1,
      limit = 10,
      featured,
      outofstock,
    } = req.query;

    let filter = {
      price: {
        $gte: !isNaN(priceMin) ? Number(priceMin) : 0,
        $lte: !isNaN(priceMax) ? Number(priceMax) : Infinity,
      },
      stock: { $gt: 0 },
    };

    if (outofstock && (outofstock === "true" || outofstock === true)) {
      delete filter.stock;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category =
        typeof category === "string"
          ? new mongoose.Types.ObjectId(`${category}`)
          : category;
    }

    if (featured && (featured === "true" || featured === true)) {
      filter.isFeatured = true;
    }

    let sortOption = { createdAt: 1 };

    if (sort) {
      sortOption = {};
      if (sort === "price_asc") sortOption.price = 1;
      else if (sort === "price_desc") sortOption.price = -1;
      else if (sort === "latest") sortOption.createdAt = -1;
      else if (sort === "oldest") sortOption.createdAt = 1;
      else if (sort === "rating_desc") sortOption.avgRating = -1;
      else if (sort === "rating_asc") sortOption.avgRating = 1;
      else if (sort === "bestsellers") sortOption.sold = -1; // bestsellers
      else if (sort === "trending") {
        // trending
        sortOption.sold = -1; // priority 1: most sold
        sortOption.avgRating = -1; // priority 2: best rated
      }
    }

    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.aggregate([
      { $match: filter },

      {
        $lookup: {
          from: "reviews",
          let: { productId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$product", "$$productId"] } } },
            {
              $group: {
                _id: null,
                totalRatings: { $sum: 1 },
                avgRating: { $avg: "$rating" },
              },
            },
          ],
          as: "ratingStats",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "seller",
          foreignField: "_id",
          as: "sellerData",
        },
      },

      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },

      {
        $addFields: {
          seller: {
            _id: { $arrayElemAt: ["$sellerData._id", 0] },
            name: { $arrayElemAt: ["$sellerData.name", 0] },
          },
          category: {
            _id: { $arrayElemAt: ["$categoryData._id", 0] },
            name: { $arrayElemAt: ["$categoryData.name", 0] },
          },
          totalRatings: {
            $ifNull: [{ $arrayElemAt: ["$ratingStats.totalRatings", 0] }, 0],
          },
          avgRating: {
            $ifNull: [{ $arrayElemAt: ["$ratingStats.avgRating", 0] }, 0],
          },
        },
      },

      { $project: { ratingStats: 0, sellerData: 0, categoryData: 0 } },

      { $sort: sortOption },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
    ]);

    return res.status(200).json({
      success: true,
      totalProducts,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / limit),
      products,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

// export const getProducts = async (req, res) => {
//   try {
//     const { search, category, sort, page = 1, limit = 10 } = req.query;
//     const priceMin = req.query["price"]?.["min"] || 0;
//     const priceMax = req.query["price"]?.["max"] || Infinity;

//     let filter = {
//       price: { $gte: Number(priceMin), $lte: Number(priceMax) },
//     };

//     if (search) {
//       filter.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } },
//       ];
//     }

//     if (category) {
//       filter.category =
//         typeof category === "string"
//           ? new mongoose.Types.ObjectId(`${category}`)
//           : category;
//     }

//     let sortOption = {
//       createdAt: 1,
//     };
//     if (
//       sort &&
//       (sort === "price_asc" || sort === "price_desc" || sort === "latest")
//     ) {
//       sortOption = {};
//       if (sort === "price_asc") sortOption.price = 1;
//       else if (sort === "price_desc") sortOption.price = -1;
//       else if (sort === "latest") sortOption.createdAt = -1;
//     }

//     const totalProducts = await Product.countDocuments(filter);

//     const products = await Product.aggregate([
//       { $match: filter },

//       {
//         $lookup: {
//           from: "reviews",
//           let: { productId: "$_id" },
//           pipeline: [
//             { $match: { $expr: { $eq: ["$product", "$$productId"] } } },
//             {
//               $group: {
//                 _id: null,
//                 totalRatings: { $sum: 1 },
//                 avgRating: { $avg: "$rating" },
//               },
//             },
//           ],
//           as: "ratingStats",
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "seller",
//           foreignField: "_id",
//           as: "sellerData",
//         },
//       },
//       {
//         $lookup: {
//           from: "categories",
//           localField: "category",
//           foreignField: "_id",
//           as: "categoryData",
//         },
//       },

//       {
//         $addFields: {
//           seller: {
//             _id: { $arrayElemAt: ["$sellerData._id", 0] },
//             name: { $arrayElemAt: ["$sellerData.name", 0] },
//           },
//           category: {
//             _id: { $arrayElemAt: ["$categoryData._id", 0] },
//             name: { $arrayElemAt: ["$categoryData.name", 0] },
//           },
//           totalRatings: {
//             $ifNull: [{ $arrayElemAt: ["$ratingStats.totalRatings", 0] }, 0],
//           },
//           avgRating: {
//             $ifNull: [{ $arrayElemAt: ["$ratingStats.avgRating", 0] }, 0],
//           },
//         },
//       },

//       { $project: { ratingStats: 0, sellerData: 0, categoryData: 0 } },

//       { $sort: sortOption },
//       { $skip: (Number(page) - 1) * Number(limit) },
//       { $limit: Number(limit) },
//     ]);

//     return res.status(200).json({
//       success: true,
//       totalProducts,
//       currentPage: Number(page),
//       totalPages: Math.ceil(totalProducts / limit),
//       products,
//     });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Something went wrong!" });
//   }
// };

export const getProduct = async (req, res) => {
  try {
    const { id: productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Product ID!" });
    }

    const product = await Product.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(`${productId}`) } },
      {
        $lookup: {
          from: "reviews",
          let: { productId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$product", "$$productId"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 4 },
            {
              $lookup: {
                from: "users",
                let: { userId: "$user" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                  { $project: { name: 1, avatar: 1 } },
                ],
                as: "userDetails",
              },
            },
            {
              $addFields: {
                user: { $arrayElemAt: ["$userDetails", 0] },
              },
            },
            { $project: { userDetails: 0, product: 0 } },
          ],
          as: "latestReviews",
        },
      },
      {
        $lookup: {
          from: "reviews",
          let: { productId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$product", "$$productId"] } } },
            {
              $group: {
                _id: null,
                totalRatings: { $sum: 1 },
                avgRating: { $avg: "$rating" },
              },
            },
          ],
          as: "ratingStats",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $addFields: {
          totalRatings: {
            $ifNull: [{ $arrayElemAt: ["$ratingStats.totalRatings", 0] }, 0],
          },
          avgRating: {
            $ifNull: [{ $arrayElemAt: ["$ratingStats.avgRating", 0] }, 0],
          },
          category: {
            _id: { $arrayElemAt: ["$categoryData._id", 0] },
            name: { $arrayElemAt: ["$categoryData.name", 0] },
          },
        },
      },
      { $project: { ratingStats: 0, categoryData: 0 } },
    ]);

    if (!product.length) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }

    return res.status(200).json({ success: true, product: product[0] });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const getSimilarProducts = async (req, res) => {
  try {
    const { categoryId: category, productId: product } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!category || !product) {
      return res.status(400).json({
        success: false,
        message: "Category and Product ID is required!",
      });
    }

    const totalProducts = await Product.countDocuments({
      category: new mongoose.Types.ObjectId(`${category}`),
      _id: { $ne: new mongoose.Types.ObjectId(`${product}`) },
    });

    const products = await Product.aggregate([
      {
        $match: {
          category: new mongoose.Types.ObjectId(`${category}`),
          _id: { $ne: new mongoose.Types.ObjectId(`${product}`) },
        },
      },
      {
        $lookup: {
          from: "reviews",
          let: { productId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$product", "$$productId"] } } },
            {
              $group: {
                _id: null,
                totalRatings: { $sum: 1 },
                avgRating: { $avg: "$rating" },
              },
            },
          ],
          as: "ratingStats",
        },
      },
      {
        $addFields: {
          totalRatings: {
            $ifNull: [{ $arrayElemAt: ["$ratingStats.totalRatings", 0] }, 0],
          },
          avgRating: {
            $ifNull: [{ $arrayElemAt: ["$ratingStats.avgRating", 0] }, 0],
          },
        },
      },
      { $project: { ratingStats: 0 } },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
    ]);

    return res.status(200).json({
      success: true,
      totalProducts,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / limit),
      products,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const { _id: userId } = req.user;

    const { search, category, sort, page = 1, limit = 10 } = req.query;
    const priceMin = req.query["price"]?.["min"] || 0;
    const priceMax = req.query["price"]?.["max"] || Infinity;

    let filter = {
      seller: userId,
      price: { $gte: Number(priceMin), $lte: Number(priceMax) },
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category =
        typeof category === "string"
          ? new mongoose.Types.ObjectId(`${category}`)
          : category;
    }

    let sortOption = {
      createdAt: 1,
    };
    if (
      sort &&
      (sort === "price_asc" || sort === "price_desc" || sort === "latest")
    ) {
      sortOption = {};
      if (sort === "price_asc") sortOption.price = 1;
      else if (sort === "price_desc") sortOption.price = -1;
      else if (sort === "latest") sortOption.createdAt = -1;
    }

    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.aggregate([
      { $match: filter },

      {
        $lookup: {
          from: "reviews",
          let: { productId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$product", "$$productId"] } } },
            {
              $group: {
                _id: null,
                totalRatings: { $sum: 1 },
                avgRating: { $avg: "$rating" },
              },
            },
          ],
          as: "ratingStats",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "seller",
          foreignField: "_id",
          as: "sellerData",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },

      {
        $addFields: {
          seller: {
            _id: { $arrayElemAt: ["$sellerData._id", 0] },
            name: { $arrayElemAt: ["$sellerData.name", 0] },
          },
          category: {
            _id: { $arrayElemAt: ["$categoryData._id", 0] },
            name: { $arrayElemAt: ["$categoryData.name", 0] },
          },
          totalRatings: {
            $ifNull: [{ $arrayElemAt: ["$ratingStats.totalRatings", 0] }, 0],
          },
          avgRating: {
            $ifNull: [{ $arrayElemAt: ["$ratingStats.avgRating", 0] }, 0],
          },
        },
      },

      { $project: { ratingStats: 0, sellerData: 0, categoryData: 0 } },

      { $sort: sortOption },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
    ]);

    return res.status(200).json({
      success: true,
      totalProducts,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / limit),
      products,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, images, category, stock } = req.body;

    if (
      !name ||
      !description ||
      !price ||
      !Array.isArray(images) ||
      images.length === 0 ||
      !category ||
      !stock
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required!" });
    }

    if (isNaN(price) || isNaN(stock) || price <= 0 || stock < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid price or stock!" });
    }

    const allowedFields = [
      "name",
      "description",
      "price",
      "discount",
      "images",
      "category",
      "brand",
      "stock",
    ];
    const productData = Object.fromEntries(
      Object.entries(req.body).filter(
        ([key, value]) =>
          allowedFields.includes(key) && (value !== undefined || value !== null)
      )
    );

    const newProduct = await Product.create({
      ...productData,
      seller: req.user._id,
    });

    if (!newProduct) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to create product!" });
    }

    return res.status(201).json({
      success: true,
      message: "Product created!",
      product: newProduct,
    });
  } catch (error) {
    console.log(error);
    if (error?.message?.includes("validation failed")) {
      return res.status(400).json({ success: false, message: "Bad request!" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { _id: userId } = req.user;

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID!" });
    }

    const allowedFields = [
      "name",
      "description",
      "price",
      "discount",
      "images",
      "category",
      "brand",
      "stock",
      "sold",
    ];
    const productDataArray = Object.entries(req.body).filter(([key]) =>
      allowedFields.includes(key)
    );
    const productData = Object.fromEntries(productDataArray);

    if (productDataArray.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Nothing to update!" });
    }

    if (
      (productData?.price &&
        (typeof productData?.price !== "number" || productData?.price <= 0)) ||
      (productData?.stock &&
        (typeof productData?.price !== "number" || productData?.price < 0))
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid price or stock!" });
    }

    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(`${productId}`),
      seller: userId,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      productData,
      { new: true }
    );

    if (!updatedProduct) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to update product!" });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated!",
      product: updatedProduct,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const updateProductFeatured = async (req, res) => {
  try {
    const { id: productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID!" });
    }

    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(`${productId}`),
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        isFeatured: !product.isFeatured,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to update product!" });
    }

    return res.status(200).json({
      success: true,
      message: "Product Featured updated!",
      product: updatedProduct,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { _id: userId } = req.user;

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(`${productId}`),
      seller: userId,
    });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    await Review.deleteMany({
      product: product._id,
    });

    if (product?.images.length > 0) {
      for (const image of product.images) {
        if (image?.public_id) await deleteImage(image.public_id);
      }
    }

    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to delete product!" });
    }

    return res.status(200).json({ success: true, message: "Product deleted!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};
