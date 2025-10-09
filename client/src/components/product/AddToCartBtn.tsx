"use client";

import { useAuth } from "@/hooks/useAuth";
import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useFetch from "@/hooks/useFetch";
import { toast } from "sonner";

interface AddToCartBtnProps {
  onClick?: () => void;
  disabled?: boolean;
  productId: string;
  className?: string;
}

export const AddToCartBtn = ({
  onClick = () => {},
  disabled = false,
  productId,
  className = "",
}: AddToCartBtnProps) => {
  const { user } = useAuth();
  const { cart, setCart } = useCart();
  const router = useRouter();
  const { fetchWithAuth } = useFetch();
  const queryClient = useQueryClient();

  const addItemMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetchWithAuth(`/cart/${productId}`, { method: "POST" });
      if (!res?.success)
        throw new Error(res?.message || "Failed to add product!");
      return res;
    },
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["get-cart"] });
      setCart(res.data?.cart);
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <Button
      className={`text-white bg-sky-800 hover:bg-sky-900 cursor-pointer ${className}`}
      onClick={() => {
        if (!user) {
          return router.push("/login");
        }
        if (cart?.items.some((i) => i.product._id === productId)) {
          return router.push("/cart");
        }
        addItemMutation.mutate(productId);
        onClick();
      }}
      disabled={
        addItemMutation.isPending || (user && user?.role !== "user") || disabled
      }
    >
      {addItemMutation.isPending
        ? "Adding..."
        : cart?.items.some((i) => i.product._id === productId)
        ? "Go to Cart"
        : "Add to Cart"}
    </Button>
  );
};
