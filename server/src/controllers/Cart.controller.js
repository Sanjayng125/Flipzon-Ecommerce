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

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{ product, quantity: 1 }],
      });

      return res.status(200).json({
        success: true,
        message: "Item added to cart!",
        cart,
      });
    }

    const itemExists = cart.items.some(
      (item) => item.product.toString() === product
    );

    if (itemExists) {
      return res.status(400).json({
        success: false,
        message: "Item already exists in cart!",
        cart,
      });
    }

    if (cart.items.length >= 5) {
      return res.status(400).json({
        success: false,
        message: "You can only add upto 5 products to cart at a time!",
      });
    }

    cart.items.push({ product, quantity: 1 });
    await cart.save();

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

export const updateQty = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id: product } = req.params;
    const { qty } = req.body;

    if (!mongoose.isValidObjectId(product)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID!" });
    }

    if (!qty || isNaN(qty) || qty < 1 || qty > 3) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be between 1 and 3!",
      });
    }

    const updatedCart = await Cart.findOneAndUpdate(
      { user: userId, "items.product": product },
      { "items.$.quantity": qty },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item quantity updated!",
      cart: updatedCart,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
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
