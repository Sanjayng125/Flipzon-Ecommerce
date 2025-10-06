"use client";

import { useAuth } from "@/hooks/useAuth";
import React from "react";
import { ReviewModal } from "./ReviewModal";
import { ReviewCard } from "./ReviewCard";
import { Separator } from "../ui/separator";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Rating } from "@smastrom/react-rating";

interface ReviewProps {
  product: Product;
}

export const Review = ({ product }: ReviewProps) => {
  const { user } = useAuth();

  return (
    <div className="mt-2 flex flex-col md:gap-2">
      <div className="bg-white p-2">
        <h2 className="text-xl font-semibold">Customer Reviews</h2>

        <div className="max-md:pb-2 max-md:border-b border-border-default">
          <div className="flex items-center space-x-1">
            <Rating className="max-w-28" value={product?.avgRating} readOnly />
            <p>{product?.avgRating?.toFixed(1)} out of 5</p>
          </div>
          <p className="text-gray-500 text-sm">
            {product?.totalRatings} total ratings
          </p>
        </div>
      </div>

      <div className="flex md:gap-2 lg:gap-4 max-md:flex-col">
        {user && user.role === "user" && (
          <>
            <div className="bg-white px-2 pb-2 md:pt-2 h-fit md:min-w-[35%] md:max-w-[35%] lg:min-w-[30%] lg:max-w-[30%]">
              <div className="mb-2">
                <h2 className="text-lg font-semibold">Review this product</h2>
                <p className="text-sm text-gray-500">
                  Share your experience with our customers
                </p>
              </div>
              <ReviewModal productId={product._id} />
            </div>
            <Separator className="md:hidden" />
          </>
        )}

        <div className="bg-white w-full p-2">
          <h2 className="text-lg font-semibold">Latest reviews</h2>

          {product?.latestReviews?.length > 0 ? (
            <>
              <div className="flex flex-col gap-2 mb-2">
                {product?.latestReviews?.map((review) => (
                  <ReviewCard review={review} maxChars={300} key={review._id} />
                ))}
              </div>

              <Separator />
              <Link
                href={`/products/${product._id}/reviews`}
                className="w-max text-sm hover:underline flex items-center mt-2"
              >
                See all reviews <ArrowRight className="size-5" />
              </Link>
            </>
          ) : (
            <p>No reviews yet</p>
          )}
        </div>
      </div>
    </div>
  );
};
