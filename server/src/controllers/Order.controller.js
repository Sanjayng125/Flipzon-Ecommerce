import mongoose from "mongoose";
import Order from "../models/Order.model.js";
import Cart from "../models/Cart.model.js";
import Product from "../models/Product.model.js";

import { Cashfree } from "cashfree-pg";

const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;
const CASHFREE_VERSION = process.env.CASHFREE_VERSION;

Cashfree.XClientId = CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = CASHFREE_CLIENT_SECRET;
Cashfree.XEnvironment =
  process.env.CASHFREE_APP_ENV === "production"
    ? Cashfree.Environment.PRODUCTION
    : Cashfree.Environment.SANDBOX;

export const createOrder = async (req, res) => {
  try {
    if (!CASHFREE_CLIENT_ID || !CASHFREE_CLIENT_SECRET || !CASHFREE_VERSION) {
      return res.status(500).json({ success: false, message: "Server error!" });
    }

    const { _id: userId, phone, email, name } = req.user;
    const {
      shippingAddress,
      paymentMethod = "Cashfree",
      productId,
      quantity,
      currency,
    } = req.body;

    if (!shippingAddress) {
      return res
        .status(400)
        .json({ success: false, message: "Mandatory fields are required!" });
    }

    let items = [];
    let totalAmount = 0;

    if (productId) {
      if (!mongoose.isValidObjectId(productId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Product ID!" });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found!" });
      }

      if (quantity <= 0) {
        return res
          .status(400)
          .json({ success: false, message: "Quantity must be at least 1!" });
      }

      if (product.stock < quantity) {
        return res
          .status(400)
          .json({ success: false, message: "Insufficient stock!" });
      }

      const price = product?.discount
        ? product.price - (product.price * product.discount) / 100
        : product.price;

      totalAmount = price * quantity;

      items.push({
        product: product._id,
        quantity,
        seller: product.seller,
        price,
      });
    } else {
      const cart = await Cart.findOne({ user: userId }).populate(
        "items.product"
      );
      if (!cart || cart.items.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Cart is empty!" });
      }

      for (let item of cart.items) {
        if (item.product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${item.product.name}`,
          });
        }
      }

      items = cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        seller: item.product.seller,
        price: item.product.discount
          ? item.product.price -
            (item.product.price * item.product.discount) / 100
          : item.product.price,
      }));

      totalAmount = cart.items.reduce((total, item) => {
        const price = item.product.discount
          ? item.product.price -
            (item.product.price * item.product.discount) / 100
          : item.product.price;
        return total + price * item.quantity;
      }, 0);

      await Cart.findOneAndUpdate(
        { user: userId },
        {
          items: [],
        }
      );
    }

    const order = new Order({
      user: { userId, phone, email },
      items,
      totalAmount,
      paymentMethod,
      shippingAddress,
    });

    const paymentData = {
      order_id: order._id.toString(),
      order_amount: order.totalAmount,
      order_currency: currency ?? "INR",
      customer_details: {
        customer_name: name,
        customer_id: userId.toString(),
        customer_email: order.user.email,
        customer_phone: order.user.phone,
      },
      order_meta: {
        return_url: `${process.env.CLIENT_URL}/orders/${order._id.toString()}`,
        notify_url: `${process.env.SERVER_URL}/api/payments/webhook`,
      },
      order_expiry_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    };

    const paymentOrderRes = await Cashfree.PGCreateOrder(
      CASHFREE_VERSION,
      paymentData
    );
    const data = paymentOrderRes.data;

    if (paymentOrderRes.status !== 200 || !data?.payment_session_id) {
      return res
        .status(500)
        .json({ success: false, message: "Payment initiation failed" });
    }

    await order.save();

    for (let item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order,
      paymentSessionId: data.payment_session_id,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.aggregate([
      {
        $match: { "user.userId": req.user._id },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          let: { productId: "$items.product" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$productId"] } } },
            {
              $project: {
                stock: 0,
                sold: 0,
                isFeatured: 0,
                createdAt: 0,
                updatedAt: 0,
                __v: 0,
              },
            },
          ],
          as: "productData",
        },
      },
      { $unwind: { path: "$productData", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          "items.product": {
            $ifNull: [
              {
                _id: null,
                name: "Product not found",
                description: "Product not available",
                price: 0,
                discount: null,
                images: [],
                category: {
                  _id: null,
                  name: "N/A",
                },
                brand: "N/A",
                seller: {
                  _id: null,
                  name: "N/A",
                },
                totalRatings: 0,
                avgRating: 0,
              },
              "$productData",
            ],
          },
        },
      },
      { $project: { productData: 0 } },
      {
        $group: {
          _id: "$_id",
          user: { $first: "$user" },
          totalAmount: { $first: "$totalAmount" },
          paymentStatus: { $first: "$paymentStatus" },
          paymentMethod: { $first: "$paymentMethod" },
          shippingAddress: { $first: "$shippingAddress" },
          createdAt: { $first: "$createdAt" },
          items: { $push: "$items" },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]);

    const totalOrders = await Order.countDocuments({
      "user.userId": req.user._id,
    });

    return res.status(200).json({
      success: true,
      orders,
      totalOrders,
      currentPage: Number(page),
      totalPages: Math.ceil(totalOrders / Number(limit)),
    });
  } catch (error) {
    console.error("getUserOrders error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id: userId, role } = req.user;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID!",
      });
    }

    const matchStage = {
      _id: new mongoose.Types.ObjectId(id),
    };

    const filterItemsStage =
      role === "seller"
        ? {
            $filter: {
              input: "$items",
              as: "item",
              cond: { $eq: ["$$item.seller", userId] },
            },
          }
        : "$items";

    const pipeline = [
      { $match: matchStage },

      {
        $addFields: {
          items: filterItemsStage,
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "user.userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },

      {
        $addFields: {
          user: {
            email: {
              $ifNull: [{ $arrayElemAt: ["$userDetails.email", 0] }, "N/A"],
            },
            phone: {
              $ifNull: [{ $arrayElemAt: ["$userDetails.phone", 0] }, "N/A"],
            },
            name: {
              $ifNull: [{ $arrayElemAt: ["$userDetails.name", 0] }, "N/A"],
            },
          },
        },
      },

      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "items.seller",
          foreignField: "_id",
          as: "sellerDetails",
        },
      },

      {
        $addFields: {
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    product: {
                      $let: {
                        vars: {
                          prod: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$productDetails",
                                  as: "prod",
                                  cond: {
                                    $eq: ["$$prod._id", "$$item.product"],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: {
                          _id: "$$prod._id",
                          name: "$$prod.name",
                          price: "$$prod.price",
                          images: "$$prod.images",
                          discount: "$$prod.discount",
                        },
                      },
                    },
                    ...(role !== "seller" && {
                      seller: {
                        $let: {
                          vars: {
                            sellerInfo: {
                              $arrayElemAt: [
                                {
                                  $filter: {
                                    input: "$sellerDetails",
                                    as: "s",
                                    cond: {
                                      $eq: ["$$s._id", "$$item.seller"],
                                    },
                                  },
                                },
                                0,
                              ],
                            },
                          },
                          in: {
                            _id: "$$sellerInfo._id",
                            name: "$$sellerInfo.name",
                          },
                        },
                      },
                    }),
                  },
                ],
              },
            },
          },
        },
      },

      {
        $project: {
          userDetails: 0,
          productDetails: 0,
          sellerDetails: 0,
        },
      },
    ];

    const result = await Order.aggregate(pipeline);
    const order = result[0];

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found!" });
    }

    if (role === "seller" && (!order.items || order.items.length === 0)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this order!",
      });
    }

    if (
      role === "user" &&
      order.user.userId?.toString() !== userId.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access!" });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { page = 1, limit = 10, sort, search } = req.query;

    const sortOption = {
      createdAt: -1,
    };

    if (sort && sort === "oldest") {
      sortOption.createdAt = 1;
    }

    const matchStage = {
      "items.seller": sellerId,
    };

    if (search) {
      matchStage.$or = [
        { "user.email": { $regex: search, $options: "i" } },
        { "user.phone": { $regex: search, $options: "i" } },
      ];
    }

    const result = await Order.aggregate([
      {
        $match: matchStage,
      },

      {
        $project: {
          _id: 1,
          user: 1,
          shippingAddress: 1,
          paymentStatus: 1,
          paymentMethod: 1,
          createdAt: 1,
          items: {
            $filter: {
              input: "$items",
              as: "item",
              cond: { $eq: ["$$item.seller", sellerId] },
            },
          },
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "user.userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $addFields: {
          user: {
            email: {
              $ifNull: [{ $arrayElemAt: ["$userDetails.email", 0] }, "N/A"],
            },
            phone: {
              $ifNull: [{ $arrayElemAt: ["$userDetails.phone", 0] }, "N/A"],
            },
            name: {
              $ifNull: [{ $arrayElemAt: ["$userDetails.name", 0] }, "N/A"],
            },
          },
        },
      },

      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },

      {
        $addFields: {
          "items.product": {
            _id: {
              $ifNull: [{ $arrayElemAt: ["$productDetails._id", 0] }, null],
            },
            name: {
              $ifNull: [{ $arrayElemAt: ["$productDetails.name", 0] }, "N/A"],
            },
            price: {
              $ifNull: [{ $arrayElemAt: ["$productDetails.price", 0] }, 0],
            },
            images: {
              $ifNull: [{ $arrayElemAt: ["$productDetails.images", 0] }, []],
            },
            discount: {
              $ifNull: [
                { $arrayElemAt: ["$productDetails.discount", 0] },
                null,
              ],
            },
          },
        },
      },

      {
        $project: {
          userDetails: 0,
          productDetails: 0,
        },
      },

      { $sort: sortOption },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
    ]);

    const orders = result;
    const totalOrders = await Order.countDocuments({
      ...matchStage,
    });

    return res.status(200).json({
      success: true,
      orders,
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const getSellerActiveOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { page = 1, limit = 10, sort, search } = req.query;

    const sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption.createdAt = 1;

    const matchStage = {
      "items.seller": sellerId,
      "items.status": { $nin: ["delivered", "cancelled"] },
    };

    if (search) {
      matchStage.$or = [
        { "user.email": { $regex: search, $options: "i" } },
        { "user.phone": { $regex: search, $options: "i" } },
      ];
    }

    const pipeline = [
      {
        $match: matchStage,
      },
      {
        $project: {
          user: 1,
          shippingAddress: 1,
          paymentStatus: 1,
          paymentMethod: 1,
          createdAt: 1,
          items: {
            $filter: {
              input: "$items",
              as: "item",
              cond: {
                $and: [
                  { $eq: ["$$item.seller", sellerId] },
                  {
                    $not: {
                      $in: ["$$item.status", ["delivered", "cancelled"]],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      { $match: { items: { $ne: [] } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $addFields: {
          "items.product": {
            $cond: [
              { $gt: [{ $size: "$productDetails" }, 0] },
              {
                _id: { $arrayElemAt: ["$productDetails._id", 0] },
                name: { $arrayElemAt: ["$productDetails.name", 0] },
                price: { $arrayElemAt: ["$productDetails.price", 0] },
                images: { $arrayElemAt: ["$productDetails.images", 0] },
                discount: { $arrayElemAt: ["$productDetails.discount", 0] },
              },
              {
                _id: null,
                name: "N/A",
                price: 0,
                images: [],
                discount: null,
              },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user.userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $addFields: {
          "user.name": { $arrayElemAt: ["$userDetails.name", 0] },
        },
      },
      { $project: { productDetails: 0, userDetails: 0 } },
      {
        $group: {
          _id: "$_id",
          user: { $first: "$user" },
          shippingAddress: { $first: "$shippingAddress" },
          paymentStatus: { $first: "$paymentStatus" },
          paymentMethod: { $first: "$paymentMethod" },
          createdAt: { $first: "$createdAt" },
          items: { $push: "$items" },
        },
      },

      { $sort: sortOption },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
    ];

    const orders = await Order.aggregate(pipeline);

    const totalOrdersAgg = await Order.aggregate([
      {
        $match: matchStage,
      },
      {
        $project: {
          items: {
            $filter: {
              input: "$items",
              as: "item",
              cond: {
                $and: [
                  { $eq: ["$$item.seller", sellerId] },
                  {
                    $not: {
                      $in: ["$$item.status", ["delivered", "cancelled"]],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      { $match: { items: { $ne: [] } } },
      { $count: "total" },
    ]);

    const totalOrders = totalOrdersAgg[0]?.total || 0;

    return res.status(200).json({
      success: true,
      orders,
      totalOrders,
      currentPage: Number(page),
      totalPages: Math.ceil(totalOrders / Number(limit)),
    });
  } catch (error) {
    console.error("getSellerActiveOrders error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { search = "", sort = "latest", page = 1, limit = 10 } = req.query;

    const matchStage = {};

    if (search) {
      matchStage.$or = [
        { "user.email": { $regex: search, $options: "i" } },
        { "user.phone": { $regex: search, $options: "i" } },
      ];
    }

    const sortStage = {
      createdAt: sort === "oldest" ? 1 : -1,
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const [orders, totalOrders] = await Promise.all([
      Order.aggregate([
        { $match: matchStage },
        { $sort: sortStage },
        { $skip: skip },
        { $limit: limitNum },
      ]),
      Order.countDocuments(matchStage),
    ]);

    const totalPages = Math.ceil(totalOrders / limitNum);

    return res.status(200).json({
      success: true,
      orders,
      currentPage: parseInt(page),
      totalPages,
      totalOrders,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id } = req.params;
    const { itemId, orderStatus, trackingNumber } = req.body;

    if (!itemId || !orderStatus) {
      return res
        .status(400)
        .json({ success: false, message: "Mandatory fields are required!" });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID!" });
    }

    const order = await Order.findOne({
      _id: id,
      items: {
        $elemMatch: {
          _id: new mongoose.Types.ObjectId(`${itemId}`),
          seller: userId,
        },
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found!" });
    }

    const setUpdate = {
      "items.$[elem].status": orderStatus,
    };

    if (trackingNumber) {
      setUpdate["items.$[elem].trackingNumber"] = trackingNumber;
    }

    if (orderStatus === "delivered") {
      setUpdate["items.$[elem].deliveredAt"] = new Date();
    } else if (orderStatus === "cancelled") {
      setUpdate["items.$[elem].cancelledAt"] = new Date();
    }

    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: id,
        items: {
          $elemMatch: {
            _id: new mongoose.Types.ObjectId(`${itemId}`),
            seller: userId,
          },
        },
      },
      {
        $set: setUpdate,
      },
      {
        arrayFilters: [
          {
            "elem._id": new mongoose.Types.ObjectId(itemId),
            "elem.seller": userId,
          },
        ],
        new: true,
      }
    );

    if (!updatedOrder) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to update order!" });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully!",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { itemId } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order ID!" });
    }

    if (!mongoose.isValidObjectId(itemId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID!" });
    }

    const order = await Order.findOne({
      _id: id,
      "user.userId": userId,
      "items._id": itemId,
      $and: [
        { "items.status": { $ne: "cancelled" } },
        { "items.status": { $ne: "delivered" } },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    const itemToCancel = order.items.find(
      (item) => item._id.toString() === itemId.toString()
    );

    if (!itemToCancel) {
      return res.status(404).json({
        success: false,
        message: "Item not found in this order!",
      });
    }

    if (!["pending", "processing"].includes(itemToCancel.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel this product!",
      });
    }

    const cancelledOrder = await Order.findOneAndUpdate(
      {
        _id: id,
        "user.userId": userId,
        items: {
          $elemMatch: {
            _id: new mongoose.Types.ObjectId(`${itemId}`),
          },
        },
      },
      {
        $set: {
          "items.$[elem].status": "cancelled",
          "items.$[elem].cancelledAt": new Date(),
        },
      },
      {
        arrayFilters: [
          {
            "elem._id": new mongoose.Types.ObjectId(`${itemId}`),
            // "elem.status": { $in: ["pending", "processing"] },
          },
        ],
        new: true,
      }
    );

    if (!cancelledOrder) {
      return res.status(404).json({
        success: false,
        message: "Failed to cancel order. try again later!",
      });
    }

    await Product.updateOne({ _id: itemToCancel.product }, [
      {
        $set: {
          stock: { $add: ["$stock", itemToCancel.quantity] },
          sold: {
            $cond: {
              if: { $gte: ["$sold", itemToCancel.quantity] },
              then: { $subtract: ["$sold", itemToCancel.quantity] },
              else: 0,
            },
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully!",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};
