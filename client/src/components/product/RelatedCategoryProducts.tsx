"use client";

import useFetch from "@/hooks/useFetch";
import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import { ArrowDown, Loader2, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { InfiniteScroll } from "../data_fetching/InfiniteScroll";

interface RelatedCategoryProductsProps {
  product: Product;
}

export const RelatedCategoryProducts = ({
  product,
}: RelatedCategoryProductsProps) => {
  const { api } = useFetch();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [
        "get-related-category-products",
        product.category.parentCategory,
        product._id,
      ],
      queryFn: async ({ pageParam }) => {
        const res = await api(
          `/products/related/${product.category.parentCategory}?page=${pageParam}&limit=10`
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
      staleTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
    });

  const products: Product[] =
    data?.pages.flatMap((page) => page?.products || []) || [];

  if (!isLoading && !products?.length) return null;

  if (isLoading) {
    return (
      <div className="mt-2 bg-white p-2">
        <div className="flex overflow-x-auto py-2 hide-scrollbar">
          <div className="flex gap-2">
            <Skeleton className="w-48 h-60 bg-skeleton"></Skeleton>
            <Skeleton className="w-48 h-60 bg-skeleton"></Skeleton>
            <Skeleton className="w-48 h-60 bg-skeleton"></Skeleton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col md:gap-2">
      <div className="bg-white p-2">
        <h2 className="text-xl font-semibold">Related Category Products</h2>

        <div className="flex overflow-x-auto gap-2 py-2 hide-scrollbar">
          <InfiniteScroll
            hasNextPage={hasNextPage}
            onLoadMore={fetchNextPage}
            isLoading={isFetchingNextPage}
            loader={
              <div className="w-48 flex itces-center justify-center my-auto">
                <Loader2 className="animate-spin size-1/3" />
              </div>
            }
            direction="horizontal"
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

function ProductCard({ product }: { product: Product }) {
  return (
    <div
      key={product._id}
      className="w-48 md:w-56 border rounded-lg group shrink-0 flex flex-col"
    >
      <Link
        href={`/products/${product._id}`}
        className="p-2 flex flex-col flex-1"
      >
        <Image
          src={product.images[0]?.url}
          alt={product.name}
          width={100}
          height={100}
          className="w-full h-28 object-contain rounded-md mb-2"
        />
        <div className="flex-1 flex flex-col justify-between gap-1">
          <div>
            <h3 className="text-sm font-semibold group-hover:text-blue-600 line-clamp-2">
              {product.name}
            </h3>
            <div className="flex items-center space-x-2 mt-0.5">
              <p className="bg-green-600 text-white rounded-md flex items-center w-fit px-1 space-x-0.5">
                <span className="text-sm font-semibold">
                  {product?.avgRating?.toFixed(1)}
                </span>
                <Star className="size-3" />
              </p>
              <p className="text-sm text-gray-600">
                {product?.totalRatings} Ratings
              </p>
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-sm md:text-base">
              {product?.discount ? (
                <div className="flex items-center gap-1 flex-wrap">
                  <span>
                    ₹
                    {Math.floor(
                      product.price - (product.discount / 100) * product.price
                    )}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ₹{product.price}
                  </span>
                  <span className="text-green-700 text-sm flex items-center">
                    {product.discount}% Off <ArrowDown className="size-5" />
                  </span>
                </div>
              ) : (
                `₹${product.price}`
              )}
            </h2>
          </div>
        </div>
      </Link>
    </div>
  );
}
