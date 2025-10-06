"use client";

import { Spinner } from "@/components/Spinner";
import { AddUpdateAddress } from "@/components/address/AddUpdateAddress";
import { AddressCard } from "@/components/address/AddressCard";
import { useAddress } from "@/hooks/useAddress";
import { useAuth } from "@/hooks/useAuth";
import useFetch from "@/hooks/useFetch";
import { AddressSchema } from "@/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";
import { z } from "zod";

const AddressesPage = () => {
  const { user } = useAuth();
  const { Addresses, setAddresses } = useAddress();
  const { fetchWithAuth } = useFetch();
  const queryClient = useQueryClient();

  const { isLoading: isAddressesLoading } = useQuery({
    queryKey: ["get-my-addresses"],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetchWithAuth("/address");
      if (res?.success) {
        setAddresses(res.addresses);
        return res.addresses;
      }
      return [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({
      data,
      id,
    }: {
      data: z.infer<typeof AddressSchema>;
      id: string;
    }) => {
      if (!id) {
        throw new Error("Address ID is missing!");
      }
      if (
        !data ||
        Object.entries(data).every(([Key, val]) => `${val}` === "")
      ) {
        throw new Error("Nothing to update!");
      }

      const res = await fetchWithAuth(`/address/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to update address!");
      }

      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Address updated!");
      queryClient.invalidateQueries({ queryKey: ["get-my-addresses"] });
    },
    onError: (err) => {
      toast.success(err?.message || "Failed to update Address!");
    },
  });

  const updateDefaultAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        throw new Error("Address ID is missing!");
      }

      const res = await fetchWithAuth(`/address/set-default/${id}`, {
        method: "PATCH",
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to update default address!");
      }

      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Default Address updated!");
      queryClient.invalidateQueries({ queryKey: ["get-my-addresses"] });
    },
    onError: (err) => {
      toast.success(err?.message || "Failed to update default Address!");
    },
  });

  const removeAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        throw new Error("Address ID is missing!");
      }

      const res = await fetchWithAuth(`/address/${id}`, {
        method: "DELETE",
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to remove address!");
      }

      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Address removed!");
      queryClient.invalidateQueries({ queryKey: ["get-my-addresses"] });
    },
    onError: (err) => {
      toast.success(err?.message || "Failed to remove Address!");
    },
  });

  if (isAddressesLoading) {
    return <Spinner className="min-h-screen" />;
  }

  return (
    <div className="flex flex-col justify-center p-2">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
        {Addresses?.length > 0 &&
          Addresses.map((address) => (
            <AddressCard
              key={address._id}
              data={address}
              isPending={
                updateAddressMutation.isPending ||
                updateDefaultAddressMutation.isPending ||
                removeAddressMutation.isPending
              }
              updateDefaultAddress={updateDefaultAddressMutation.mutate}
              removeAddress={removeAddressMutation.mutate}
            />
          ))}
        <AddUpdateAddress />
      </div>
      {!Addresses?.length && (
        <p className="text-center mt-3">You did not added any address yet.</p>
      )}
    </div>
  );
};

export default AddressesPage;
