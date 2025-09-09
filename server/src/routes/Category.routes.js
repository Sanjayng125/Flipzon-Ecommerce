import express from "express";
import {
  addCategory,
  deleteCategory,
  getAllCategories,
  getAllFeaturedCategories,
  updateCategory,
} from "../controllers/Category.controller.js";
import { Auth, RoleCheck } from "../middlewares/index.js";

const router = express.Router();

router.get("/", getAllCategories);
router.get("/featured", getAllFeaturedCategories);

// Admin
router.post("/", Auth, RoleCheck("admin"), addCategory);
router.patch("/:id", Auth, RoleCheck("admin"), updateCategory);
router.delete("/:id", Auth, RoleCheck("admin"), deleteCategory);

export default router;
