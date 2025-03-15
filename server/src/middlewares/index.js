import jwt from "jsonwebtoken";

export const Auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token

    jwt.verify(token, process.env.NEXTAUTH_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Forbidden: Invalid token" });
      }

      req.user = decoded; // Attach user data to request
      next();
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const RoleCheck = (role) => (req, res, next) => {
  if (req?.user?.role !== role) {
    return res.status(403).json({
      success: false,
      message: `Forbidden: Only ${role}s are allowed!`,
    });
  }
  next();
};
