import express from "express";
import { Auth } from "../middlewares/index.js";
import {
  addItem,
  clearWishlist,
  getWishlist,
  removeItem,
} from "../controllers/Wishlist.controller.js";

const router = express.Router();

router.get("/", Auth, getWishlist);
router.post("/:id", Auth, addItem);
router.patch("/:id", Auth, removeItem);
router.delete("/", Auth, clearWishlist);

export default router;
