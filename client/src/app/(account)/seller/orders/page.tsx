"use client";

import { OrderCard2 } from "@/components/order/OrderCard2";
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
import useFetch from "@/hooks/useFetch";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

const ORDERS_PER_PAGE = 8;

const SellerOrdersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("oldest");
  const { fetchWithAuth } = useFetch();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("pending");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["seller-orders", page, sort, searchQuery],
    queryFn: async () => {
      const url =
        status === "all"
          ? `/orders/seller/my-orders`
          : "/orders/seller/my-active-orders";
      const res = await fetchWithAuth(
        `${url}?search=${searchQuery}&sort=${sort}&page=${page}&limit=${ORDERS_PER_PAGE}`
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
    if (sort || status) refetch();
  }, [sort, status, refetch]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.length >= 2 || searchQuery.length === 0) {
        setPage(1);
        refetch();
      }
    }, 600);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, refetch]);

  const orders: Order[] = data?.orders || [];
  const currentPage = data?.currentPage || 1;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="w-full p-2">
      <h1 className="text-2xl font-semibold mb-4">My Orders</h1>

      <div className="w-full border p-2 rounded-lg flex flex-col gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-white w-max">
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-white w-max">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          placeholder="Search by customer email or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Spinner className="mt-4" />
      ) : orders.length ? (
        <>
          <div className="grid grid-cols-1 gap-3">
            {orders.map((order) => (
              <OrderCard2 order={order} key={order._id} />
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

export default SellerOrdersPage;
