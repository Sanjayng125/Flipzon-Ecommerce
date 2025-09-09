import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectToDb from "./src/db/index.js";
import { connectRedis } from "./src/db/redis.js";

const init = async () => {
  await connectToDb();
  await connectRedis();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

init();
