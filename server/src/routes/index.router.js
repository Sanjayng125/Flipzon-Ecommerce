import express from "express";

const router = express.Router();

// Routes import
import UserRoutes from "./User.routes.js";
import ProductRoutes from "./Product.routes.js";
import CategoryRoutes from "./Category.routes.js";
import OrderRoutes from "./Order.routes.js";
import CheckoutSessionRoutes from "./CheckoutSession.routes.js";
import PaymentRoutes from "./Payment.routes.js";
import ReviewRoutes from "./Review.routes.js";
import AddressRoutes from "./Address.routes.js";
import CartRoutes from "./Cart.routes.js";
import WishlistRoutes from "./Wishlist.routes.js";
import CloudinaryRoutes from "./Cloudinary.routes.js";
import HeroRoutes from "./Hero.routes.js";
import OverviewRoutes from "./Overview.routes.js";

router.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    uptime: {
      hours: Math.floor(process.uptime() / 60 / 60),
      minutes: Math.floor(process.uptime() / 60),
      seconds: process.uptime(),
    },
    timestamp: Date.now(),
  });
});

router.use("/users", UserRoutes);
router.use("/products", ProductRoutes);
router.use("/categories", CategoryRoutes);
router.use("/orders", OrderRoutes);
router.use("/checkout", CheckoutSessionRoutes);
router.use("/payments", PaymentRoutes);
router.use("/reviews", ReviewRoutes);
router.use("/address", AddressRoutes);
router.use("/cart", CartRoutes);
router.use("/wishlist", WishlistRoutes);
router.use("/cloudinary", CloudinaryRoutes);
router.use("/hero", HeroRoutes);
router.use("/overview", OverviewRoutes);

export default router;
