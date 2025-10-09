"use client";

import useFetch from "@/hooks/useFetch";
import { Check, ChevronDown, MapPin } from "lucide-react";
import React, { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useAddress } from "@/hooks/useAddress";
import { Button } from "../ui/button";

interface DeliveryProps {
  isCheckout?: boolean;
  disabled?: boolean;
}

export const Delivery = ({
  isCheckout = false,
  disabled = false,
}: DeliveryProps) => {
  const { fetchWithAuth } = useFetch();
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const { user } = useAuth();
  const { Addresses, setAddresses, selectedAddress, setSelectedAddress } =
    useAddress();
  const [open, setOpen] = useState(false);
  const isUser = user?.role === "user";

  const { isLoading } = useQuery({
    queryKey: ["get-my-addresses"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetchWithAuth("/address");
      if (res?.success) {
        setAddresses(res.addresses);
        getDefaultAddress(res.addresses);
        return res.addresses;
      }
      return [];
    },
    enabled: isUser,
    staleTime: 1000 * 60 * 10,
  });

  const getDefaultAddress = (addresses: Address[]) => {
    if (addresses?.filter((address) => address.isDefault).length > 0) {
      setDefaultAddress(addresses?.filter((address) => address.isDefault)[0]);
      setSelectedAddress(addresses?.filter((address) => address.isDefault)[0]);
    } else {
      setDefaultAddress(addresses?.[0]);
      setSelectedAddress(addresses?.[0]);
    }
  };

  if (!isLoading && !user) {
    return (
      <div className="w-max px-2 sm:px-4 flex items-center gap-1 hover:underline text-[#494c52] max-sm:text-sm">
        <MapPin className="size-5" />
        <Link href={"/login"}>Select Delivery Address</Link>
        <ChevronDown className="size-5" />
      </div>
    );
  }

  if (!isLoading && isUser && Addresses.length === 0) {
    return (
      <div className="w-max px-2 sm:px-4 flex items-center gap-1 hover:underline text-[#494c52] max-sm:text-sm">
        <MapPin className="size-5" />
        <Link href={"/addresses"}>Select Delivery Address</Link>
        <ChevronDown className="size-5" />
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={(newOpen) => setOpen(newOpen)}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <div className="w-max bg-white mx-2 sm:mx-4 mb-1 cursor-pointer">
          {isLoading && (
            <Skeleton className="rounded-full w-48 h-6 bg-skeleton shrink-0" />
          )}
          {!isLoading && isUser && !isCheckout && (
            <p className="w-max flex items-center gap-1 hover:underline text-[#494c52] max-sm:text-sm">
              <MapPin className="size-5" />
              <span>
                {selectedAddress ? (
                  <>Delivery to {<b>{selectedAddress.postalCode}</b>}</>
                ) : defaultAddress ? (
                  <>Delivery to {<b>{defaultAddress.postalCode}</b>}</>
                ) : (
                  "Select Delivery Address"
                )}
              </span>
              <ChevronDown className="size-5" />
            </p>
          )}
          {!isLoading && isUser && isCheckout && (
            <Button variant={"outline"}>
              {selectedAddress ? "Change" : "Select Delivery Address"}
            </Button>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="ml-5 bg-white">
        <div className="flex flex-col gap-2">
          {Addresses?.length > 0 ? (
            Addresses.map((address) => (
              <div
                className="rounded-lg p-2 bg-white border border-border-default relative overflow-hidden cursor-pointer hover:scale-95"
                onClick={() => {
                  setSelectedAddress(address);
                  setOpen(false);
                }}
                key={address._id}
              >
                {selectedAddress?._id === address._id && (
                  <div className="w-20 h-10 bg-green-600 text-white absolute -right-8 -top-2 rounded-tr-lg rotate-45 flex items-center justify-center">
                    <Check className="-rotate-45  mr-3 mt-3" />
                  </div>
                )}
                <div className="flex flex-col justify-between">
                  {address.isDefault && (
                    <p className="font-semibold text-sm truncate text-gray-600 border-b-[#CBD5E1] border-b-2">
                      Default
                    </p>
                  )}
                  <div>
                    <h3 className="font-semibold truncate text-sm">
                      {address.fullName}
                    </h3>
                    <p className="text-sm truncate">{address.streetAddress}</p>
                    <p className="text-sm truncate">{address.postalCode}</p>
                    <p className="text-sm truncate">{address.city}</p>
                    <p className="text-sm truncate">{address.state}</p>
                    <p className="text-sm truncate">{address.phoneNumber}</p>
                    <p className="text-sm truncate">{address.country}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No address added!</p>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
