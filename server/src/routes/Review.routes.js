import express from "express";
import { Auth } from "../middlewares/index.js";
import {
  addReview,
  deleteReview,
  getProductReviews,
  updateReview,
} from "../controllers/Review.controller.js";

const router = express.Router();

router.get("/:id", getProductReviews);

router.post("/:id", Auth, addReview);
router.patch("/:id", Auth, updateReview);
router.delete("/:id", Auth, deleteReview);

export default router;
