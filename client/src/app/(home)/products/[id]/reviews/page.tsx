"use client";

import { PaginationControls } from "@/components/PaginationControls";
import { ReviewCard } from "@/components/Rating/ReviewCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import useFetch from "@/hooks/useFetch";
import { Rating } from "@smastrom/react-rating";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useState } from "react";

const ReviewsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { api } = useFetch();

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

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

  const {
    data,
    isPending: isReviewsPending,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ["all-reviews", id, page, sort, filter],
    queryFn: async () => {
      const res = await api(
        `/reviews/${id}?page=${page}&limit=${limit}&search=${searchQuery.trim()}&sort=${sort}&filter=${filter}`
      );
      return res?.success ? res : null;
    },
    enabled: !!product,
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
      <div className="w-full mx-auto md:p-2 flex gap-2">
        <Skeleton className="w-full h-36 bg-skeleton"></Skeleton>
        <Skeleton className="w-full h-36 bg-skeleton"></Skeleton>
      </div>
    );
  }

  const reviews: Review[] = data?.reviews || [];
  const currentPage = data?.currentPage || page;
  const totalPages = data?.totalPages || page;

  return (
    <div className="w-full mx-auto md:p-2">
      <div className="bg-white p-2 min-h-screen">
        <div className="flex md:gap-4 max-md:flex-col mb-2">
          <div className="bg-white shrink-0">
            <h2 className="text-xl font-semibold">Customer Reviews</h2>

            <div className="flex items-center space-x-1">
              <Rating className="max-w-28" value={product.avgRating} readOnly />
              <p>{product?.avgRating?.toFixed(1)} out of 5</p>
            </div>
            <p className="text-gray-500 text-sm">
              {product?.totalRatings} total ratings
            </p>
          </div>

          <div className="flex max-md:mt-2 gap-2">
            <Image
              alt="img"
              src={product.images[0].url}
              width={100}
              height={100}
              className="w-16 h-16 shrink-0"
            />
            <h2 className="text-sm sm:text-base font-semibold">
              {product.name}
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center">
            <Input
              placeholder="Search reviews by title..."
              className="w-full md:w-1/2 lg:w-1/3 p-3"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  refetchReviews();
                }
              }}
            />
            <Button className="ml-2 p-3" onClick={() => refetchReviews()}>
              Search
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">Sort By:</Label>
              <Select onValueChange={(value) => setSort(value)} value={sort}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="ratingAsc">Rating Ascending</SelectItem>
                  <SelectItem value="ratingDesc">Rating Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">Filter by rating:</Label>
              <Select
                onValueChange={(value) => {
                  setSort("newest");
                  setFilter(value);
                }}
                value={filter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars only</SelectItem>
                  <SelectItem value="4">4 Stars only</SelectItem>
                  <SelectItem value="3">3 Stars only</SelectItem>
                  <SelectItem value="2">2 Stars only</SelectItem>
                  <SelectItem value="1">1 Stars only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="">
            {isReviewsPending && (
              <div className="flex flex-col gap-2">
                <Skeleton className="w-full h-32 bg-skeleton"></Skeleton>
                <Skeleton className="w-full h-32 bg-skeleton"></Skeleton>
              </div>
            )}
            {!isReviewsPending && reviews.length == 0 && (
              <p className="text-center">No reviews found!</p>
            )}
            {!isReviewsPending &&
              reviews.length > 0 &&
              reviews?.map((review) => (
                <ReviewCard review={review} maxChars={300} key={review._id} />
              ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
