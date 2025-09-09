import mongoose from "mongoose";
import Address from "../models/Address.model.js";
import Cart from "../models/Cart.model.js";
import Otp from "../models/Otp.model.js";
import Product from "../models/Product.model.js";
import ResetPassword from "../models/ResetPassword.model.js";
import Review from "../models/Review.model.js";
import User from "../models/User.model.js";
import Wishlist from "../models/Wishlist.model.js";
import cloudinary from "../utils/cloudinary.js";
import { sendOtp, sendResetPassword } from "../utils/mailSender.js";
import { generateOTP } from "../utils/otp.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import jwt from "jsonwebtoken";
import { redis } from "../db/redis.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    const validUser = await User.findOne({ email });

    // user check
    if (!validUser) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found!" });
    }

    // password check
    const isPasswordValid = await verifyPassword(password, validUser.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect credentials!" });
    }

    // verified check
    if (!validUser.isVerified) {
      // Generate OTP
      const generatedOtp = generateOTP();

      let otpExists = await Otp.findOne({ email });

      if (!otpExists) {
        otpExists = await Otp.create({ email, otp: generatedOtp });

        if (!otpExists) {
          return res.status(500).json({
            success: false,
            message: "Failed to generate OTP. Try again later!",
          });
        }

        // Send OTP email
        const sendOtpResponse = await sendOtp(email, otpExists.otp);
        if (sendOtpResponse?.error) {
          return res.status(500).json({
            success: false,
            message: "Failed to send OTP. Try again later!",
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: "Verification email sent!",
        to_verify: true,
      });
    }

    const { password: pass, ...rest } = validUser._doc;

    const accessToken = jwt.sign(
      {
        _id: validUser._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie(process.env.COOKIE_NAME || "token", accessToken, {
      httpOnly: true,
      secure: process.env?.NODE_ENV === "production" ? true : false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await redis.set(`user:${rest._id}`, JSON.stringify(rest));

    return res
      .status(200)
      .json({ success: true, message: "Logged in", user: rest });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    // Generate OTP
    const generatedOtp = generateOTP();

    if (existingUser) {
      if (!existingUser.isVerified) {
        // Check if OTP exists for the user
        let otpExists = await Otp.findOne({ email });

        if (!otpExists) {
          otpExists = await Otp.create({ email, otp: generatedOtp });

          if (!otpExists) {
            return res.status(500).json({
              success: false,
              message: "Failed to generate OTP. Try again later!",
            });
          }

          // Send OTP email
          const sendOtpResponse = await sendOtp(email, otpExists.otp);
          if (sendOtpResponse?.error) {
            return res.status(500).json({
              success: false,
              message: "Failed to send OTP. Try again later!",
            });
          }
        }

        return res.status(200).json({
          success: true,
          message: "Verification email sent!",
          to_verify: true,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Account already exists please login!",
        login: true,
      });
    }

    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });
    if (!newUser) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to create account!" });
    }

    // Create OTP entry
    const newOtp = await Otp.create({ email, otp: generatedOtp });
    if (!newOtp) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate OTP. Try again later!",
      });
    }

    // Send OTP verification email
    const sendOtpResponse = await sendOtp(email, newOtp.otp);
    if (sendOtpResponse?.error) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Try again later!",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Account created. Verification email sent!",
      to_verify: true,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const logout = async (req, res) => {
  try {
    const user = req.user;

    res.clearCookie(process.env.COOKIE_NAME || "token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    await redis.del(`user:${user._id}`);

    return res.status(200).json({ success: true, message: "Logged out!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    let { otp, email } = req.body;

    if (!otp || !email) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    const validUser = await User.findOne({ email });

    if (!validUser) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found!" });
    }

    const otpExists = await Otp.findOne({ email });

    if (!otpExists) {
      return res
        .status(400)
        .json({ success: false, message: "OTP expired!", resend: true });
    }

    if (otpExists?.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP!" });
    }

    await User.findOneAndUpdate(
      { email },
      {
        isVerified: true,
      },
      { new: true }
    );

    await Otp.findOneAndDelete({ email });

    return res
      .status(200)
      .json({ success: true, message: "Account verified! You can login." });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const resendOtp = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    email = email.trim();

    const validUser = await User.findOne({ email });

    if (!validUser || validUser.isVerified) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found!" });
    }

    let otpExists = await Otp.findOne({ email });

    if (!otpExists) {
      // Generate OTP
      const generatedOtp = generateOTP();

      otpExists = await Otp.create({ email, otp: generatedOtp });

      if (!otpExists) {
        return res.status(500).json({
          success: false,
          message: "Failed to generate OTP. Try again later!",
        });
      }

      // Send OTP email
      const sendOtpResponse = await sendOtp(email, otpExists.otp);
      if (sendOtpResponse?.error) {
        return res.status(500).json({
          success: false,
          message: "Failed to send OTP. Try again later!",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Verification email sent!",
      });
    }

    return res.status(200).json({
      success: false,
      message: "Verification email already sent!",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const getUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Profile: Ok",
      user: req.user,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const becomeSeller = async (req, res) => {
  try {
    const {
      _id: userId,
      isSellerRequested,
      isSellerApproved,
      isSellerRejected,
    } = req.user;

    if (isSellerApproved) {
      return res.status(400).json({
        success: false,
        message: "You are already a seller!",
      });
    }

    if (isSellerRejected) {
      return res.status(400).json({
        success: false,
        message: "Your request has been rejected!",
      });
    }

    if (isSellerRequested) {
      return res.status(400).json({
        success: false,
        message: "You already requested. wait for approval!",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isSellerRequested: true,
      },
      { new: true }
    ).select("-password");

    if (user) await redis.set(`user:${user._id}`, JSON.stringify(user));

    return res.status(200).json({
      success: true,
      message: "Request sent to become seller!",
      user,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { _id: id, role, isSellerApproved } = req.user;
    const data = req.body;

    let allowedFields = ["name", "phone", "avatar"];

    if (role === "seller" && isSellerApproved) {
      allowedFields = allowedFields.concat([
        "storeLogo",
        "storeName",
        "storeDescription",
      ]);
    }

    const dataArray = Object.entries(data).filter(([key]) =>
      allowedFields.includes(key)
    );

    if (dataArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update!",
      });
    }

    const updateData = Object.fromEntries(dataArray);

    const userExits = await User.findById(id);

    if (!userExits) {
      return res
        .status(404)
        .json({ success: false, message: "Account not found!" });
    }

    // delete previous avatar and store logo if exists
    if (updateData?.avatar && userExits?.avatar?.public_id) {
      await cloudinary.uploader.destroy(userExits.avatar.public_id);
    } else if (updateData?.storeLogo && userExits?.storeLogo?.public_id) {
      await cloudinary.uploader.destroy(userExits.storeLogo.public_id);
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (user) await redis.set(`user:${user._id}`, JSON.stringify(user));

    return res
      .status(200)
      .json({ success: true, message: "Profile updated", user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { _id: id } = req.user;

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    const user = await User.findById(id);

    const isPassMatch = await verifyPassword(oldPassword, user.password);

    if (!isPassMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password!" });
    }

    const hashedPassword = await hashPassword(newPassword);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        password: hashedPassword,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to update password!" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Password updated!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required!" });
    }

    const user = await User.findOne({ email });

    if (user) {
      const token = await jwt.sign(
        { id: user._id, email: email },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
      );

      if (token) {
        await ResetPassword.deleteMany({ email });

        const newReset = await ResetPassword.create({
          email,
          passwordResetToken: token,
        });

        if (newReset) {
          // Send reset link email
          if (process.env.CLIENT_URL) {
            const url = `${process.env.CLIENT_URL}/reset-password?user=${email}&token=${token}`;
            const sendResetEmailResponse = await sendResetPassword(email, url);
            if (!sendResetEmailResponse || sendResetEmailResponse?.error) {
              return res.status(500).json({
                success: false,
                message: "Failed to send email. Try again later!",
              });
            }
          }
        }
      }
    }

    return res
      .status(200)
      .json({ success: true, message: "Check your Email to reset password!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: "Bad request!" });
    }

    if (decoded && decoded?.id && decoded?.email && decoded?.email === email) {
      const user = await User.findOne({
        _id: decoded.id,
        email: decoded.email,
      });

      if (user) {
        const resetToken = await ResetPassword.findOne({
          email: decoded.email,
        });

        if (resetToken && resetToken?.passwordResetToken === token) {
          const hashedPassword = await hashPassword(newPassword);

          user.password = hashedPassword;
          await user.save();
          await ResetPassword.deleteOne({ email });

          return res
            .status(200)
            .json({ success: true, message: "Password reset successful!" });
        }
      }
    }

    return res.status(400).json({ success: false, message: "Bad request!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { _id: id, role } = req.user;

    if (role === "seller") {
      await Product.deleteMany({ seller: id });
    }

    await Promise.all([
      Address.deleteMany({ user: id }),
      Review.deleteMany({ user: id }),
      Cart.deleteOne({ user: id }),
      Wishlist.deleteOne({ user: id }),
    ]);

    await User.findByIdAndDelete(id);

    res.clearCookie(process.env.COOKIE_NAME || "token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    await redis.del(`user:${id}`);

    return res.status(200).json({
      success: true,
      message: "Account deleted!",
      login: true,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { sort, search, page = 1, limit = 10, seller, requests } = req.query;

    let filter = {
      role: "user",
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (seller) {
      filter.role = "seller";
    }
    if (requests) {
      filter.isSellerRequested = true;
      filter.isSellerRejected = false;
      filter.isSellerApproved = false;
    }

    const sortOptions = {
      createdAt: -1,
    };

    if (sort && sort === "oldest") {
      sortOptions.createdAt = 1;
    }

    const totalUsers = await User.countDocuments(filter);

    const users = await User.aggregate([
      {
        $match: filter,
      },
      { $sort: sortOptions },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
    ]);

    return res.status(200).json({
      success: true,
      users,
      totalUsers,
      currentPage: Number(page),
      totalPages: Math.ceil(totalUsers / limit),
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID!" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "You cant delete another admin account!",
      });
    }

    if (user.role === "seller") {
      await Product.deleteMany({ seller: id });
    }

    await Promise.all([
      Address.deleteMany({ user: id }),
      Review.deleteMany({ user: id }),
      Cart.deleteOne({ user: id }),
      Wishlist.deleteOne({ user: id }),
    ]);

    await User.findByIdAndDelete(id);
    await redis.del(`user:${id}`);

    return res.status(200).json({
      success: true,
      message: "Account deleted!",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const sellerApprove = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID!" });
    }

    const user = await User.findOne({
      _id: id,
      isSellerRequested: true,
      isSellerApproved: false,
      isSellerRejected: false,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    await User.findByIdAndUpdate(id, {
      role: "seller",
      isSellerApproved: true,
      isSellerRequested: false,
      isSellerRejected: false,
    });

    return res
      .status(200)
      .json({ success: true, message: "User request approved!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const sellerReject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid User ID!" });
    }

    const user = await User.findOne({
      _id: id,
      isSellerRequested: true,
      isSellerApproved: false,
      isSellerRejected: false,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    await User.findByIdAndUpdate(id, {
      isSellerRequested: false,
      isSellerApproved: false,
      isSellerRejected: true,
    });

    return res
      .status(200)
      .json({ success: true, message: "User request rejected!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};
