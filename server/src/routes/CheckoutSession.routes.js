import express from "express";
import {
  createCheckoutSession,
  getCheckoutSession,
} from "../controllers/CheckoutSession.controller.js";
import { Auth, RoleCheck } from "../middlewares/index.js";
const router = express.Router();

router.post("/create", Auth, RoleCheck("user"), createCheckoutSession);
router.get("/:sessionId", Auth, RoleCheck("user"), getCheckoutSession);

export default router;
