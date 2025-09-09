import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { redis } from "../db/redis.js";
import mongoose from "mongoose";

export const Auth = async (req, res, next) => {
  try {
    const token = req?.cookies[process.env.COOKIE_NAME || "token"];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        login: true,
      });
    }

    try {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Session expired",
          login: true,
        });
      }

      let user = null;

      const cached = await redis.get(`user:${decoded._id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        user = { ...parsed, _id: new mongoose.Types.ObjectId(`${parsed._id}`) };
      } else {
        user = await User.findById(decoded._id).select("-password");
        if (user) {
          await redis.set(`user:${user._id}`, JSON.stringify(user));
        }
      }

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Account not found", login: true });
      }

      req.user = user;
      return next();
    } catch (error) {
      if (error?.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Session expired",
          login: true,
        });
      }
      return res.status(403).json({
        success: false,
        message: "Forbidden: Invalid token",
        login: true,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const RoleCheck = (roles) => (req, res, next) => {
  const userRole = req?.user?.role;

  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!userRole || !allowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: `Forbidden: Only ${
        allowedRoles.length === 1
          ? `${allowedRoles[0]} is`
          : `${allowedRoles.join(", ")} are`
      } allowed!`,
      login: true,
    });
  }

  return next();
};
