"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { AddToCartBtn } from "./AddToCartBtn";
import { useMutation } from "@tanstack/react-query";
import useFetch from "@/hooks/useFetch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAddress } from "@/hooks/useAddress";
import { useAuth } from "@/hooks/useAuth";

interface ProductActionsProps {
  product: Product;
}

export const ProductActions = ({ product }: ProductActionsProps) => {
  const [quantity, setQuantity] = useState(1);
  const { fetchWithAuth } = useFetch();
  const router = useRouter();
  const { Addresses } = useAddress();
  const { user } = useAuth();

  const isUser = user?.role === "user";

  const createCheckoutSessionMutation = useMutation({
    mutationFn: async (items: CheckoutItem[]) => {
      const res = await fetchWithAuth(`/checkout/create`, {
        method: "POST",
        body: JSON.stringify({ items }),
      });
      if (!res?.success)
        throw new Error(res?.message || "Failed to create checkout session!");
      return res;
    },
    onSuccess: (res) => {
      if (res?.sessionId) {
        router.push(`/checkout/${res.sessionId}`);
        return;
      }
      toast.error(res?.message || "Failed to create checkout session!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleCheckout = () => {
    if (!product) return;

    if (!user) {
      return router.replace("/login");
    }

    if (!Addresses || Addresses.length === 0) {
      toast.error("Add a Address first!.");
      router.push("/addresses");
      return;
    }

    const items: CheckoutItem[] = [
      {
        product: product._id.toString(),
        quantity: quantity,
      },
    ];

    createCheckoutSessionMutation.mutate(items);
  };

  return (
    <div className="flex flex-col gap-1 mt-4">
      <div className="flex items-center mb-2">
        <Select
          value={`${quantity}`}
          onValueChange={(val) => setQuantity(Number(val))}
          disabled={createCheckoutSessionMutation.isPending}
        >
          <SelectTrigger size="sm">
            Qty: <SelectValue placeholder={quantity} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem
              value={"1"}
              className="hover:bg-black/10 cursor-pointer"
            >
              1
            </SelectItem>
            <SelectItem
              value={"2"}
              className="hover:bg-black/10 cursor-pointer"
            >
              2
            </SelectItem>
            <SelectItem
              value={"3"}
              className="hover:bg-black/10 cursor-pointer"
            >
              3
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full flex flex-col md:grid md:grid-cols-2 gap-2">
        <Button
          className="bg-[#FF8400] hover:bg-[#ff8400d5] text-white"
          onClick={handleCheckout}
          disabled={createCheckoutSessionMutation.isPending || !isUser}
        >
          {createCheckoutSessionMutation.isPending
            ? "Processing..."
            : "Buy Now"}
        </Button>
        <AddToCartBtn
          productId={product._id}
          disabled={createCheckoutSessionMutation.isPending}
        />
      </div>
    </div>
  );
};
