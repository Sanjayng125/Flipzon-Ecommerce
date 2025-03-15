import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middleware
app.use(
  cors({
    // origin: process.env.CLIENT_URL || "http://localhost:3000",
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Router import
import Router from "./routes/index.routes.js";

app.use("/api", Router);

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
