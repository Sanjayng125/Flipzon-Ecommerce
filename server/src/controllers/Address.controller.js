import mongoose from "mongoose";
import Address from "../models/Address.model.js";

export const getMyAddresses = async (req, res) => {
  try {
    const { _id: id } = req.user;

    const addresses = await Address.find({
      user: id,
    });

    return res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const addAddress = async (req, res) => {
  try {
    const { _id: id, phone } = req.user;

    const allowedFields = [
      "fullName",
      "phoneNumber",
      "streetAddress",
      "city",
      "state",
      "postalCode",
      "country",
    ];
    const addressDataArray = Object.entries(req.body).filter(
      ([key, val]) => allowedFields.includes(key) && `${val}` !== ""
    );

    if (addressDataArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Bad Request!",
      });
    }

    const addressData = Object.fromEntries(addressDataArray);

    const { fullName, streetAddress, city, state, postalCode } = addressData;

    if (!fullName || !streetAddress || !city || !state || !postalCode) {
      return res.status(400).json({
        success: false,
        message: "Mandatory fields are required!",
      });
    }

    if (!addressData?.phoneNumber) {
      addressData.phoneNumber = phone;
    }

    const addresses = await Address.find({
      user: id,
    });

    if (addresses.length === 0) {
      addressData.isDefault = true;
    }

    if (addresses.length >= 6) {
      return res.status(200).json({
        success: false,
        message: "You can only add upto 6 addresses!",
      });
    }

    const data = {
      user: id,
      ...addressData,
    };

    const newAddress = await Address.create(data);

    if (!newAddress) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to add address!" });
    }

    return res
      .status(201)
      .json({ success: true, message: "Address added!", address: newAddress });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { _id: id } = req.user;
    const { id: addressId } = req.params;

    if (!mongoose.isValidObjectId(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID!",
      });
    }

    const allowedFields = [
      "fullName",
      "phoneNumber",
      "streetAddress",
      "city",
      "state",
      "postalCode",
      "country",
      "isDefault",
    ];
    const addressDataArray = Object.entries(req.body).filter(
      ([key, val]) => allowedFields.includes(key) && `${val}` !== ""
    );

    if (addressDataArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nothing to change!",
      });
    }

    const addressData = Object.fromEntries(addressDataArray);

    const address = await Address.findOne({
      _id: new mongoose.Types.ObjectId(`${addressId}`),
      user: id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found!",
      });
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      new mongoose.Types.ObjectId(`${addressId}`),
      addressData
    );

    if (!updatedAddress) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to update address!" });
    }

    return res.status(200).json({
      success: true,
      message: "Address updated!",
      address: updatedAddress,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const setDefault = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id: addressId } = req.params;

    if (!mongoose.isValidObjectId(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID!",
      });
    }

    const address = await Address.findOne({
      _id: new mongoose.Types.ObjectId(`${addressId}`),
      user: userId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found!",
      });
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      new mongoose.Types.ObjectId(`${addressId}`),
      {
        isDefault: true,
      }
    );

    if (!updatedAddress) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to update address!" });
    }

    await Address.updateMany(
      { _id: { $ne: addressId }, user: userId },
      { $set: { isDefault: false } }
    );

    return res.status(200).json({
      success: true,
      message: "Default Address updated!",
      address: updatedAddress,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const removeAddress = async (req, res) => {
  try {
    const { _id: id } = req.user;
    const { id: addressId } = req.params;

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Address ID is required!",
      });
    }

    const address = await Address.findOne({
      _id: new mongoose.Types.ObjectId(`${addressId}`),
      user: id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found!",
      });
    }

    await Address.findByIdAndDelete(addressId);

    return res.status(200).json({
      success: true,
      message: "Address removed!",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};
