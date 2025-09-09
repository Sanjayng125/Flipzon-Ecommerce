import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL,
});

export const connectRedis = async () => {
  try {
    redis.on("connect", () => {
      console.log("Redis connected ✅");
    });
    redis.on("error", (err) => {
      console.log("Redis connection failed ❌");
      throw new Error(err);
    });

    await redis.connect();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
