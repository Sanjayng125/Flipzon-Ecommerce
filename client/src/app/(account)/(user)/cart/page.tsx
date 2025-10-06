"use client";

import { CartProductCard } from "@/components/product/CartProductCard";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/cart/useCart";
import useFetch from "@/hooks/useFetch";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useMemo } from "react";
import { useCartActions } from "@/hooks/cart/useCartActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAddress } from "@/hooks/useAddress";
import { Spinner } from "@/components/Spinner";

const CartPage = () => {
  const { user } = useAuth();
  const { setCart } = useCart();
  const { fetchWithAuth } = useFetch();
  const { updateQtyMutation, removeProductMutation, saveToWishlistMutation } =
    useCartActions();
  const router = useRouter();
  const { Addresses } = useAddress();

  const { data: cart, isLoading: isCartLoading } = useQuery<Cart>({
    queryKey: ["get-cart"],
    queryFn: async () => {
      if (!user) return null;
      const res = await fetchWithAuth("/cart?populate=true");
      if (res?.success) {
        setCart(res.cart);
        return res.cart;
      }
      return null;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  const totals = useMemo(() => {
    if (!cart || cart.items.length === 0)
      return { subtotal: 0, discount: 0, total: 0 };

    let subtotal = 0;
    let discount = 0;

    cart.items.forEach(({ product, quantity }) => {
      const price = product.price * quantity;
      subtotal += price;
      if (product.discount) {
        discount += product.price * (product.discount / 100) * quantity;
      }
    });

    return {
      subtotal,
      discount: discount.toFixed(2),
      total: (subtotal - discount).toFixed(2),
    };
  }, [cart]);

  const createCheckoutSessionMutation = useMutation({
    mutationFn: async (items: CheckoutItem[]) => {
      const res = await fetchWithAuth(
        `/checkout/create?buyType=cart-checkout`,
        {
          method: "POST",
          body: JSON.stringify({ items }),
        }
      );
      if (!res?.success)
        throw new Error(res?.message || "Failed to create checkout session!");
      return res;
    },
    onSuccess: (res) => {
      if (res?.sessionId) {
        router.push(`/checkout/${res.sessionId}`);
        return;
      }
      toast.error(res?.message || "Failed to create checkout session!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleCheckout = () => {
    if (!cart || cart?.items.length === 0) return;

    if (!Addresses || Addresses.length === 0) {
      toast.error("Add a Address first!.");
      router.push("/addresses");
      return;
    }

    const items: CheckoutItem[] = cart.items.map((item) => {
      return {
        product: item.product._id.toString(),
        quantity: item.quantity,
      };
    });

    createCheckoutSessionMutation.mutate(items);
  };

  if (isCartLoading && !cart) {
    return <Spinner className="min-h-screen" />;
  }

  return (
    <div className="flex justify-center p-2">
      {(!cart || !cart?.items?.length) && (
        <div className="w-full">
          <h2 className="text-center">Your cart is empty.</h2>
        </div>
      )}

      {cart && cart?.items?.length > 0 && (
        <div className="w-full flex gap-2 max-lg:flex-col">
          {/* Products */}
          <div className="lg:flex-1 pt-0 flex flex-col gap-2">
            {cart.items.map((product: CartItem) => (
              <CartProductCard
                data={product}
                key={product.product?._id}
                updateQty={updateQtyMutation.mutate}
                isLoading={
                  updateQtyMutation.isPending ||
                  removeProductMutation.isPending ||
                  saveToWishlistMutation.isPending ||
                  createCheckoutSessionMutation.isPending
                }
                removeProduct={removeProductMutation.mutate}
                saveToWishlist={saveToWishlistMutation.mutate}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="lg:min-w-[40%] h-max rounded-lg border border-border-default shadow-sm bg-white">
            <h2 className="font-semibold text-xl border-b p-2 border-border-default">
              Order Summary
            </h2>

            {cart?.items?.length && (
              <>
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-700">Subtotal</p>
                    <p className="font-semibold">₹{totals.subtotal}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-700">Discount</p>
                    <p className="font-semibold">-₹{totals.discount}</p>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3">
                    <h2 className="font-bold text-lg">Total</h2>
                    <h2 className="font-bold text-lg">₹{totals.total}</h2>
                  </div>
                </div>

                <div className="px-2">
                  <button
                    onClick={handleCheckout}
                    disabled={
                      updateQtyMutation.isPending ||
                      removeProductMutation.isPending ||
                      saveToWishlistMutation.isPending ||
                      createCheckoutSessionMutation.isPending
                    }
                    className="w-full bg-sky-800 hover:bg-sky-900 transition-all text-white font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {createCheckoutSessionMutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin size-5" />
                        Processing...
                      </>
                    ) : (
                      "Checkout"
                    )}
                  </button>

                  <div className="my-3 flex justify-center">
                    <Image
                      src="/cashfree-logo.jpg"
                      alt="Powered by Cashfree"
                      width={120}
                      height={30}
                      className="opacity-80"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
