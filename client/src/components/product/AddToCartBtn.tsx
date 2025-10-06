"use client";

import { useAuth } from "@/hooks/useAuth";
import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/cart/useCart";
import { useCartActions } from "@/hooks/cart/useCartActions";

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
  const { cart } = useCart();
  const { addItemMutation } = useCartActions();
  const router = useRouter();

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
