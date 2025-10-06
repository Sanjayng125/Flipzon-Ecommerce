import express from "express";
import { Auth, RoleCheck } from "../middlewares/index.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getSellerOrders,
  getSellerActiveOrders,
} from "../controllers/Order.controller.js";

const router = express.Router();

// User
router.post("/create", Auth, RoleCheck("user"), createOrder);
router.get("/my-orders", Auth, RoleCheck("user"), getMyOrders);

// User & Seller
router.put("/:id/cancel", Auth, RoleCheck(["user", "seller"]), cancelOrder);

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
router.put("/seller/:id/status", Auth, RoleCheck("seller"), updateOrderStatus);

// Admin
router.get("/", Auth, RoleCheck("admin"), getAllOrders);

export default router;
