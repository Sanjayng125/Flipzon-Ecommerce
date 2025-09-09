import express from "express";
import { Auth, RoleCheck } from "../middlewares/index.js";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getSellerOrders,
  getSellerActiveOrders,
} from "../controllers/Order.controller.js";

const router = express.Router();

// User
router.post("/", Auth, RoleCheck("user"), createOrder);
router.get("/my-orders", Auth, RoleCheck("user"), getUserOrders);
router.put("/:id/cancel", Auth, RoleCheck("user"), cancelOrder);

// User, Seller and Admin
router.get("/:id", Auth, getOrderById);

// Seller
router.get("/seller/my-orders", Auth, RoleCheck("seller"), getSellerOrders);
router.get(
  "/seller/my-active-orders",
  Auth,
  RoleCheck("seller"),
  getSellerActiveOrders
);
router.put("/:id/status", Auth, RoleCheck("seller"), updateOrderStatus);

// Admin
router.get("/", Auth, RoleCheck("admin"), getAllOrders);

export default router;
