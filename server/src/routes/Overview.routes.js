import express from "express";
import { Auth, RoleCheck } from "../middlewares/index.js";
import {
  getAdminOverview,
  getSellerOverview,
} from "../controllers/Overview.controller.js";

const router = express.Router();

router.get("/admin", Auth, RoleCheck("admin"), getAdminOverview);
router.get("/seller", Auth, RoleCheck("seller"), getSellerOverview);

export default router;
