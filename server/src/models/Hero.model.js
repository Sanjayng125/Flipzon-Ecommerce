import mongoose from "mongoose";

const heroSchema = new mongoose.Schema(
  {
    heroLink: {
      type: String,
      trim: true,
    },
    image: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const Hero = mongoose.model("Hero", heroSchema);
export default Hero;
