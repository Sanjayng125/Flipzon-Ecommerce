import mongoose from "mongoose";
import Cart from "../models/Cart.model.js";

export const getCart = async (req, res) => {
  try {
    const { _id: userId } = req.user;

    let cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "-stock -sold -isFeatured -createdAt -updatedAt -__v",
      populate: {
        path: "seller",
        select: "_id name",
      },
    });

    if (!cart) {
      return res.status(200).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const invalidItems = cart.items.filter((item) => item.product === null);

    if (invalidItems.length > 0) {
      cart.items = cart.items.filter((item) => item.product !== null);
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("getCart error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const addItem = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id: product } = req.params;

    if (!mongoose.isValidObjectId(product)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID!" });
    }

    let cart = await Cart.findOneAndUpdate(
      { user: userId, "items.product": product },
      { $inc: { "items.$.quantity": 1 } },
      { new: true }
    );

    if (!cart) {
      cart = await Cart.findOneAndUpdate(
        { user: userId },
        { $push: { items: { product, quantity: 1 } } },
        { new: true, upsert: true } // Upsert ensures a cart is created if it doesn't exist
      );
    }

    return res.status(200).json({
      success: true,
      message: "Item added to cart!",
      cart,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const removeItem = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id: product } = req.params;

    if (!mongoose.isValidObjectId(product)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID!" });
    }

    const cart = await Cart.findOne({
      user: userId,
      "items.product": product,
    });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found!" });
    }

    const item = cart.items.find((item) => item.product.toString() === product);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart!" });
    }

    if (item.quantity > 1) {
      await Cart.updateOne(
        { user: userId, "items.product": product },
        { $inc: { "items.$.quantity": -1 } }
      );
    } else {
      await Cart.updateOne(
        { user: userId },
        { $pull: { items: { product: product } } }
      );
    }

    const updatedCart = await Cart.findOne({ user: userId });

    return res.status(200).json({
      success: true,
      message: "Item updated in cart!",
      cart: updatedCart,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const removeProduct = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id: product } = req.params;

    if (!mongoose.isValidObjectId(product)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID!" });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { product: product } } },
      { new: true }
    );

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found!" });
    }

    return res.status(200).json({
      success: true,
      message: "Item removed from cart!",
      cart,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};
