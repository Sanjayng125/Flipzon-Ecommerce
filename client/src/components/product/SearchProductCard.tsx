import { ArrowDown, Star } from "lucide-react";
import React from "react";
import { AddToCartBtn } from "./AddToCartBtn";
import { getPlainDescription } from "@/utils";
import Image from "next/image";
import Link from "next/link";

interface SearchProductCardProps {
  product: Product;
}

export const SearchProductCard = ({ product }: SearchProductCardProps) => {
  return (
    <div className="flex space-x-2 border-b border-border-default pb-2 mb-2 group px-1">
      {/* Image Section */}
      <div className="shrink-0 relative">
        {product.isFeatured && (
          <p className="bg-gray-700 text-white p-1 text-[10px] sm:text-xs absolute rounded-sm left-1">
            Flipzon&apos;s choice
          </p>
        )}

        <Image
          src={product.images[0]?.url}
          alt={product.name}
          width={100}
          height={100}
          className="w-28 sm:w-40 h-28 sm:h-40 object-contain m-2"
        />
      </div>

      {/* Details Section */}
      <div className="flex flex-col flex-1">
        <Link href={`/products/${product._id}`}>
          <div className="mb-1">
            <h3 className="text-base font-semibold break-all group-hover:text-blue-600 line-clamp-2">
              {product.name}
            </h3>

            {/* Ratings */}
            <div className="flex items-center space-x-2">
              <p className="bg-green-600 text-white rounded-md flex items-center w-fit px-1 space-x-0.5">
                <span className="text-sm font-semibold">
                  {product.avgRating.toFixed(1)}
                </span>
                <Star className="size-3" />
              </p>

              <p className="text-sm text-gray-600">
                {product.totalRatings} Ratings
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1 line-clamp-3 break-all">
            {getPlainDescription(product.description)}
          </p>

          {/* Price & Discount */}
          <h2 className="font-semibold text-lg">
            {product?.discount ? (
              <p className="flex items-center gap-1 break-words flex-wrap truncate">
                <span>
                  ₹
                  {Math.floor(
                    product.price - (product.discount / 100) * product.price
                  )}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.price}
                </span>
                <span className="text-green-700 text-sm flex items-center space-x-1">
                  {product.discount}% Off <ArrowDown className="size-5" />
                </span>
              </p>
            ) : (
              `₹${product.price}`
            )}
          </h2>
        </Link>

        <AddToCartBtn
          productId={product._id}
          className="w-max max-md:py-1 max-md:px-1.5 max-md:text-xs"
        />
      </div>
    </div>
  );
};
