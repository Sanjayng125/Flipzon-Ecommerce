import { ArrowDown, ShoppingCart, Star } from "lucide-react";
import React from "react";
import CollapsibleMarkdown from "./CollapsibleMarkdown";

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">{product.name}</h1>

        {/* Ratings */}
        <div className="flex items-center space-x-2 mt-1">
          <p className="bg-green-600 text-white rounded-md flex items-center w-fit px-1 space-x-0.5">
            <span className="text-sm font-semibold">
              {product?.avgRating?.toFixed(1)}
            </span>
            <Star className="size-3" />
          </p>

          <p className="text-sm text-gray-600">
            {product?.totalRatings} Ratings
          </p>

          {product.isFeatured && (
            <p className="bg-gray-500 text-white p-1 text-xs rounded-md flex items-center">
              Featured by - <ShoppingCart className="size-4" /> Flipzon
            </p>
          )}
        </div>
      </div>

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

      <div>
        {product?.brand && (
          <p className="text-sm">
            <b>Brand: </b>
            {product.brand}
          </p>
        )}
        {product?.category && (
          <p className="text-sm">
            <b>Category: </b>
            {product.category.name}
          </p>
        )}
        {product?.seller && (
          <p className="text-sm">
            <b>Sold by: </b>
            {product.seller.storeName || product.seller.name}
          </p>
        )}
      </div>

      <CollapsibleMarkdown content={product.description} maxChars={300} />
    </div>
  );
};
