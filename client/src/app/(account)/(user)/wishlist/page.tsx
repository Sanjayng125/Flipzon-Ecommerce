"use client";

import { PaginationControls } from "@/components/PaginationControls";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import useFetch from "@/hooks/useFetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, Loader2, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";

const WishlistPage = () => {
  const { fetchWithAuth } = useFetch();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const { data, isLoading: isWishlistLoading } = useQuery({
    queryKey: ["get-wishlist"],
    queryFn: async () => {
      if (!user) {
        return null;
      }
      const res = await fetchWithAuth(`/wishlist?page=${page}&limit=10`);
      if (!res?.success) {
        throw new Error(res?.message);
      }

      return res;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
    refetchOnReconnect: false,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const removeProductMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        throw new Error("Product ID missing!");
      }

      const res = await fetchWithAuth(`/wishlist/${id}`, {
        method: "PATCH",
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to remove product!");
      }

      return res;
    },
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["get-wishlist"] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const clearWishlistMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(`/wishlist`, {
        method: "DELETE",
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to clear wishlist!");
      }

      return res;
    },
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["get-wishlist"] });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  if (isWishlistLoading) {
    return <Spinner className="min-h-screen" />;
  }

  const products: Product[] = data?.products || [];
  const currentPage = data?.currentPage || 1;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="flex justify-center p-2">
      {!isWishlistLoading && products.length <= 0 && (
        <h2 className="text-center">Your Wishlist is empty.</h2>
      )}

      {products.length > 0 && (
        <div className="w-full flex flex-col gap-2">
          <Button
            onClick={() => clearWishlistMutation.mutate()}
            disabled={clearWishlistMutation.isPending}
            className="w-max"
          >
            {clearWishlistMutation.isPending ? "Clearing" : "Clear Wishlist"}
          </Button>

          {/* Products */}
          {products.map((product) => (
            <div
              className="w-full py-2 flex gap-2 border border-border-default rounded-md"
              key={product._id}
            >
              <Link href={`/products/${product?._id}`}>
                <div className="flex justify-center cursor-pointer p-1">
                  <Image
                    src={product?.images?.[0]?.url ?? ""}
                    width={100}
                    height={100}
                    alt={product?.name ?? "Not found"}
                    className="w-40 object-contain rounded-md mb-2"
                  />
                </div>
              </Link>

              <div className="w-full ml-2 mr-1 space-y-1 flex flex-col items-start">
                <h2 className="font-semibold text-lg">
                  {product?.discount ? (
                    <p className="flex items-center space-x-1.5 break-words flex-wrap">
                      <span>
                        ₹
                        {Math.floor(
                          product?.price -
                            (product?.discount / 100) * product?.price
                        )}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ₹{product?.price}
                      </span>
                      <span className="text-green-700 text-sm flex items-center space-x-1">
                        {product.discount}% Off <ArrowDown className="size-5" />
                      </span>
                    </p>
                  ) : (
                    `₹${product?.price}`
                  )}
                </h2>
                <Link
                  href={`/products/${product._id}`}
                  className="text-sm break-words font-semibold hover:underline cursor-pointer"
                >
                  {product?.name}
                </Link>

                <p className="text-green-700 font-semibold text-sm">
                  {product?.stock && "In Stock"}
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    className="bg-red-500 text-white hover:bg-red-700 py-1 px-2 rounded-md"
                    onClick={() => removeProductMutation.mutate(product?._id)}
                    disabled={
                      removeProductMutation.isPending ||
                      clearWishlistMutation.isPending
                    }
                  >
                    {removeProductMutation.isPending ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <Trash className="size-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <PaginationControls
            currentPage={currentPage}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
