"use client";

import { useAuth } from "@/hooks/useAuth";
import useFetch from "@/hooks/useFetch";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { toast } from "sonner";
import { ArrowDown, Loader2 } from "lucide-react";
import { useAddress } from "@/hooks/useAddress";
import { Button } from "@/components/ui/button";
import { Delivery } from "@/components/header/Delivery";
import { load } from "@cashfreepayments/cashfree-js";

const CheckoutPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { fetchWithAuth } = useFetch();
  const { user, hasHydrated } = useAuth();
  const router = useRouter();
  const { selectedAddress } = useAddress();

  const {
    data: session,
    isFetched: isSessionFetched,
    isLoading: isSessionLoading,
  } = useQuery<CheckoutSession>({
    queryKey: ["checkout-session", sessionId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/checkout/${sessionId}`);
      if (res?.success) {
        return res.session;
      }
      return null;
    },
    enabled: !!sessionId && !!user,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  useEffect(() => {
    if (!user && hasHydrated) {
      return router.replace("/");
    }
  }, [user, hasHydrated, router]);

  useEffect(() => {
    if (isSessionFetched && !session) {
      router.replace("/");
    }
  }, [session, isSessionFetched, router]);

  const totals = useMemo(() => {
    if (!session) return { subtotal: 0, discount: 0, total: 0 };

    let subtotal = 0;
    let discount = 0;

    session.items.forEach(({ product, quantity }) => {
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
  }, [session]);

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const cashfreeInstance = await load({ mode: "sandbox" });

      if (!selectedAddress) {
        throw new Error("Please select a shipping address");
      }
      if (!cashfreeInstance) {
        throw new Error("Cashfree SDK failed to load");
      }
      const res = await fetchWithAuth(`/orders/create`, {
        method: "POST",
        body: JSON.stringify({ shippingAddress: selectedAddress, sessionId }),
      });

      if (!res?.success || !res?.paymentSessionId) {
        throw new Error(
          res?.message || "Something went wrong while placing order!"
        );
      }
      toast.success("Order created! Redirecting to payment...");
      await cashfreeInstance.checkout({
        paymentSessionId: res.paymentSessionId,
      });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to place order");
    },
  });

  if (isSessionLoading) {
    return (
      <div className="w-full mx-auto space-y-4 p-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="flex gap-4 p-4">
              <Skeleton className="w-20 h-20 rounded-md bg-skeleton" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3 bg-skeleton" />
                <Skeleton className="h-4 w-1/2 bg-skeleton" />
              </div>
              <Skeleton className="h-5 w-16 bg-skeleton" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex flex-col gap-2 justify-center p-1 md:p-2">
      <div className="w-full flex gap-1 max-lg:flex-col">
        <div className="lg:flex-1 p-1 md:p-2 pt-0 flex flex-col gap-1">
          {/* Address */}
          <div className="w-full bg-white flex items-center rounded-md p-2">
            <div className="w-full flex flex-col">
              <div className="flex items-center justify-between w-max max-md:w-full gap-2">
                <span className="font-semibold text-lg">Deliver to: </span>
                <Delivery isCheckout />
              </div>
              {selectedAddress && (
                <div className="flex flex-col">
                  <span className="truncate font-semibold">
                    {selectedAddress.fullName}
                  </span>
                  <span className="break-words">
                    {selectedAddress.streetAddress}, {selectedAddress.city},{" "}
                    {selectedAddress.postalCode}, {selectedAddress.country}
                  </span>
                  <span>{selectedAddress.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="mt-2 flex flex-col gap-1">
            {session.items.map(({ product, quantity }) => (
              <div
                key={product._id}
                className="w-full p-2 flex gap-2 bg-white rounded-md"
              >
                <Image
                  src={product?.images?.[0]?.url ?? ""}
                  width={100}
                  height={100}
                  alt={product?.name ?? "Not found"}
                  className="w-24 md:w-36 h-max object-contain border rounded-md mb-2"
                />

                <div className="w-full ml-2 flex flex-col items-start">
                  <p className="text-sm md:text-base break-all font-semibold">
                    {product?.name}
                  </p>
                  <p className="font-semibold text-lg">
                    {product?.discount ? (
                      <span className="flex items-center space-x-1.5 break-words flex-wrap">
                        <span>
                          ₹
                          {Math.floor(
                            product?.price -
                              (product?.discount / 100) * product?.price
                          )}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product?.price}
                        </span>
                        <span className="text-green-700 text-sm flex items-center space-x-1">
                          {product.discount}% Off{" "}
                          <ArrowDown className="size-5" />
                        </span>
                      </span>
                    ) : (
                      `₹${product?.price}`
                    )}
                  </p>
                  <p className="p-2 border bg-black/5 rounded-md">
                    Qty: {quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:w-[40%] lg:max-w-[470px] h-max m-1 md:m-2 p-4 rounded-lg bg-white">
          <h2 className="font-semibold text-xl border-b-2 pb-2 border-border-default">
            Order Summary
          </h2>

          <div className="flex flex-col gap-3 mt-4">
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

          <Button
            onClick={() => placeOrderMutation.mutate()}
            disabled={placeOrderMutation.isPending || isSessionLoading}
            className="w-full mt-4 flex items-center justify-center gap-2"
          >
            {placeOrderMutation.isPending || isSessionLoading ? (
              <>
                <Loader2 className="animate-spin size-5" />
                Processing...
              </>
            ) : (
              "Place Order"
            )}
          </Button>

          <div className="mt-3 flex justify-center">
            <Image
              src="/cashfree-logo.jpg"
              alt="Powered by Cashfree"
              width={120}
              height={30}
              className="opacity-80"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
