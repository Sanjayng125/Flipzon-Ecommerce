import slugify from "slugify";
import cloudinary from "./cloudinary.js";

export const makeSlug = (categoryName) => {
  return slugify(categoryName, {
    lower: true,
    strict: true,
    replacement: "-",
  });
};

export const checkAspectRatio = async (expectedRatio, publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);

    const actualRatio = result.width / result.height;

    // ("3:1" -> 3 / 1 = 3)
    const [w, h] = expectedRatio.split(":").map(Number);

    if (!w || !h || isNaN(w) || isNaN(h)) {
      return false;
    }

    const expected = w / h;

    return Math.abs(actualRatio - expected) < 0.06;
  } catch (err) {
    console.error("Failed to check aspect ratio:", err);
    return false;
  }
};

export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    return true;
  }
};

export const deleteManyImage = async (publicIds) => {
  try {
    await Promise.all(publicIds.map((id) => cloudinary.uploader.destroy(id)));
    return true;
  } catch (error) {
    return true;
  }
};

export const formatDate = (date, withTime = true) => {
  return new Date(date).toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(withTime && {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  });
};
