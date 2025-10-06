import mongoose from "mongoose";
import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import { Cashfree } from "cashfree-pg";
import { sendRefundNotification } from "../utils/mailSender.js";

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

    const { id: orderId } = req.params;

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

    if (order_status === "EXPIRED" || order_status === "TERMINATED") {
      order.paymentStatus = "failed";
      order.paymentMethod = "Cashfree/Failed";

      order.items = order.items.map((item) => {
        item.status = "cancelled";
        item.cancelledAt = new Date();
        return item;
      });

      const bulkOps = order.items.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: [
            {
              $set: {
                stock: { $add: ["$stock", item.quantity] },
                sold: {
                  $max: [0, { $subtract: ["$sold", item.quantity] }],
                },
              },
            },
          ],
        },
      }));
      await Product.bulkWrite(bulkOps);

      await order.save();

      return res.status(200).json({
        success: true,
        message: "Payment failed, order cancelled.",
      });
    }

    if (order_status === "PAID") {
      order.paymentStatus = "paid";
      const { data: paymentData } = await Cashfree.PGOrderFetchPayment(
        CASHFREE_VERSION,
        order._id.toString()
      );

      if (paymentData) {
        order.paymentMethod = paymentData.payment_group || "Cashfree";
      }

      order.items = order.items.map((item) => {
        item.status = "processing";
        return item;
      });

      await order.save();

      return res.status(200).json({
        success: true,
        message: "Payment verification successful, your order is processing",
      });
    }
    if (order_status === "ACTIVE") {
      return res.status(200).json({
        success: true,
        message: "Payment is still processing, please wait for a few minutes",
      });
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
    const { payment_status, payment_group } = data.payment;

    const order = await Order.findById(order_id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (payment_status === "SUCCESS") {
      order.paymentStatus = "paid";
      order.paymentMethod = payment_group || "Cashfree";

      order.items = order.items.map((item) => {
        item.status = "processing";
        return item;
      });

      await order.save();

      return res
        .status(200)
        .json({ success: true, message: "Payment successful" });
    }

    if (
      payment_status === "FAILED" ||
      payment_status === "EXPIRED" ||
      payment_status === "USER_DROPPED"
    ) {
      order.paymentStatus = "failed";
      order.paymentMethod = "Cashfree/Failed";

      order.items = order.items.map((item) => {
        item.status = "cancelled";
        item.cancelledAt = new Date();
        return item;
      });

      const bulkOps = order.items.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: [
            {
              $set: {
                stock: { $add: ["$stock", item.quantity] },
                sold: {
                  $max: [0, { $subtract: ["$sold", item.quantity] }],
                },
              },
            },
          ],
        },
      }));
      await Product.bulkWrite(bulkOps);

      await order.save();

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

export const cashfreeRefundWebhook = async (req, res) => {
  try {
    try {
      await Cashfree.PGVerifyWebhookSignature(
        req.headers["x-webhook-signature"],
        req.rawBody,
        req.headers["x-webhook-timestamp"]
      );
    } catch (error) {
      console.error("Cashfree Refund Webhook Signature Error:", error?.message);
      return res.status(400).json({
        success: false,
        message: "Refund Webhook Signature Verification failed",
      });
    }

    const { data } = JSON.parse(req.rawBody) || req.body;
    if (!data || !data.refund) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund webhook payload",
      });
    }

    const { refund_id, refund_status, refund_amount, order_id } = data.refund;

    const order = await Order.findById(order_id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const itemIndex = order.items.findIndex(
      (item) => item._id.toString() === refund_id
    );
    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Refunded item not found in order" });
    }

    order.items[itemIndex].refundStatus = refund_status;
    order.items[itemIndex].refundedAmount = refund_amount;
    order.items[itemIndex].refundProcessedAt = new Date();

    await order.save();

    await sendRefundNotification(order.user.email, {
      customerName: order.user.name,
      orderId: order._id.toString(),
      itemId: order.items[itemIndex]._id.toString(),
      refundAmount: order.items[itemIndex].refundedAmount,
      refundStatus: order.items[itemIndex].refundStatus,
    });

    return res.status(200).json({
      success: true,
      message: "Refund webhook processed",
    });
  } catch (error) {
    console.error("Cashfree Refund Webhook Error:", error);
    return res.status(500).json({
      success: false,
      message: "Refund webhook handling failed",
    });
  }
};
