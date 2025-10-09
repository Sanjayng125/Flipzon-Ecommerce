"use client";

import useFetch from "@/hooks/useFetch";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { ProductCard } from "../product/ProductCard";
import { Skeleton } from "../ui/skeleton";

export const FeaturedProducts = () => {
  const { api } = useFetch();

  const { data: products, isPending } = useQuery<Product[]>({
    queryKey: ["get-featured-products"],
    queryFn: async () => {
      const res = await api("/products?featured=true&limit=6");

      return res.products;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  if (!isPending && !products?.length) return null;

  if (isPending) {
    return (
      <div className="py-2 gap-2 grid grid-cols-1 min-[300px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <Skeleton className="w-full h-72 bg-skeleton"></Skeleton>
        <Skeleton className="w-full h-72 bg-skeleton"></Skeleton>
        <Skeleton className="w-full h-72 bg-skeleton"></Skeleton>
        <Skeleton className="w-full h-72 bg-skeleton"></Skeleton>
      </div>
    );
  }

  return (
    <div className="bg-white p-2 mt-2 rounded-md">
      <h2 className="font-semibold text-xl">Featured Products</h2>
      <div className="py-2 gap-2 grid grid-cols-1 min-[300px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard product={product} key={product._id} />
        ))}
      </div>
    </div>
  );
};
