import express from "express";
import {
  createProduct,
  deleteProduct,
  getMyProducts,
  getProduct,
  getProducts,
  getSimilarProducts,
  updateProduct,
  updateProductFeatured,
} from "../controllers/Product.controller.js";
import { Auth, RoleCheck } from "../middlewares/index.js";

const router = express.Router();

router.get("/", getProducts); // All, search, sort, featured, and category
router.get("/similar/:categoryId/:productId", getSimilarProducts);
router.get("/:id", getProduct);

router.get("/seller/mine", Auth, RoleCheck(["seller"]), getMyProducts);
router.post("/", Auth, RoleCheck(["seller"]), createProduct);
router.patch("/:id", Auth, RoleCheck(["seller"]), updateProduct);
router.patch(
  "/featured/:id",
  Auth,
  RoleCheck(["admin"]),
  updateProductFeatured
);
router.delete("/:id", Auth, RoleCheck(["admin", "seller"]), deleteProduct);

export default router;
