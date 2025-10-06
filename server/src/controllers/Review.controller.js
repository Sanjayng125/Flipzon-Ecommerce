import mongoose from "mongoose";
import Product from "../models/Product.model.js";
import Review from "../models/Review.model.js";

export const getProductReviews = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { page = 1, limit = 10, search, sort, filter } = req.query;

    const limitNum = Number(limit || 10);

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID!" });
    }

    let sortOption = { createdAt: -1 };

    if (sort && sort !== "all") {
      if (sort === "ratingAsc") {
        sortOption = { rating: 1 };
      } else if (sort === "ratingDesc") {
        sortOption = { rating: -1 };
      } else if (sort === "newest") {
        sortOption = { createdAt: -1 };
      } else if (sort === "oldest") {
        sortOption = { createdAt: 1 };
      }
    }

    let filterOption = {};
    if (filter && filter !== "all") {
      if (filter === "1") {
        filterOption = { rating: 1 };
      } else if (filter === "2") {
        filterOption = { rating: 2 };
      } else if (filter === "3") {
        filterOption = { rating: 3 };
      } else if (filter === "4") {
        filterOption = { rating: 4 };
      } else if (filter === "5") {
        filterOption = { rating: 5 };
      }
    }

    const product = await Product.findById(
      new mongoose.Types.ObjectId(`${productId}`)
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }

    const totalReviews = await Review.countDocuments({
      product: new mongoose.Types.ObjectId(`${productId}`),
      ...filterOption,
      ...(search
        ? {
            title: { $regex: search, $options: "i" },
          }
        : {}),
    });

    const reviews = await Review.find({
      product: new mongoose.Types.ObjectId(`${productId}`),
      ...filterOption,
      ...(search
        ? {
            title: { $regex: search, $options: "i" },
          }
        : {}),
    })
      .populate("user", "name avatar.url")
      .skip((page - 1) * limitNum)
      .limit(limitNum)
      .sort(sortOption);

    return res.status(200).json({
      success: true,
      totalReviews,
      currentPage: Number(page),
      totalPages: Math.ceil(totalReviews / limitNum),
      reviews,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const getMyProductReview = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { _id: userId } = req.user;

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID!" });
    }

    const product = await Product.findById(
      new mongoose.Types.ObjectId(`${productId}`)
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }

    const review = await Review.findOne({
      product: new mongoose.Types.ObjectId(`${productId}`),
      user: userId,
    }).populate("user", "name avatar.url");

    if (!review) {
      return res.status(200).json({ success: false });
    }

    return res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const addReview = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { _id: userId } = req.user;

    const { rating, title, reviewContent } = req.body;

    if (!rating || !title) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID!" });
    }

    const product = await Product.findById(
      new mongoose.Types.ObjectId(`${productId}`)
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }

    const reviewExists = await Review.findOne({
      product: new mongoose.Types.ObjectId(`${productId}`),
      user: userId,
    });

    if (reviewExists) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product!",
      });
    }

    const data = { rating, title };

    if (reviewContent) {
      data.reviewContent = reviewContent;
    }

    const newReview = await Review.create({
      product: productId,
      user: userId,
      ...data,
    });

    if (!newReview) {
      return res.status(400).json({
        success: false,
        message: "Failed to add review!",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Review added!",
      review: newReview,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id: reviewId } = req.params;
    const { _id: userId } = req.user;

    const { rating, title, reviewContent } = req.body;

    if (!rating || !title) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    if (!mongoose.isValidObjectId(reviewId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid review ID!" });
    }

    const data = { rating, title };

    if (reviewContent) {
      data.reviewContent = reviewContent;
    }

    const updatedReview = await Review.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(`${reviewId}`), user: userId },
      {
        ...data,
      }
    );

    if (!updatedReview) {
      return res.status(400).json({
        success: false,
        message: "Review not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review updated!",
      review: updatedReview,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id: reviewId } = req.params;
    const { _id: userId } = req.user;

    if (!mongoose.isValidObjectId(reviewId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid review ID!" });
    }

    const deletedReview = await Review.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(`${reviewId}`),
      user: userId,
    });

    if (!deletedReview) {
      return res.status(400).json({
        success: false,
        message: "Failed to delete review!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted!",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};
