import express from "express";
import { Auth, RoleCheck } from "../middlewares/index.js";
import {
  addReview,
  deleteReview,
  getMyProductReview,
  getProductReviews,
  updateReview,
} from "../controllers/Review.controller.js";

const router = express.Router();

router.get("/:id", getProductReviews);
router.get("/my/:id", Auth, RoleCheck(["user"]), getMyProductReview);

router.post("/:id", Auth, RoleCheck(["user"]), addReview);
router.patch("/:id", Auth, RoleCheck(["user"]), updateReview);
router.delete("/:id", Auth, RoleCheck(["user"]), deleteReview);

export default router;
