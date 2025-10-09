"use client";

import useFetch from "@/hooks/useFetch";
import Link from "next/link";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import { LiaCartSolid } from "./CartIcon";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

export const Cart = () => {
  const { fetchWithAuth } = useFetch();
  const { user } = useAuth();
  const { setCart, cart } = useCart();

  const { isLoading } = useQuery({
    queryKey: ["get-cart"],
    queryFn: async () => {
      if (!user) return null;
      const res = await fetchWithAuth("/cart?populate=true");
      if (res?.success) {
        setCart(res.cart);
        return res.cart;
      }
      return null;
    },
    enabled: !!user && user.role === "user",
    staleTime: 1000 * 60 * 10,
  });

  return (
    <>
      {isLoading && !cart ? (
        <Skeleton className="rounded-full w-10 sm:w-[73px] h-9 bg-skeleton shrink-0" />
      ) : (
        <Link href={"/cart"}>
          <div className="w-full flex items-center justify-between font-semibold flex-1 text-[#1E293B]">
            <div className="relative">
              <span
                className={`absolute left-1/2 translate-x-[-38%] text-sky-800 ${
                  cart?.items && cart?.items.length > 9 && "text-sm"
                }`}
              >
                {cart
                  ? cart?.items.length > 9
                    ? "9+"
                    : cart?.items.length
                  : 0}
              </span>
              <LiaCartSolid className="w-10 h-9 text-sky-800" />
            </div>
            <p className="max-sm:hidden">Cart</p>
          </div>
        </Link>
      )}
    </>
  );
};
