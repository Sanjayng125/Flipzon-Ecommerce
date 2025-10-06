import { capatilize, formatDate, getStatusBadgeColor } from "@/utils";
import Link from "next/link";
import React from "react";

interface OrderCard2Props {
  order: Order;
}

export const OrderCard2 = ({ order }: OrderCard2Props) => {
  return (
    <div
      key={order._id}
      className="border rounded-lg p-4 shadow-sm bg-white flex flex-col gap-3"
    >
      <h2 className="text-lg font-semibold">Order ID: {order._id}</h2>

      <div className="text-sm text-gray-700">
        <p>
          <span className="font-medium">Customer:</span>{" "}
          {order.shippingAddress.fullName} ({order.user.email},{" "}
          {order.user.phone})
        </p>
        <p>
          <span className="font-medium">Shipping Address:</span>{" "}
          {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
          {order.shippingAddress.state} - {order.shippingAddress.postalCode},{" "}
          {order.shippingAddress.country}
        </p>
      </div>

      <div className="border-t pt-2">
        <p className="font-medium text-gray-800 mb-1">Items:</p>
        <ul className="text-sm list-disc ml-4 space-y-2">
          {order.items.map((item, idx) => (
            <li key={idx}>
              {item.product.name} - Qty: {item.quantity}, Price: ₹{item.price}
              <p>
                <span className="font-medium">- Status:</span>{" "}
                <span
                  className={`text-xs px-2 py-[2px] rounded-full font-medium ${getStatusBadgeColor(
                    item.status
                  )}`}
                >
                  {capatilize(item.status)}
                </span>
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap justify-between gap-3 text-sm border-t pt-2">
        <p>
          <span className="font-medium">Payment Method:</span>{" "}
          {order.paymentMethod}
        </p>
        <p>
          <span className="font-medium">Payment Status:</span>{" "}
          {order.paymentStatus}
        </p>
        <p>
          <span className="font-medium">Ordered:</span>{" "}
          {formatDate(order.createdAt)}
        </p>
      </div>

      <Link
        href={`/seller/orders/${order._id}`}
        className="w-max text-sm px-3 py-1 bg-emerald-700 text-white rounded hover:bg-emerald-800 transition"
      >
        View Details
      </Link>
    </div>
  );
};
