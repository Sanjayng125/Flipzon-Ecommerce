import express from "express";
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  getAllFeaturedCategories,
  getCategory,
  updateCategory,
} from "../controllers/Category.controller.js";
import { Auth, RoleCheck } from "../middlewares/index.js";

const router = express.Router();

router.get("/", getAllCategories);
router.get("/featured", getAllFeaturedCategories);
router.get("/:id", getCategory);

// Admin
router.post("/", Auth, RoleCheck("admin"), addCategory);
router.patch("/:id", Auth, RoleCheck("admin"), updateCategory);
router.delete("/:id", Auth, RoleCheck("admin"), deleteCategory);

export default router;
