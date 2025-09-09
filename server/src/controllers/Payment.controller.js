import mongoose from "mongoose";
import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import { Cashfree } from "cashfree-pg";

const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;
const CASHFREE_VERSION = process.env.CASHFREE_VERSION;

Cashfree.XClientId = CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = CASHFREE_CLIENT_SECRET;
Cashfree.XEnvironment =
  process.env.CASHFREE_APP_ENV === "production"
    ? Cashfree.Environment.PRODUCTION
    : Cashfree.Environment.SANDBOX;

export const cashfreeVerifyPayment = async (req, res) => {
  try {
    if (!CASHFREE_CLIENT_ID || !CASHFREE_CLIENT_SECRET || !CASHFREE_VERSION) {
      return res.status(500).json({ success: false, message: "Server error!" });
    }

    const { orderId } = req.body;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required!" });
    }

    if (!mongoose.isValidObjectId(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Order ID!" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.paymentStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Payment already processed!",
      });
    }

    const response = await Cashfree.PGFetchOrder(CASHFREE_VERSION, orderId);
    const data = response.data;

    if (!data) {
      return res
        .status(500)
        .json({ success: false, message: "Payment verification failed" });
    }

    const { order_status } = data;

    if (order_status === "EXPIRED" || order_status === "FAILED") {
      order.paymentStatus = "failed";

      order.items = order.items.map((item) => ({
        ...item.toObject(),
        status: "cancelled",
        cancelledAt: new Date(),
      }));

      const bulkOps = order.items.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: item.quantity, sold: -item.quantity } },
        },
      }));
      await Product.bulkWrite(bulkOps);

      await order.save();

      await Product.updateMany({ sold: { $lt: 0 } }, { $set: { sold: 0 } }); // resets to 0 if by any chance sold goes negative...

      return res.status(200).json({
        success: true,
        message: "Payment failed, order cancelled.",
      });
    }

    if (order_status === "PAID") {
      order.paymentStatus = "paid";

      order.items = order.items.map((item) => ({
        ...item.toObject(),
        status: "processing",
      }));

      await order.save();

      return res
        .status(200)
        .json({ success: true, message: "Payment successful" });
    }
    if (order_status === "ACTIVE") {
      return res
        .status(200)
        .json({ success: true, message: "Payment still processing" });
    }

    return res.status(400).json({
      success: false,
      message:
        `Payment ${order_status?.toLocaleLowerCase()}` || "Payment failed",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Verification failed" });
  }
};

export const cashfreeWebhook = async (req, res) => {
  try {
    try {
      await Cashfree.PGVerifyWebhookSignature(
        req.headers["x-webhook-signature"],
        req.rawBody,
        req.headers["x-webhook-timestamp"]
      );
    } catch (error) {
      console.error("Cashfree Webhook Signature Error:", error?.message);
      return res.status(400).json({
        success: false,
        message: "Webhook Signature Verification failed",
      });
    }

    const { data } = JSON.parse(req.rawBody) || req.body;

    if (!data || !data.order || !data.payment) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid webhook payload" });
    }

    const { order_id } = data.order;
    const { payment_status } = data.payment;

    const order = await Order.findById(order_id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (payment_status === "SUCCESS") {
      order.paymentStatus = "paid";

      order.items = order.items.map((item) => ({
        ...item.toObject(),
        status: "processing",
      }));

      await order.save();

      return res
        .status(200)
        .json({ success: true, message: "Payment successful" });
    }

    if (payment_status === "FAILED" || payment_status === "EXPIRED") {
      order.paymentStatus = "failed";

      order.items = order.items.map((item) => ({
        ...item.toObject(),
        status: "cancelled",
        cancelledAt: new Date(),
      }));

      const bulkOps = order.items.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: item.quantity, sold: -item.quantity } },
        },
      }));
      await Product.bulkWrite(bulkOps);

      await order.save();

      await Product.updateMany({ sold: { $lt: 0 } }, { $set: { sold: 0 } });

      return res.status(200).json({
        success: true,
        message: "Payment failed, order cancelled.",
      });
    }

    return res.status(400).json({
      success: false,
      message: `Unhandled payment status: ${payment_status}`,
    });
  } catch (error) {
    console.error("Cashfree Webhook Error:", error);
    return res.status(500).json({
      success: false,
      message: "Webhook handling failed",
    });
  }
};
