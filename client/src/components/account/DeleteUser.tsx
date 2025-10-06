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

interface DeleteUserProps {
  user: UserProps;
  onSuccess?: () => void;
}

export const DeleteUser = ({ user, onSuccess = () => {} }: DeleteUserProps) => {
  const { fetchWithAuth } = useFetch();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/users/delete-user/${id}`, {
        method: "DELETE",
      });
      if (!res?.success) {
        throw new Error(res?.message || "Failed to delete user account!");
      }
      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "User account deleted");
      onSuccess();
      setDeleteOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong while deleting!");
    },
  });

  return (
    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <DialogHeader>
        <DialogTrigger asChild>
          <Button
            className="mt-4"
            variant={"destructive"}
            disabled={deleteUserMutation.isPending}
          >
            Delete
          </Button>
        </DialogTrigger>
      </DialogHeader>
      <DialogContent className="bg-white">
        <DialogTitle>
          Are you sure? You want to delete this {`${user.role}'s`} account? This
          action is irreversible.
        </DialogTitle>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setDeleteOpen(false)}
            className="mt-4"
            variant={"outline"}
            disabled={deleteUserMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => deleteUserMutation.mutate(user._id)}
            className="mt-4"
            variant={"destructive"}
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
