import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    image: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dnugvoy3m/image/upload/v1756474868/flipzon-ecommerce/defaults/default-category-2_l62rfw.jpg",
      },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", CategorySchema);
export default Category;
