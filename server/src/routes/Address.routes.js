import express from "express";
import {
  addAddress,
  getMyAddresses,
  removeAddress,
  setDefault,
  updateAddress,
} from "../controllers/Address.controller.js";
import { Auth, RoleCheck } from "../middlewares/index.js";

const router = express.Router();

router.get("/", Auth, RoleCheck(["user"]), getMyAddresses);
router.post("/", Auth, RoleCheck(["user"]), addAddress);
router.patch("/:id", Auth, RoleCheck(["user"]), updateAddress);
router.patch("/set-default/:id", Auth, RoleCheck(["user"]), setDefault);
router.delete("/:id", Auth, RoleCheck(["user"]), removeAddress);

export default router;
