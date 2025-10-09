"use client";

import { InfiniteScroll } from "@/components/data_fetching/InfiniteScroll";
import { GoToTopBtn } from "@/components/home/GoToTopBtn";
import { SearchProductCard } from "@/components/product/SearchProductCard";
import { Filters } from "@/components/search/filters";
import { Skeleton } from "@/components/ui/skeleton";
import useFetch from "@/hooks/useFetch";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect } from "react";

const SearchPage = () => {
  const { api } = useFetch();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!searchParams.get("q")) {
      router.replace("/");
    }
  }, [searchParams, router]);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["search-products", searchParams.toString()],
      queryFn: async ({ pageParam }) => {
        const res = await api(
          `/products?${searchParams}&page=${pageParam}&limit=15`
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
      enabled: !!searchParams.get("q"),
      staleTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: false,
    });

  const products: Product[] =
    data?.pages.flatMap((page) => page?.products || []) || [];

  return (
    <div className="flex min-h-screen max-md:flex-col md:m-2 md:gap-2">
      <Suspense fallback={<div>Loading filters...</div>}>
        <Filters />
      </Suspense>

      <div className="flex-1 bg-white">
        <div className="md:mt-2">
          <h2 className="font-semibold text-lg sm:text-xl p-2 border-b border-border-default">
            Search results:
          </h2>

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
            <div className="pt-1">
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

      <GoToTopBtn />
    </div>
  );
};

export default SearchPage;
