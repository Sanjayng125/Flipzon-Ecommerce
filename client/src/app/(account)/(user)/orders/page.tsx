"use client";

import { OrderCard } from "@/components/order/OrderCard";
import { PaginationControls } from "@/components/PaginationControls";
import { Spinner } from "@/components/Spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/useFetch";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

const OrdersPage = () => {
  const { fetchWithAuth } = useFetch();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("latest");

  const { data, isPending } = useQuery({
    queryKey: ["get-my-orders", page, sort],
    queryFn: async () => {
      const res = await fetchWithAuth(
        `/orders/my-orders?sort=${sort}&page=${page}`
      );

      if (res?.success) {
        return res;
      }
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  if (isPending) {
    return <Spinner className="min-h-screen" />;
  }

  const orders: Order[] = data?.orders || [];
  const currentPage = data?.currentPage || 1;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="flex justify-center">
      <div className="w-full rounded-md">
        {orders.length > 0 ? (
          <div className="w-full">
            <div className="md:border-b-2 border-b-[#CBD5E1] flex items-center justify-between">
              <h2 className="font-semibold text-xl p-2 max-md:pb-0">
                Your Orders
              </h2>
            </div>

            <div className="p-2 pb-0">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="bg-white w-max">
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col p-2">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>

            <PaginationControls
              currentPage={currentPage}
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />
          </div>
        ) : (
          <h2 className="text-center">No orders yet.</h2>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
