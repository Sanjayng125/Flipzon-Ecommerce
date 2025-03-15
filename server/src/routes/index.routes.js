import express from "express";

const router = express.Router();

// Routes import
import UserRoutes from "./User.routes.js";
import ProductRoutes from "./Product.routes.js";
import CategoryRoutes from "./Category.routes.js";
import OrderRoutes from "./Order.routes.js";
import ReviewRoutes from "./Review.routes.js";

router.use("/users", UserRoutes);
router.use("/products", ProductRoutes);
router.use("/categories", CategoryRoutes);
router.use("/orders", OrderRoutes);
router.use("/reviews", ReviewRoutes);

export default router;
