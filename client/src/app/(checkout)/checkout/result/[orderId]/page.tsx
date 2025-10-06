"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import useFetch from "@/hooks/useFetch";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";

const CheckoutResultPage = () => {
  const { user } = useAuth();
  const { fetchWithAuth } = useFetch();
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();

  const {
    data: order,
    isFetched,
    isPending,
  } = useQuery<Order>({
    queryKey: ["get-order-result", orderId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/orders/${orderId}`);
      return res?.success ? res.order : null;
    },
    staleTime: 1000 * 60 * 10, // 10mins
    enabled: !!user,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  useEffect(() => {
    if (isFetched && !isPending && !order) {
      router.replace("/");
    }
  }, [order, isFetched, router, isPending]);

  if (isPending) {
    return (
      <div className="w-full mx-auto p-2 sm:p-4">
        <Skeleton className="rounded-md w-full p-4 bg-skeleton flex flex-col items-center">
          <Skeleton className="rounded-md w-5/6 md:w-3/4 p-4 bg-white" />
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Skeleton className="rounded-md p-4 w-40 bg-white" />
            <Skeleton className="rounded-md p-4 w-40 bg-white" />
          </div>
        </Skeleton>
      </div>
    );
  }

  if (!order) return null;

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "pending":
        return "We received your order, please wait while the payment is being processed.";
      case "paid":
        return "Your order is confirmed and being processed. check futher details in your account.";
      case "failed":
        return "We received your order, but the payment failed. Please retry or contact support.";
      case "refunded":
        return "This order has been refunded. The payment has been returned to your account.";
      default:
        return "We received your order, but the payment status is unclear. Please contact support.";
    }
  };

  return (
    <div className="w-full mx-auto p-2 sm:p-4">
      <div className="bg-white rounded-md w-full p-4 flex flex-col items-center text-center">
        <h1 className="md:text-lg font-semibold">
          Thank you for shopping with us.
        </h1>
        <h2 className="text-sm md:text-base mt-2">
          {getStatusMessage(order.paymentStatus)}
        </h2>

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <Link href={`/orders/${order?._id.toString()}`}>
            <Button className="cursor-pointer bg-sky-800 hover:bg-sky-900">
              View Order Details
            </Button>
          </Link>
          <Link href={`/`}>
            <Button className="cursor-pointer bg-sky-800 hover:bg-sky-900">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutResultPage;
