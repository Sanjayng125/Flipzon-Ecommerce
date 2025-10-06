import express from "express";
import {
  banUser,
  becomeSeller,
  changePassword,
  deleteAccount,
  deleteUser,
  forgotPassword,
  getAllUsers,
  getUser,
  login,
  logout,
  resendOtp,
  resetPassword,
  sellerApprove,
  sellerReject,
  signup,
  updateProfile,
  verifyOtp,
} from "../controllers/User.controller.js";
import { Auth, RoleCheck } from "../middlewares/index.js";
import { rateLimit } from "express-rate-limit";

const RateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // Time window: 10 minutes
  max: 5, // Max 5 requests per IP in 15 minutes
  message: { success: false, message: "Too many requests. Try again later." },
});

const router = express.Router();

// Auth
router.post("/login", login);
router.post("/sign-up", signup);
router.post("/logout", Auth, logout);

// OTP
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

router.get("/user", Auth, getUser);
router.get("/become-seller", Auth, RoleCheck("user"), becomeSeller);
router.patch("/update-profile", Auth, updateProfile);
router.patch("/change-password", Auth, changePassword);
router.post("/forgot-password", RateLimiter, forgotPassword);
router.post("/reset-password", RateLimiter, resetPassword);
router.delete(
  "/delete-account",
  Auth,
  RoleCheck(["user", "seller"]),
  deleteAccount
);

// Admin
router.get("/get-users", Auth, RoleCheck("admin"), getAllUsers);
router.post("/ban-user/:id", Auth, RoleCheck("admin"), banUser);
router.delete("/delete-user/:id", Auth, RoleCheck("admin"), deleteUser);
router.patch("/seller-approve/:id", Auth, RoleCheck("admin"), sellerApprove);
router.patch("/seller-reject/:id", Auth, RoleCheck("admin"), sellerReject);

export default router;
