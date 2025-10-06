"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCart } from "./useCart";
import useFetch from "../useFetch";

export const useCartActions = () => {
    const queryClient = useQueryClient();
    const { setCart } = useCart();
    const { fetchWithAuth } = useFetch()

    const addItemMutation = useMutation({
        mutationFn: async (productId: string) => {
            const res = await fetchWithAuth(`/cart/${productId}`, { method: "POST" });
            if (!res?.success) throw new Error(res?.message || "Failed to add product!");
            return res;
        },
        onSuccess: (res) => {
            toast.success(res.message);
            queryClient.invalidateQueries({ queryKey: ["get-cart"] });
            setCart(res.data?.cart);
        },
        onError: (err: any) => toast.error(err.message),
    });

    const updateQtyMutation = useMutation({
        mutationFn: async ({ productId, qty }: { productId: string, qty: number }) => {

            if (!qty || isNaN(qty) || qty < 1 || qty > 3) {
                return toast.error("Quantity must be between 1 and 3!")
            }
            const res = await fetchWithAuth(`/cart/${productId}`, { method: "PATCH", body: JSON.stringify({ qty }) });
            if (!res?.success) throw new Error(res?.message || "Failed to update quantity!");
            return res;
        },
        onSuccess: (res) => {
            toast.success(res.message);
            queryClient.invalidateQueries({ queryKey: ["get-cart"] });
            setCart(res.data?.cart);
        },
        onError: (err: any) => toast.error(err.message),
    });

    const removeProductMutation = useMutation({
        mutationFn: async (productId: string) => {
            const res = await fetchWithAuth(`/cart/${productId}`, { method: "DELETE" });
            if (!res?.success) throw new Error(res?.message || "Failed to remove product!");
            return res;
        },
        onSuccess: (res) => {
            toast.success(res.message);
            queryClient.invalidateQueries({ queryKey: ["get-cart"] });
            setCart(res.data?.cart);
        },
        onError: (err: any) => toast.error(err.message),
    });

    const saveToWishlistMutation = useMutation({
        mutationFn: async (productId: string) => {
            const res = await fetchWithAuth(`/wishlist/${productId}`, { method: "POST" });
            if (!res?.success) throw new Error(res?.message || "Failed to add product to wishlist!");
            return res;
        },
        onSuccess: (res) => {
            toast.success(res.message);
            queryClient.invalidateQueries({ queryKey: ["get-wishlist"] });
        },
        onError: (err: any) => toast.error(err.message),
    });

    return {
        addItemMutation,
        updateQtyMutation,
        removeProductMutation,
        saveToWishlistMutation,
    };
};
