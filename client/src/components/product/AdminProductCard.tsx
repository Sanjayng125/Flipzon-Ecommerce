"use client";

import Image from "next/image";
import React from "react";
import { ProductDelete } from "../product/ProductDelete";
import { Loader2 } from "lucide-react";
import { Switch } from "../ui/switch";
import { getPlainDescription } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import useFetch from "@/hooks/useFetch";

interface AdminProductCardProps {
  product: Product;
  refetch: () => void;
}

export const AdminProductCard = ({
  product,
  refetch,
}: AdminProductCardProps) => {
  const { fetchWithAuth } = useFetch();

  const { mutate: updateFeaturedMutation, isPending: updateFeaturedIsLoading } =
    useMutation({
      mutationFn: async (id: string) => {
        const res = await fetchWithAuth(`/products/featured/${id}`, {
          method: "PATCH",
        });

        if (!res?.success) {
          toast.error(res?.message || "Failed to update featured!");
        }

        return res;
      },
      onSuccess: (res) => {
        toast.success(res?.message);
        refetch();
      },
    });

  return (
    <div
      key={product._id}
      className="border rounded-lg p-4 grid grid-rows-1 relative"
    >
      {product.isFeatured && (
        <p className="text-xs p-1 bg-sky-700 text-white rounded-tl-lg rounded-br-lg absolute z-10">
          Featured
        </p>
      )}
      <Image
        src={product.images[0]?.url}
        alt={product.name}
        width={100}
        height={100}
        className="w-full h-40 object-contain rounded-md mb-2"
      />
      <h3 className="text-lg font-semibold mb-1 line-clamp-2">
        {product.name}
      </h3>
      <p className="text-sm text-gray-600 mb-1 line-clamp-2">
        {getPlainDescription(product.description)}
      </p>
      <div className="flex justify-between items-center mb-1">
        <span className="text-lg font-semibold text-green-600">
          ₹{product.price.toFixed(2)}
        </span>
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            product.stock > 0
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {product.stock > 0 ? `In Stock: ${product.stock}` : "Out of Stock"}
        </span>
      </div>

      <div className="text-sm text-gray-500 mb-1">
        <strong>Category:</strong> {product.category.name}
      </div>

      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-500">
          Seller: {product.seller.name}
        </span>
        <span className="text-sm text-gray-500">{product.sold} sold</span>
      </div>

      <div className="flex items-center gap-1 text-sm mb-1">
        <p>IsFeatured?:</p>
        <Switch
          checked={product.isFeatured}
          disabled={updateFeaturedIsLoading}
          onCheckedChange={() => updateFeaturedMutation(product._id)}
        />
        {updateFeaturedIsLoading && <Loader2 className="animate-spin size-5" />}
      </div>

      <ProductDelete productId={product._id} refetch={refetch} />
    </div>
  );
};
