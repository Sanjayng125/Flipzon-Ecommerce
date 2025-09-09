import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import User from "../models/User.model.js";

const months = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const getAdminOverview = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      productsCount,
      usersCount,
      sellersCount,
      ordersCount,
      revenueAgg,
      newSellersCount,
      newSellerRequestsCount,
      revenuePerMonth,
      usersPerMonth,
    ] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "seller" }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
      ]) || 0,
      User.countDocuments({
        role: "seller",
        createdAt: { $gte: sevenDaysAgo },
      }),
      User.countDocuments({ isSellerRequested: true }),
      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$totalAmount" },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
        {
          $project: {
            _id: 0,
            month: {
              $concat: [
                {
                  $arrayElemAt: [months, "$_id.month"],
                },
                " ",
                { $toString: "$_id.year" },
              ],
            },
            revenue: 1,
          },
        },
      ]) || 0,
      User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)),
            },
            role: "user",
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            users: { $sum: 1 },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
        {
          $project: {
            _id: 0,
            month: {
              $concat: [
                {
                  $arrayElemAt: [months, "$_id.month"],
                },
                " ",
                { $toString: "$_id.year" },
              ],
            },
            users: 1,
          },
        },
      ]) || 0,
    ]);

    const result = {
      productsCount,
      usersCount,
      sellersCount,
      ordersCount,
      totalRevenue: revenueAgg?.[0]?.totalRevenue || 0,
      newSellersCount,
      newSellerRequestsCount,
      revenuePerMonth,
      usersPerMonth,
    };

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};

export const getSellerOverview = async (req, res) => {
  try {
    const { _id } = req.user; // seller id

    const [
      productsCount,
      ordersCount,
      pendingOrdersCount,
      revenueAgg,
      revenuePerMonth,
      ordersPerMonth,
    ] = await Promise.all([
      Product.countDocuments({ seller: _id }),
      Order.countDocuments({
        "items.seller": _id,
        "items.status": { $in: ["delivered", "cancelled"] },
        paymentStatus: "paid",
      }),
      Order.countDocuments({
        "items.seller": _id,
        "items.status": { $nin: ["delivered", "cancelled"] },
        paymentStatus: "paid",
      }),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $unwind: "$items" },
        { $match: { "items.seller": _id, "items.status": "delivered" } },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)),
            },
          },
        },
        { $unwind: "$items" },
        { $match: { "items.seller": _id, "items.status": "delivered" } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
          $project: {
            _id: 0,
            month: {
              $concat: [
                { $arrayElemAt: [months, "$_id.month"] },
                " ",
                { $toString: "$_id.year" },
              ],
            },
            revenue: 1,
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)),
            },
          },
        },
        { $unwind: "$items" },
        { $match: { "items.seller": _id } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
          $project: {
            _id: 0,
            month: {
              $concat: [
                { $arrayElemAt: [months, "$_id.month"] },
                " ",
                { $toString: "$_id.year" },
              ],
            },
            orders: 1,
          },
        },
      ]),
    ]);

    const result = {
      productsCount,
      ordersCount,
      pendingOrdersCount,
      totalRevenue: revenueAgg?.[0]?.totalRevenue || 0,
      revenuePerMonth,
      ordersPerMonth,
    };

    return res.status(200).json({ success: true, result });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong!" });
  }
};
