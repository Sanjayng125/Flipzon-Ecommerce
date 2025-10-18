import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString(); // Store raw body before parsing necessary for cashfree webhook.
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Router
import Router from "./routes/index.router.js";

app.use("/api", Router);

export default app;
