import Image from "next/image";
import React from "react";
import Link from "next/link";
import { ArrowDown, Star } from "lucide-react";
import { AddToCartBtn } from "./AddToCartBtn";
import { getPlainDescription } from "@/utils";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div
      key={product._id}
      className="grid grid-rows-1 border rounded-lg w-full group"
    >
      <Link
        href={`/products/${product._id}`}
        className="grid grid-rows-1 relative p-1 sm:p-2"
      >
        <Image
          src={product.images[0]?.url}
          alt={product.name}
          width={100}
          height={100}
          className="w-full h-40 object-contain rounded-md mb-2"
        />
        <div className="mb-1">
          <h3 className="text-sm sm:text-sm md:text-base font-semibold break-all group-hover:text-blue-600 line-clamp-2">
            {product.name}
          </h3>

          {/* Ratings */}
          <div className="flex items-center space-x-2">
            <p className="bg-green-600 text-white rounded-md flex items-center w-fit px-1 space-x-0.5">
              <span className="text-xs sm:text-sm md:text-base font-semibold">
                {product?.avgRating?.toFixed(1)}
              </span>
              <Star className="size-3 md:size-4" />
            </p>

            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {product?.totalRatings} Ratings
            </p>
          </div>
        </div>
        <p className="max-sm:hidden text-sm text-gray-600 mb-1 line-clamp-2">
          {getPlainDescription(product.description)}
        </p>

        <div className="flex justify-between items-center mb-1 flex-wrap space-x-1">
          <h2 className="font-semibold sm:text-lg flex-1">
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
        </div>
      </Link>
      <div className="w-full grid sm:p-2">
        <AddToCartBtn productId={product._id} />
      </div>
    </div>
  );
};
