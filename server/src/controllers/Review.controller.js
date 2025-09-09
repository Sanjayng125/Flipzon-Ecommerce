import mongoose from "mongoose";
import Product from "../models/Product.model.js";
import Review from "../models/Review.model.js";

export const getProductReviews = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { page = 1, limit = 4 } = req.query;

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

    const reviews = await Review.find({
      product: new mongoose.Types.ObjectId(`${productId}`),
    })
      .populate("user", "name avatar")
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      reviews,
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

    const { rating, comment } = req.body;

    if (!rating) {
      return res
        .status(400)
        .json({ success: false, message: "Rating is required!" });
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

    const data = { rating };

    if (comment) {
      data.comment = comment;
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

    const { rating, comment } = req.body;

    if (!rating) {
      return res
        .status(400)
        .json({ success: false, message: "Rating is required!" });
    }

    if (!mongoose.isValidObjectId(reviewId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid review ID!" });
    }

    const review = await Review.findOne({
      _id: new mongoose.Types.ObjectId(`${reviewId}`),
      user: userId,
    });

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found!" });
    }

    const data = { rating };

    if (comment) {
      data.comment = comment;
    }

    const updatedReview = await Review.findOneAndUpdate({
      _id: new mongoose.Types.ObjectId(`${reviewId}`),
      user: userId,
      ...data,
    });

    if (!updatedReview) {
      return res.status(400).json({
        success: false,
        message: "Failed to update review!",
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
