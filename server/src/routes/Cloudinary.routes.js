import express from "express";
import { Auth, RoleCheck } from "../middlewares/index.js";
import { deleteImages, getSign } from "../controllers/Cloudinary.controller.js";

const router = express.Router();

router.post("/upload", Auth, getSign);

router.delete("/delete", Auth, RoleCheck(["seller", "admin"]), deleteImages);

export default router;
