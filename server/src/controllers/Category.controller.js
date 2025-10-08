import mongoose from "mongoose";
import Category from "../models/Category.model.js";
import { deleteImage, makeSlug } from "../utils/index.js";

export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Bad request!" });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found!" });
    }

    return res.status(200).json({ success: true, category });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const {
      search,
      page = 1,
      limit = Infinity,
      sort,
      showInCategoryBar,
    } = req.query;

    let sortOption = {
      createdAt: -1,
    };

    if (sort && sort === "oldest") {
      sortOption.createdAt = 1;
    }

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (showInCategoryBar && showInCategoryBar === "true") {
      filter.showInCategoryBar = true;
      sortOption = {
        updatedAt: -1,
      };
      if (sort && sort === "oldest") {
        sortOption = {
          updatedAt: 1,
        };
      }
    }

    const categories = await Category.find(filter)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit) || 10)
      .sort(sortOption);

    const totalCategories = await Category.countDocuments(filter);

    res.json({
      success: true,
      categories,
      totalCategories,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCategories / Number(limit)),
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const getAllFeaturedCategories = async (req, res) => {
  try {
    const { sort } = req.query;

    let sortOption = {
      updatedAt: -1,
    };

    if (sort && sort === "oldest") {
      sortOption.updatedAt = 1;
    }

    const categories = await Category.find({
      isFeatured: true,
    }).sort(sortOption);

    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const addCategory = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "parentCategory",
      "image",
      "isFeatured",
      "showInCategoryBar",
    ];
    const categoryDataArr = Object.entries(req.body).filter(([key]) =>
      allowedFields.includes(key)
    );
    const categoryData = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    if (categoryDataArr.length <= 0 || !categoryData.name) {
      return res
        .status(400)
        .json({ success: false, message: "Mandatory fields are required!" });
    }

    const slug = makeSlug(categoryData.name);

    const existingCategory = await Category.findOne({
      name: categoryData.name,
      slug,
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists with this name or slug!",
      });
    }

    const data = {
      ...categoryData,
      slug,
    };

    const newCategory = await Category.create(data);

    if (!newCategory) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to create Category!" });
    }

    return res
      .status(201)
      .json({ success: true, message: "Category created!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID!" });
    }

    const allowedFields = [
      "name",
      "parentCategory",
      "image",
      "isFeatured",
      "showInCategoryBar",
    ];
    const categoryDataArr = Object.entries(req.body).filter(([key]) =>
      allowedFields.includes(key)
    );
    const categoryData = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );

    if (categoryDataArr.length <= 0) {
      return res.status(400).json({ success: false, message: "Bad request!" });
    }

    if (categoryData?.name) {
      categoryData.slug = makeSlug(categoryData.name);
    }

    const category = await Category.findById(id);

    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Category not found!" });
    }

    if (category.image?.public_id && categoryData?.image) {
      await deleteImage(category.image.public_id);
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, categoryData, {
      new: true,
    });

    if (!updatedCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to update category!" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Category updated!", updatedCategory });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID!" });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Category not found!" });
    }

    if (category.image?.public_id) {
      await deleteImage(category.image.public_id);
    }

    await Category.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ success: true, message: "Category deleted!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};
