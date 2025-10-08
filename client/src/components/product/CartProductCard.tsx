import { ArrowDown, Heart, Loader2, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";

interface CartProductCardProps {
  data: {
    product: Product;
    quantity?: number;
  };
  updateQty?: ({ productId, qty }: { productId: string; qty: number }) => void;
  isLoading: boolean;
  removeProduct?: (id: string) => void;
  saveToWishlist: (id: string) => void;
}

export const CartProductCard = ({
  data: { product, quantity },
  updateQty,
  isLoading,
  removeProduct,
  saveToWishlist,
}: CartProductCardProps) => {
  return (
    <div className="w-full py-2 flex gap-2 border border-border-default rounded-md">
      <Link href={`/products/${product?._id}`}>
        <div className="flex justify-center cursor-pointer p-1">
          <Image
            src={product?.images?.[0]?.url ?? ""}
            width={100}
            height={100}
            alt={product?.name ?? "Not found"}
            className="w-40 object-contain rounded-md mb-2"
          />
        </div>
      </Link>

      <div className="w-full ml-2 space-y-1 flex flex-col items-start">
        <h2 className="font-semibold text-lg">
          {product?.discount ? (
            <p className="flex items-center space-x-1.5 break-words flex-wrap">
              <span>
                ₹
                {Math.floor(
                  product?.price - (product?.discount / 100) * product?.price
                )}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ₹{product?.price}
              </span>
              <span className="text-green-700 text-sm flex items-center space-x-1">
                {product.discount}% Off <ArrowDown className="size-5" />
              </span>
            </p>
          ) : (
            `₹${product?.price}`
          )}
        </h2>
        <Link
          href={`/products/${product._id}`}
          className="text-sm break-words font-semibold hover:underline cursor-pointer"
        >
          {product?.name}
        </Link>

        <div className="flex items-center justify-center">
          <Select
            onValueChange={(val) =>
              updateQty &&
              updateQty({ productId: product._id, qty: Number(val) })
            }
          >
            <SelectTrigger
              size="sm"
              disabled={isLoading}
              className="cursor-pointer"
            >
              Qty: <SelectValue placeholder={quantity} />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem
                value={"1"}
                className="hover:bg-black/10 cursor-pointer"
              >
                1
              </SelectItem>
              <SelectItem
                value={"2"}
                className="hover:bg-black/10 cursor-pointer"
              >
                2
              </SelectItem>
              <SelectItem
                value={"3"}
                className="hover:bg-black/10 cursor-pointer"
              >
                3
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={"outline"}
            onClick={() => saveToWishlist(product?._id)}
            disabled={isLoading}
            className="cursor-pointer"
          >
            Save to wishlist{" "}
            {isLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Heart className="size-5" />
            )}
          </Button>

          <Button
            className="bg-red-500 text-white hover:bg-red-700 py-1 px-2 rounded-md cursor-pointer"
            onClick={() => removeProduct && removeProduct(product?._id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Trash className="size-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
