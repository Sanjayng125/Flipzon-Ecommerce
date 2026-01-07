import cloudinary from "../utils/cloudinary.js";
import { deleteManyImage } from "../utils/index.js";

export const getSign = async (req, res) => {
  try {
    const { folder } = req.body;

    const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
    const CLOUDINARY_UPLOAD_API = process.env.CLOUDINARY_UPLOAD_API;
    const BASE_FOLDER = process.env.CLOUDINARY_BASE_FOLDER;

    if (!CLOUDINARY_API_KEY || !CLOUDINARY_UPLOAD_API || !BASE_FOLDER) {
      return res
        .status(500)
        .json({ success: false, message: "Server config error!" });
    }

    const finalFolder = `${BASE_FOLDER}/${folder}`;

    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: finalFolder },
      process.env.CLOUDINARY_API_SECRET
    );

    return res.status(200).json({
      success: true,
      signature,
      timestamp,
      folder: finalFolder,
      cloudinaryApiKey: CLOUDINARY_API_KEY,
      cloudinaryUploadApi: CLOUDINARY_UPLOAD_API,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const deleteImages = async (req, res) => {
  try {
    const { public_ids } = req.body;
    if (!public_ids || !Array.isArray(public_ids) || public_ids.length < 1) {
      return res.status(400).json({ success: false, message: "Bad request!" });
    }

    await deleteManyImage(public_ids);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};
