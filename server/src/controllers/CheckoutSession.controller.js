import mongoose from "mongoose";
import Product from "../models/Product.model.js";
import CheckoutSession from "../models/CheckoutSession.model.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { items } = req.body;
    const { buyType } = req.query;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Items are required" });
    }

    if (items.length > 5) {
      return res.status(400).json({
        success: false,
        message: "You can order a maximum of 5 different products at a time.",
      });
    }

    const sessionItems = [];

    for (const item of items) {
      const { product: productId, quantity } = item;

      if (!productId || !mongoose.isValidObjectId(productId) || quantity <= 0) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid product or quantity" });
      }

      if (quantity > 3) {
        return res.status(400).json({
          success: false,
          message: "Quantity for each product cannot exceed 3.",
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: `Product not found: ${productId}` });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      sessionItems.push({
        product: product._id,
        quantity,
      });
    }

    const session = new CheckoutSession({
      user: userId,
      items: sessionItems,
      ...(buyType && { buyType }),
    });

    await session.save();

    res.status(201).json({ success: true, sessionId: session._id });
  } catch (error) {
    console.error("Create Checkout Session Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getCheckoutSession = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { sessionId } = req.params;

    if (!sessionId || !mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Session ID!",
      });
    }

    const session = await CheckoutSession.findOne({
      _id: sessionId,
      user: userId,
    }).populate("items.product");

    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Checkout session not found" });

    res.status(200).json({ success: true, session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
