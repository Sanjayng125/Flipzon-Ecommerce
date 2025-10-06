"use client";

import { OverviewCard } from "@/components/overview/OverviewCard";
import { Spinner } from "@/components/Spinner";
import { useAuth } from "@/hooks/useAuth";
import useFetch from "@/hooks/useFetch";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

const SellerOverviewPage = () => {
  const { fetchWithAuth } = useFetch();
  const { user } = useAuth();

  const { data, isLoading } = useQuery<SellerOverview | null>({
    queryKey: ["get-seller-overview"],
    queryFn: async () => {
      const res = await fetchWithAuth("/overview/seller");
      return res?.success ? res.result : null;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  const fillLastSixMonths = <T extends { month: string }>(
    arr: T[],
    valueKey: keyof T,
    defaultValue = 0
  ) => {
    const months = [...Array(6)].map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
    });

    return months.map((month) => {
      const found = arr?.find((d) => d.month === month);
      return {
        month,
        [valueKey]: found ? found[valueKey] : defaultValue,
      } as T;
    });
  };

  const {
    productsCount = 0,
    totalOrdersCount = 0,
    ordersCount = 0,
    pendingOrdersCount = 0,
    cancelledOrdersCount = 0,
    totalRevenue = 0,
    totalProductsSold = 0,
    revenuePerMonth = [],
    ordersPerMonth = [],
  } = data || {};

  const filledRevenue = fillLastSixMonths(revenuePerMonth, "revenue");
  const filledOrders = fillLastSixMonths(ordersPerMonth, "orders");

  return (
    <div className="w-full p-2 sm:p-4">
      <h1 className="text-2xl font-semibold mb-4">Seller Overview</h1>

      {isLoading ? (
        <Spinner className="mt-2" />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <OverviewCard label="🛍️ My Products" value={productsCount} />
            <OverviewCard label="🛒 Total Orders" value={totalOrdersCount} />
            <OverviewCard label="✅ Completed Orders" value={ordersCount} />
            <OverviewCard
              label="⏳ Pending Orders"
              value={pendingOrdersCount}
            />
            <OverviewCard
              label="❌ Cancelled Orders"
              value={cancelledOrdersCount}
            />
            <OverviewCard
              label="💰 Total Revenue"
              value={`₹${totalRevenue.toFixed(2)}`}
            />
            <OverviewCard label="🛍️ Products Sold" value={totalProductsSold} />
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-1 sm:p-4">
              <h2 className="text-lg font-semibold mb-2">
                📈 Revenue Trend (Last 6 Months)
              </h2>
              {filledRevenue.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No revenue data available.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={filledRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-1 sm:p-4">
              <h2 className="text-lg font-semibold mb-2">
                📊 Orders Trend (Last 6 Months)
              </h2>
              {filledOrders.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No order data available.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filledOrders}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SellerOverviewPage;
