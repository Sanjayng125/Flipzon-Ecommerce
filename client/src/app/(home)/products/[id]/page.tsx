"use client";

import { ProductCarousel } from "@/components/product/ProductCarousel";
import useFetch from "@/hooks/useFetch";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

import "@smastrom/react-rating/style.css";
import { Review } from "@/components/Rating/Review";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductActions } from "@/components/product/ProductActions";
import { SameCategoryProducts } from "@/components/product/SameCategoryProducts";
import { RelatedCategoryProducts } from "@/components/product/RelatedCategoryProducts";

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { api } = useFetch();

  const { data: product, isPending } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await api(`/products/${id}`);
      return res?.success ? res.product : null;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  if (!isPending && !product) {
    return <h2 className="text-center">Product not found!</h2>;
  }

  if (isPending) {
    return (
      <div className="w-full mx-auto md:p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2">
          <Skeleton className="w-full h-1/2 bg-skeleton"></Skeleton>
          <Skeleton className="w-full h-screen bg-skeleton"></Skeleton>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto md:p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2">
        {/* Carousel */}
        <div className="w-full max-md:px-1">
          <ProductCarousel images={product?.images} />
        </div>

        {/* Details & Actions */}
        <div className="flex flex-col gap-2 bg-white p-3 max-md:mt-2">
          <ProductInfo product={product} />

          <ProductActions product={product} />
        </div>
      </div>

      {/* review */}
      <Review product={product} />

      {/* same category products */}
      <SameCategoryProducts product={product} />

      {/* related category products */}
      {product?.category.parentCategory && (
        <RelatedCategoryProducts product={product} />
      )}
    </div>
  );
};

export default ProductPage;
