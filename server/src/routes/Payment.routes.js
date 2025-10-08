import express from "express";
import {
  cashfreePaymentWebhook,
  cashfreeVerifyPayment,
  cashfreeRefundWebhook,
} from "../controllers/Payment.controller.js";
import { Auth, RoleCheck } from "../middlewares/index.js";

const router = express.Router();

router.get("/verify/:id", Auth, RoleCheck("user"), cashfreeVerifyPayment);
router.post("/webhook/payment", cashfreePaymentWebhook);
router.post("/webhook/refund", cashfreeRefundWebhook);

export default router;
