import mongoose from "mongoose";
import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import { sendOrderCancelled, sendOrderPlaced } from "../utils/mailSender.js";
import { Cashfree } from "../utils/cashfree.js";
import CheckoutSession from "../models/CheckoutSession.model.js";
import Cart from "../models/Cart.model.js";
import { formatDate } from "../utils/index.js";

const { CASHFREE_VERSION } = process.env;

export const createOrder = async (req, res) => {
  try {
    const { _id: userId, phone, email, name } = req.user;
    const { shippingAddress, sessionId, currency } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required!",
      });
    }

    if (!sessionId || !mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Session ID!",
      });
    }

    const checkoutSession = await CheckoutSession.findOne({
      _id: sessionId,
      user: userId,
    });

    if (!checkoutSession) {
      return res.status(404).json({
        success: false,
        message: "Session not found or expired!",
      });
    }

    const items = checkoutSession.items;

    if (items.length > 5) {
      return res.status(400).json({
        success: false,
        message: "You can order a maximum of 5 different products at a time.",
      });
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const { product: productId, quantity } = item;

      if (quantity <= 0) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid quantity!" });
      }

      if (quantity > 3) {
        return res.status(400).json({
          success: false,
          message: "Quantity for each product cannot exceed 3.",
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: `Product not found: ${productId}` });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      const price = product.discount
        ? product.price - (product.price * product.discount) / 100
        : product.price;

      totalAmount += price * quantity;

      validatedItems.push({
        product: product._id,
        seller: product.seller,
        quantity,
        price: Number(price.toFixed(2)),
      });
    }

    const order = new Order({
      user: { userId, phone, email, name },
      items: validatedItems,
      totalAmount: Number(totalAmount.toFixed(2)),
      shippingAddress: {
        fullName: shippingAddress.fullName,
        address: shippingAddress.streetAddress,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        email,
        phone,
      },
    });

    const paymentData = {
      order_id: order._id.toString(),
      order_amount: order.totalAmount.toFixed(2),
      order_currency: currency ?? "INR",
      customer_details: {
        customer_name: name,
        customer_id: userId.toString(),
        customer_email: email,
        customer_phone: phone,
      },
      order_meta: {
        return_url: `${process.env.CLIENT_URL}/checkout/result/${order._id}`,
        notify_url: `${process.env.SERVER_URL}/api/payments/webhook/payment`,
      },
      order_expiry_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min expiry
    };

    const paymentOrderRes = await Cashfree.PGCreateOrder(
      CASHFREE_VERSION,
      paymentData
    );
    if (
      paymentOrderRes.status !== 200 ||
      !paymentOrderRes.data?.payment_session_id
    ) {
      return res
        .status(500)
        .json({ success: false, message: "Payment initiation failed" });
    }

    const afterOrderUpdates = [
      order.save(),
      CheckoutSession.deleteOne({
        _id: sessionId,
        user: userId,
      }),
    ];

    if (checkoutSession?.buyType === "cart-checkout") {
      afterOrderUpdates.push(
        Cart.findOneAndUpdate(
          {
            user: userId,
          },
          {
            $set: {
              items: [],
            },
          }
        )
      );
    }

    await Promise.all(afterOrderUpdates);

    const bulkOps = validatedItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: [
          {
            $set: {
              sold: { $add: ["$sold", item.quantity] },
              stock: {
                $max: [0, { $subtract: ["$stock", item.quantity] }],
              },
            },
          },
        ],
      },
    }));
    await Product.bulkWrite(bulkOps);

    await sendOrderPlaced(email, {
      customerName: name,
      orderId: order._id.toString(),
      orderDate: formatDate(order.createdAt),
      items: validatedItems.length,
      orderAmount: totalAmount.toFixed(2),
      shippingAddress: order.shippingAddress,
      orderTrackingUrl: `${process.env.CLIENT_URL}/orders/${order._id}`,
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!, waiting for payment...",
      order,
      paymentSessionId: paymentOrderRes.data.payment_session_id,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort } = req.query;

    const sortOption = {
      createdAt: -1,
    };

    if (sort && sort === "oldest") {
      sortOption.createdAt = 1;
    }

    const matchStage = { "user.userId": req.user._id };

    const orders = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $addFields: {
          "items.product": {
            $cond: {
              if: { $gt: [{ $size: "$productData" }, 0] },
              then: {
                $let: {
                  vars: { prod: { $arrayElemAt: ["$productData", 0] } },
                  in: {
                    _id: "$$prod._id",
                    name: "$$prod.name",
                    description: "$$prod.description",
                    price: "$$prod.price",
                    discount: "$$prod.discount",
                    images: "$$prod.images",
                    category: "$$prod.category",
                    brand: "$$prod.brand",
                    seller: "$$prod.seller",
                    totalRatings: "$$prod.totalRatings",
                    avgRating: "$$prod.avgRating",
                  },
                },
              },
              else: {
                _id: null,
                name: "Product not found",
                description: "Product not available",
                price: 0,
                discount: null,
                images: [],
                category: { _id: null, name: "N/A" },
                brand: "N/A",
                seller: { _id: null, name: "N/A" },
                totalRatings: 0,
                avgRating: 0,
              },
            },
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
      { $sort: sortOption },
      { $skip: (Number(page) - 1) * Number(limit) },
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
      createdAt: sort === "oldest" ? 1 : -1,
    };

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
        $project: {
          productDetails: 0,
        },
      },

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
    ]);

    const orders = result;
    const totalOrders = await Order.countDocuments(matchStage);

    return res.status(200).json({
      success: true,
      orders,
      totalOrders,
      currentPage: Number(page),
      totalPages: Math.ceil(totalOrders / Number(limit)),
    });
  } catch (error) {
    console.error("getSellerOrders error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
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
      { $project: { productDetails: 0 } },
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
        { "user.name": { $regex: search, $options: "i" } },
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
                  name: "Product not found",
                  price: 0,
                  images: [],
                  discount: null,
                },
              ],
            },
          },
        },

        {
          $project: {
            productDetails: 0,
          },
        },

        {
          $group: {
            _id: "$_id",
            user: { $first: "$user" },
            totalAmount: { $first: "$totalAmount" },
            paymentStatus: { $first: "$paymentStatus" },
            paymentMethod: { $first: "$paymentMethod" },
            shippingAddress: { $first: "$shippingAddress" },
            createdAt: { $first: "$createdAt" },
            updatedAt: { $first: "$updatedAt" },
            items: { $push: "$items" },
          },
        },

        { $sort: sortStage },
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
    console.error("getAllOrders error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { _id: sellerId } = req.user;
    const { id } = req.params;
    const { itemId, orderStatus, trackingNumber } = req.body;

    if (!itemId || !orderStatus) {
      return res.status(400).json({
        success: false,
        message: "Mandatory fields are required!",
      });
    }

    const allowedStatuses = ["pending", "processing", "shipped", "delivered"];
    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status!",
      });
    }

    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID!",
      });
    }

    const order = await Order.findOne({
      _id: id,
      "items._id": itemId,
      "items.seller": sellerId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    const item = order.items.find(
      (i) => i._id.toString() === itemId.toString()
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found!",
      });
    }

    if (item.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot update cancelled items!",
      });
    }

    if (item.status === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Cannot change status of delivered items!",
      });
    }

    const setUpdate = {
      "items.$[elem].status": orderStatus,
    };

    if (trackingNumber) {
      setUpdate["items.$[elem].trackingNumber"] = trackingNumber;
    }

    if (orderStatus === "delivered") {
      setUpdate["items.$[elem].deliveredAt"] = new Date();
    }

    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: id,
        "items._id": itemId,
        "items.seller": sellerId,
      },
      { $set: setUpdate },
      {
        arrayFilters: [
          {
            "elem._id": itemId,
            "elem.seller": sellerId,
          },
        ],
        new: true,
      }
    );

    if (!updatedOrder) {
      return res.status(400).json({
        success: false,
        message: "Failed to update order!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully!",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { itemId } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID!",
      });
    }

    if (!mongoose.isValidObjectId(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID!",
      });
    }

    const query = {
      _id: orderId,
      "items._id": itemId,
    };

    if (userRole === "seller") {
      query["items.seller"] = userId;
    } else {
      query["user.userId"] = userId;
    }

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    const itemToCancel = order.items.find(
      (item) => item._id.toString() === itemId
    );

    if (!itemToCancel) {
      return res.status(404).json({
        success: false,
        message: "Item not found in this order!",
      });
    }

    const cancellableStatuses = ["pending", "processing"];

    if (userRole === "seller") {
      cancellableStatuses.push("shipped");
    }

    if (!cancellableStatuses.includes(itemToCancel.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${itemToCancel.status} items!`,
      });
    }

    const refundAmount = itemToCancel.price * itemToCancel.quantity;
    const shouldRefund = order.paymentStatus === "paid";

    const cancelledOrder = await Order.findOneAndUpdate(
      query,
      {
        $set: {
          "items.$[elem].status": "cancelled",
          "items.$[elem].cancelledAt": new Date(),
          "items.$[elem].refundAmount": shouldRefund ? refundAmount : 0,
        },
      },
      {
        arrayFilters: [{ "elem._id": itemId }],
        new: true,
      }
    );

    if (!cancelledOrder) {
      return res.status(500).json({
        success: false,
        message: "Failed to cancel item. Please try again!",
      });
    }

    await Product.findByIdAndUpdate(itemToCancel.product, [
      {
        $set: {
          stock: { $add: ["$stock", itemToCancel.quantity] },
          sold: {
            $max: [0, { $subtract: ["$sold", itemToCancel.quantity] }],
          },
        },
      },
    ]);

    if (shouldRefund) {
      const refundData = {
        refund_amount: refundAmount,
        refund_id: itemToCancel._id.toString(),
        refund_note: `Refund for order ${orderId} - Item cancelled by ${userRole}`,
      };

      await Cashfree.PGOrderCreateRefund(CASHFREE_VERSION, orderId, refundData);

      await sendOrderCancelled(order.user.name, {
        customerName: cancelledOrder.user.email,
        orderId: cancelledOrder._id.toString(),
        reason: `Item cancelled by ${userRole}, Refund amount ₹${refundAmount} will be refunded soon.`,
        orderTrackingUrl: `${
          process.env.CLIENT_URL
        }/orders/${cancelledOrder._id.toString()}`,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Item cancelled successfully!, Amount will be refunded soon if applicable.",
    });
  } catch (error) {
    console.error("cancelOrder error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};
