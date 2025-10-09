"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useFetch from "@/hooks/useFetch";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useAddress } from "@/hooks/useAddress";
import { useCart } from "@/hooks/useCart";
import { Input } from "../ui/input";

interface DeleteAccountModalProps {
  className?: string;
}

export const DeleteAccountModal = ({
  className = "",
}: DeleteAccountModalProps) => {
  const [open, setOpen] = useState(false);
  const { fetchWithAuth } = useFetch();
  const queryClient = useQueryClient();
  const { clearAuth, user } = useAuth();
  const { clearAddress } = useAddress();
  const { clearCart } = useCart();
  const [isDisabled, setIsDisabled] = useState(true);

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(`/users/delete-account`, {
        method: "DELETE",
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to delete account!");
      }

      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Review deleted");
      clearAuth();
      clearAddress();
      clearCart();
      queryClient.clear();
      setOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete account!");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogHeader>
        <DialogTrigger asChild className={className}>
          <Button variant={"destructive"}>Delete Account</Button>
        </DialogTrigger>
      </DialogHeader>
      <DialogContent className="max-sm:px-3">
        <DialogTitle>Delete Account</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete your account? This action is
          irreversible.
        </DialogDescription>

        <div>
          <p className="text-xs md:text-sm break-words">
            To confirm the deletion of your account enter{" "}
            <b>{`"Delete my account ${user?.email}"`}</b>
          </p>
          <Input
            placeholder={`Enter "Delete my account ${user?.email}"`}
            className="text-xs md:text-sm mt-1"
            onChange={(e) => {
              if (
                e.target.value.trim() === `Delete my account ${user?.email}`
              ) {
                setIsDisabled(false);
              } else {
                setIsDisabled(true);
              }
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="w-max"
            variant={"outline"}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="w-max"
            variant={"destructive"}
            disabled={deleteAccountMutation.isPending || isDisabled}
            onClick={() => deleteAccountMutation.mutate()}
          >
            {deleteAccountMutation.isPending ? "Deleting..." : "Confirm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
