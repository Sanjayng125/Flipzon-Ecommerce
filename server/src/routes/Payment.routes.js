import express from "express";
import {
  cashfreeWebhook,
  cashfreeVerifyPayment,
} from "../controllers/Payment.controller.js";
import { Auth } from "../middlewares/index.js";

const router = express.Router();

router.post("/verify", Auth, cashfreeVerifyPayment);
router.post("/webhook", cashfreeWebhook);

export default router;
