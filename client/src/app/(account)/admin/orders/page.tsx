"use client";

import { PaginationControls } from "@/components/PaginationControls";
import { Spinner } from "@/components/Spinner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import useFetch from "@/hooks/useFetch";
import { capatilize, formatDate, getStatusBadgeColor } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const ORDERS_PER_PAGE = 8;

const AdminOrdersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 500, 3);
  const [sort, setSort] = useState("latest");
  const { fetchWithAuth } = useFetch();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", page, sort, debouncedSearchQuery],
    queryFn: async () => {
      const res = await fetchWithAuth(
        `/orders?search=${debouncedSearchQuery}&sort=${sort}&page=${page}&limit=${ORDERS_PER_PAGE}`
      );
      return res;
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, sort]);

  const orders: Order[] = data?.orders || [];
  const currentPage = data?.currentPage || 1;
  const totalPages = data?.totalPages || 1;
  const totalOrders = data?.totalOrders || 0;

  return (
    <div className="w-full p-2">
      <h1 className="text-2xl font-semibold mb-2">Manage Orders</h1>

      <div className="w-full border p-2 rounded-lg flex flex-col gap-2 my-2">
        <Input
          placeholder="Search orders by customer name/email/phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="w-full flex flex-wrap items-center gap-2">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-white w-max">
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>

          <p className="text-sm text-gray-500">Total Orders: {totalOrders}</p>
        </div>
      </div>

      {isLoading ? (
        <Spinner className="mt-4" />
      ) : orders.length ? (
        <>
          <div className="grid grid-cols-1 gap-3">
            {orders.map((order) => (
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
                    {order.shippingAddress.address},{" "}
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    - {order.shippingAddress.postalCode},{" "}
                    {order.shippingAddress.country}
                  </p>
                </div>

                <div className="border-t pt-2">
                  <p className="font-medium text-gray-800 mb-1">Items:</p>
                  <ul className="text-sm list-disc ml-4 space-y-2">
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.product.name} - Qty: {item.quantity}, Price: ₹
                        {item.price}
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
                    <span className="font-medium">Total:</span> ₹
                    {order.totalAmount}
                  </p>
                  <p>
                    <span className="font-medium">Ordered:</span>{" "}
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <Link
                  href={`/admin/orders/${order._id}`}
                  className="w-max text-sm px-3 py-1 bg-sky-800 text-white rounded hover:bg-sky-900 transition"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        </>
      ) : (
        <p className="text-center">No orders found</p>
      )}
    </div>
  );
};

export default AdminOrdersPage;
