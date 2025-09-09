import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dnugvoy3m/image/upload/v1742375376/flipzon-ecommerce/defaults/default-profile_ggqrh6.png",
      },
    },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      required: true,
    },
    storeName: String,
    storeLogo: {
      public_id: {
        type: String,
        default: null,
      },
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dnugvoy3m/image/upload/v1742911438/flipzon-ecommerce/defaults/default-store_czgdax.png",
      },
    },
    storeDescription: String,
    isSellerApproved: {
      type: Boolean,
      default: false,
    },
    isSellerRequested: {
      type: Boolean,
      default: false,
    },
    isSellerRejected: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
