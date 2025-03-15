import mongoose from "mongoose";

const connectToDb = async () => {
  try {
    if (!process.env.MONGO_DB_URI) {
      throw new Error("MongoDB URI is missing. Set MONGO_DB_URI in .env");
    }

    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("MongoDB connected 🍃");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectToDb;
