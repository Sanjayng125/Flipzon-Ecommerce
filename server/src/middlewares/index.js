import jwt from "jsonwebtoken";
import { redis } from "../db/redis.js";
import mongoose from "mongoose";

export const Auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({
        success: false,
        message: "Authentication invalid",
        login: true,
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        login: true,
      });
    }

    let decoded = null;

    try {
      decoded = await jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error?.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired",
          login: true,
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        login: true,
      });
    }

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Session expired",
        login: true,
      });
    }

    let user = null;

    const cached = await redis.get(`user:${decoded._id}`);
    if (!cached) {
      return res.status(401).json({
        success: false,
        message: "Session expired",
        login: true,
      });
    }

    const parsed = JSON.parse(cached);
    user = { ...parsed, _id: new mongoose.Types.ObjectId(`${parsed._id}`) };

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found", login: true });
    }

    req.user = user;

    return next();
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
