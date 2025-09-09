import express from "express";
import { Auth, RoleCheck } from "../middlewares/index.js";
import {
  createHero,
  getHeroes,
  removeHero,
} from "../controllers/Hero.controller.js";
const router = express.Router();

router.get("/", getHeroes);
router.post("/", Auth, RoleCheck("admin"), createHero);
router.delete("/:id", Auth, RoleCheck("admin"), removeHero);

export default router;
