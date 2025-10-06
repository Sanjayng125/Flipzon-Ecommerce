import express from "express";
import {
  cashfreeWebhook,
  cashfreeVerifyPayment,
  cashfreeRefundWebhook,
} from "../controllers/Payment.controller.js";
import { Auth, RoleCheck } from "../middlewares/index.js";

const router = express.Router();

router.get("/verify/:id", Auth, RoleCheck("user"), cashfreeVerifyPayment);
router.post("/webhook/payment", cashfreeWebhook);
router.post("/webhook/refund", cashfreeRefundWebhook);

export default router;
