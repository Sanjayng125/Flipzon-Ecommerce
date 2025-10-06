import mongoose from "mongoose";

const checkoutSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    buyType: {
      type: String,
      enum: ["buy-now", "cart-checkout"],
      default: "buy-now",
    },
  },
  { timestamps: true }
);

checkoutSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1800 }); // 30 mins

const CheckoutSession = mongoose.model(
  "CheckoutSession",
  checkoutSessionSchema
);
export default CheckoutSession;
