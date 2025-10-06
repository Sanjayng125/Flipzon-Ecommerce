"use client";

import useFetch from "@/hooks/useFetch";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { FeaturedCategoryCard } from "../category/FeaturedCategoryCard";
import { Skeleton } from "../ui/skeleton";

export const FeaturedCategories = () => {
  const { api } = useFetch();

  const { data: categories, isPending } = useQuery<Category[]>({
    queryKey: ["get-featured-categories"],
    queryFn: async () => {
      const res = await api("/categories/featured");

      if (res?.success) return res?.categories;
      return [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  if (!isPending && !categories?.length) return null;

  if (isPending) {
    return (
      <div className="w-full flex items-center hide-scrollbar">
        <div className="flex items-center gap-1 py-2">
          {new Array(10).fill("").map((_, i) => (
            <Skeleton
              className="w-20 h-20 rounded-full bg-skeleton"
              key={i}
            ></Skeleton>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-2 mt-2 rounded-md">
      <h2 className="font-semibold text-xl">Featured Categories</h2>
      <div className="w-full py-2 gap-1 flex items-center overflow-x-auto hide-scrollbar">
        {categories.map((category) => (
          <FeaturedCategoryCard category={category} key={category._id} />
        ))}
      </div>
    </div>
  );
};
