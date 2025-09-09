import mongoose from "mongoose";

const resetPasswordSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordResetToken: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 10 * 60, // 10 minutes
  },
});

const ResetPassword = mongoose.model("ResetPassword", resetPasswordSchema);
export default ResetPassword;
