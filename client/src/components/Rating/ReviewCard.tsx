import { formatDate } from "@/utils";
import { Rating } from "@smastrom/react-rating";
import Image from "next/image";
import React, { useState } from "react";

interface ReviewCardProps {
  review: Review;
  maxChars?: number;
}

export const ReviewCard = ({ review, maxChars = 200 }: ReviewCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const displayContent =
    review?.reviewContent &&
    (expanded
      ? review.reviewContent
      : review.reviewContent.length > maxChars
      ? review.reviewContent.slice(0, maxChars) + "..."
      : review.reviewContent);

  return (
    <div className="mt-2 flex flex-col gap-1">
      <div className="flex items-center">
        <div className="flex items-center space-x-2">
          <Image
            alt="img"
            src={review.user.avatar.url}
            width={50}
            height={50}
            className="rounded-full w-9 h-9"
          />
          <p className="text-sm text-gray-500">{review.user.name}</p>
        </div>
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <Rating className="max-w-20" value={review.rating} readOnly />
          <p className="text-sm font-semibold">{review.title}</p>
        </div>
        <p className="text-xs text-gray-500">
          Reviewed on {formatDate(review.createdAt, false)}
        </p>
      </div>
      <div className="text-sm">
        <p>{displayContent}</p>

        {review?.reviewContent && review?.reviewContent?.length > maxChars && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-blue-600 hover:underline text-xs"
          >
            {expanded ? "Read less ▲" : "Read more ▼"}
          </button>
        )}
      </div>
    </div>
  );
};
