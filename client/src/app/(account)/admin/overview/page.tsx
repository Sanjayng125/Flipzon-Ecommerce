"use client";

import { OverviewCard } from "@/components/overview/OverviewCard";
import { Spinner } from "@/components/Spinner";
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

const AdminOverviewPage = () => {
  const { fetchWithAuth } = useFetch();

  const { data, isLoading } = useQuery<AdminOverview | null>({
    queryKey: ["get-admin-overview"],
    queryFn: async () => {
      const res = await fetchWithAuth("/overview/admin");
      return res?.success ? res.result : null;
    },
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
    usersCount = 0,
    sellersCount = 0,
    ordersCount = 0,
    newSellersCount = 0,
    newSellerRequestsCount = 0,
    totalRevenue = 0,
    totalProductsSold = 0,
    revenuePerMonth = [],
    usersPerMonth = [],
  } = data || {};

  const filledRevenue = fillLastSixMonths(revenuePerMonth, "revenue");
  const filledUsers = fillLastSixMonths(usersPerMonth, "users");

  return (
    <div className="w-full p-2 sm:p-4">
      <h1 className="text-2xl font-semibold mb-4">Admin Overview</h1>

      {isLoading ? (
        <Spinner className="mt-2" />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <OverviewCard label="🛍️ Total Products" value={productsCount} />
            <OverviewCard label="👥 Total Users" value={usersCount} />
            <OverviewCard label="👥 Total Sellers" value={sellersCount} />
            <OverviewCard label="🛒 Total Orders" value={ordersCount} />
            <OverviewCard
              label="💰 Total Revenue"
              value={`₹${totalRevenue.toFixed(2)}`}
            />
            <OverviewCard label="🛍️ Products Sold" value={totalProductsSold} />
            <OverviewCard label="📦 New Sellers (7d)" value={newSellersCount} />
            <OverviewCard
              label="🙋‍♂️ Seller Requests"
              value={newSellerRequestsCount}
            />
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
                📊 Users Joined (Last 6 Months)
              </h2>
              {filledUsers.length === 0 ? (
                <p className="text-sm text-gray-500">No user data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filledUsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="users" fill="#10b981" />
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

export default AdminOverviewPage;
