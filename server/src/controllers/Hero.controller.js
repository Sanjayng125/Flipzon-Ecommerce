import mongoose from "mongoose";
import Hero from "../models/Hero.model.js";
import { checkAspectRatio, deleteImage } from "../utils/index.js";

export const getHeroes = async (req, res) => {
  try {
    const heros = await Hero.find().sort({ createdAt: -1 });

    return res.status(200).json({ success: true, heros });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const createHero = async (req, res) => {
  const { heroLink, image } = req.body;
  try {
    if (!image || !image?.url || !image?.public_id) {
      return res
        .status(400)
        .json({ success: false, message: "Hero image is required!" });
    }

    const isCorrectRatio = await checkAspectRatio("3:1", image.public_id);

    if (!isCorrectRatio) {
      deleteImage(image.public_id);
      return res.status(400).json({
        success: false,
        message: "Image aspect ratio must be 3:1",
      });
    }

    const data = {
      image,
    };

    if (heroLink) {
      data.heroLink = heroLink;
    }

    const newHero = await Hero.create(data);

    if (!newHero) {
      deleteImage(image.public_id);
      return res
        .status(400)
        .json({ success: false, message: "Failed to create Hero!" });
    }

    return res
      .status(201)
      .json({ success: true, message: "Hero created!", hero: newHero });
  } catch (error) {
    if (image?.public_id) {
      deleteImage(image.public_id);
    }
    if (error?.message?.includes("validation failed")) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields are missing!" });
    }
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const removeHero = async (req, res) => {
  try {
    const { id: heroId } = req.params;

    if (!heroId || !mongoose.isValidObjectId(heroId)) {
      return res
        .status(400)
        .json({ success: false, message: "Hero ID is required!" });
    }

    const hero = await Hero.findById(heroId);

    if (!hero) {
      return res
        .status(404)
        .json({ success: false, message: "Hero not found!" });
    }

    if (hero.image?.public_id) {
      await deleteImage(hero.image.public_id);
    }

    const deletedHero = await Hero.findByIdAndDelete(heroId);

    if (!deletedHero) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to remove Hero!" });
    }

    return res.status(200).json({ success: true, message: "Hero removed!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};
