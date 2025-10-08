"use client";

import useFetch from "@/hooks/useFetch";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";

export const Category = () => {
  const pathname = usePathname();
  const { api } = useFetch();
  const { data, isLoading, error, isFetched } = useQuery<Category[]>({
    queryKey: ["get-categories-bar"],
    queryFn: async () => {
      const res = await api(
        "/categories?showInCategoryBar=true&sort=oldest&limit=30"
      );
      if (!res?.success) {
        throw new Error(res?.message);
      }
      return res.categories;
    },
    staleTime: 1000 * 60 * 10, // 10mins
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const isActive = (name: string) => {
    return pathname === name;
  };

  useEffect(() => {
    if (error) {
      toast.error(
        error.message || "Something went wrong while fetching categories!"
      );
    }
  }, [error]);

  if (!isLoading && (!data || data.length === 0) && isFetched) return null;

  return (
    <div className="border-y-2 border-border-default bg-[#fff] flex overflow-x-scroll hide-scrollbar px-2 py-1 md:py-3 space-x-3">
      {!isLoading && data
        ? data?.map((item, i) => (
            <Link href={`/category/${item.slug}`} key={i}>
              <button
                className={`${
                  isActive(`/category/${item.slug}`)
                    ? "bg-sky-800 text-white"
                    : "bg-[#E2E8F0] text-[#1E293B]"
                } px-3 md:px-4 py-1.5 md:py-2 hover:bg-sky-900 hover:text-white transition text-nowrap capitalize rounded-full max-sm:text-sm cursor-pointer`}
              >
                {item.name}
              </button>
            </Link>
          ))
        : Array.from(Array(20)).map((_, i) => (
            <Skeleton
              className="rounded-full w-[86px] h-9 sm:w-24 sm:h-10 bg-skeleton shrink-0"
              key={i}
            />
          ))}
    </div>
  );
};
