"use client";

import { InfiniteScroll } from "@/components/data_fetching/InfiniteScroll";
import { SearchProductCard } from "@/components/product/SearchProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import useFetch from "@/hooks/useFetch";
import { capatilize } from "@/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useMemo, useState } from "react";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { api } = useFetch();
  const [sort, setSort] = useState("latest");

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["get-category-products", slug, sort],
      queryFn: async ({ pageParam }) => {
        const res = await api(
          `/products?categorySlug=${slug}&sort=${sort}&page=${pageParam}&limit=10`
        );
        return res?.success
          ? res
          : { products: [], currentPage: 1, totalPages: 1 };
      },
      getNextPageParam: (lastPage) => {
        return lastPage.currentPage < lastPage.totalPages
          ? lastPage.currentPage + 1
          : null;
      },
      initialPageParam: 1,
      enabled: !!slug,
      staleTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: false,
    });

  const products: Product[] = useMemo(
    () => data?.pages.flatMap((page) => page?.products || []) || [],
    [data]
  );

  return (
    <div className="md:m-2">
      <div className="flex flex-col md:gap-2">
        <div className="p-2 border-b border-border-default flex items-center justify-between flex-wrap gap-2 bg-white">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg sm:text-xl">Category:</span>
            <span className="font-semibold sm:text-lg">
              {capatilize(slug.replace(/-/g, " "))}
            </span>
          </div>

          <div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full border-b data-[state=open]:bg-black/10 border-x-0 border-t-0 focus-visible:ring-0">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col justify-center items-center p-2">
            <Skeleton className="w-full h-52 bg-skeleton pb-2 mb-2"></Skeleton>
            <Skeleton className="w-full h-52 bg-skeleton pb-2 mb-2"></Skeleton>
            <Skeleton className="w-full h-52 bg-skeleton pb-2 mb-2"></Skeleton>
          </div>
        )}

        {!isLoading && !products?.length && (
          <h2 className="text-center">No products found!</h2>
        )}

        {!isLoading && products?.length > 0 && (
          <div className="pt-1 bg-white min-h-screen">
            <InfiniteScroll
              hasNextPage={hasNextPage}
              onLoadMore={fetchNextPage}
              isLoading={isFetchingNextPage}
              loader={
                <div className="flex itces-center justify-center my-2">
                  <Loader2 className="animate-spin size-10" />
                </div>
              }
              threshold={0}
              endPlaceholder="You have reached the end. No more products to show."
            >
              {products.map((product) => (
                <SearchProductCard key={product._id} product={product} />
              ))}
            </InfiniteScroll>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
