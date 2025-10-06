import { formatDate, NOT_FOUND_IMAGE } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface OrderCardProps {
  order: Order;
}

export const OrderCard = ({ order }: OrderCardProps) => {
  const visibleItems = order.items.slice(0, 2);
  const remainingCount = order.items.length - visibleItems.length;

  return (
    <Link
      href={`/orders/${order._id}`}
      className="w-full p-2 mb-4 bg-white hover:shadow-md transition border-b border-border-default"
    >
      <div className="flex justify-between items-center mb-3">
        <p className="text-sm text-gray-600">Order ID: {order._id}</p>
      </div>

      <div className="w-full flex items-center gap-2">
        <div className="flex -space-x-6 shrink-0">
          {visibleItems.map(({ product }, idx) => (
            <Image
              key={idx}
              src={product?.images?.[0]?.url ?? NOT_FOUND_IMAGE}
              alt={product?.name ?? "Not found"}
              width={50}
              height={50}
              className="w-14 h-14 object-contain"
            />
          ))}
          {remainingCount > 0 && (
            <div className="flex items-center justify-center text-gray-700 text-sm font-semibold ml-5">
              +{remainingCount}
            </div>
          )}
        </div>

        <div className="ml-4 flex flex-col justify-between">
          <p className="text-sm font-semibold line-clamp-1">
            {order.items.map(({ product }) => product.name).join(", ")}
          </p>
          <p className="text-sm text-gray-600">Total: ₹{order.totalAmount}</p>
          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
      </div>
    </Link>
  );
};
