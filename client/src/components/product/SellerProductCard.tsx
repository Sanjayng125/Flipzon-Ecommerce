import Image from "next/image";
import React from "react";
import { ProductDelete } from "../product/ProductDelete";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { getPlainDescription } from "@/utils";

interface SellerProductCardProps {
  product: Product;
  refetch: () => void;
}

export const SellerProductCard = ({
  product,
  refetch,
}: SellerProductCardProps) => {
  return (
    <div key={product._id} className="grid grid-rows-1 border rounded-lg">
      {product.isFeatured && (
        <p className="text-xs p-1 bg-sky-700 text-white rounded-tl-lg rounded-br-lg absolute z-10">
          Featured
        </p>
      )}
      <div className="grid grid-rows-1 relative p-4">
        <Image
          src={product.images[0]?.url}
          alt={product.name}
          width={100}
          height={100}
          className="w-full h-40 object-contain rounded-md mb-2"
        />
        <h3 className="text-lg font-semibold mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-1 line-clamp-1">
          {getPlainDescription(product.description)}
        </p>
        <div className="flex justify-between items-center mb-1 space-x-1">
          <h2 className="font-semibold text-lg flex-1">
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
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              product.stock > 0
                ? "bg-green-200 text-green-800"
                : "bg-red-200 text-red-800"
            }`}
          >
            {product.stock > 0
              ? `In Stock: ${product.stock > 99 ? "99+" : product.stock}`
              : "Out of Stock"}
          </span>
        </div>

        {product.brand && (
          <div className="text-sm text-gray-500 mb-2">
            <strong>Brand:</strong> {product.brand}
          </div>
        )}
        <div className="text-sm text-gray-500 mb-2">
          <strong>Category:</strong> {product.category.name}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">sold: {product.sold}</span>
        </div>
      </div>
      <div className="w-full grid grid-cols-2 space-x-1 p-3">
        <ProductDelete productId={product._id} refetch={refetch} />
        <Link
          href={`/seller/my-products/edit/${product._id}`}
          className="bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600 disabled:opacity-50 text-center"
        >
          Edit
        </Link>
      </div>
    </div>
  );
};
