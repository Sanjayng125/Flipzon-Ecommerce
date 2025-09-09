import express from "express";
import { Auth, RoleCheck } from "../middlewares/index.js";
import {
  addItem,
  getCart,
  removeItem,
  removeProduct,
} from "../controllers/Cart.controller.js";

const router = express.Router();

router.get("/", Auth, RoleCheck(["user"]), getCart);
router.post("/:id", Auth, RoleCheck(["user"]), addItem);
router.patch("/:id", Auth, RoleCheck(["user"]), removeItem);
router.delete("/:id", Auth, RoleCheck(["user"]), removeProduct);

export default router;
