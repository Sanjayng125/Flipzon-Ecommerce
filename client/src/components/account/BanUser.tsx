"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import useFetch from "@/hooks/useFetch";
import { toast } from "sonner";

interface BanUserProps {
  user: UserProps;
  onSuccess?: () => void;
}

export const BanUser = ({ user, onSuccess = () => {} }: BanUserProps) => {
  const { fetchWithAuth } = useFetch();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const banUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/users/ban-user/${id}`, {
        method: "POST",
      });
      if (!res?.success) {
        throw new Error(
          res?.message ||
            `Failed to ${user.isBanned ? "unban" : "ban"} user account!`
        );
      }
      return res;
    },
    onSuccess: (res) => {
      toast.success(
        res?.message || `User account ${user.isBanned ? "unbanned" : "banned"}!`
      );
      onSuccess();
      setDeleteOpen(false);
    },
    onError: (err) => {
      toast.error(
        err.message ||
          `Something went wrong while ${
            user.isBanned ? "unbanning" : "banning"
          } user!`
      );
    },
  });

  return (
    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <DialogHeader>
        <DialogTrigger asChild>
          <Button
            className={`mt-4 ${
              user.isBanned && "bg-green-600 hover:bg-green-700"
            }`}
            variant={user.isBanned ? "default" : "destructive"}
            disabled={banUserMutation.isPending}
          >
            {user.isBanned ? "Unban" : "Ban"}
          </Button>
        </DialogTrigger>
      </DialogHeader>
      <DialogContent className="bg-white">
        <DialogTitle>
          Are you sure? You want to {user.isBanned ? "unban" : "ban"} this user
          account?{!user.isBanned && " you can unban anytime."}
        </DialogTitle>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setDeleteOpen(false)}
            className="mt-4"
            variant={"outline"}
            disabled={banUserMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => banUserMutation.mutate(user._id)}
            className={`mt-4 ${
              user.isBanned && "bg-green-600 hover:bg-green-700"
            }`}
            variant={user.isBanned ? "default" : "destructive"}
            disabled={banUserMutation.isPending}
          >
            {banUserMutation.isPending
              ? "Loading..."
              : user.isBanned
              ? "Unban"
              : "Ban"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
