"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useFetch from "@/hooks/useFetch";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface ProductDeleteProps {
  productId: string;
  refetch: () => void;
}

export const ProductDelete = ({ productId, refetch }: ProductDeleteProps) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { fetchWithAuth } = useFetch();
  const queryClient = useQueryClient();

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchWithAuth(`/products/${id}`, {
        method: "DELETE",
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to delete product!");
      }

      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Product deleted");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["get-admin-overview"] });
      queryClient.invalidateQueries({ queryKey: ["get-seller-overview"] });
      setDeleteOpen(false);
    },
    onError: (err) => {
      toast.error(
        err.message || "Something went wrong while deleting product!"
      );
    },
  });

  return (
    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <DialogHeader>
        <DialogTrigger asChild>
          <Button
            variant={"destructive"}
            disabled={deleteProductMutation.isPending}
          >
            Delete
          </Button>
        </DialogTrigger>
      </DialogHeader>
      <DialogContent className="bg-white">
        <DialogTitle>
          Are you sure? you want to delete this product. This action is
          irreversible!..
        </DialogTitle>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setDeleteOpen(false)}
            variant={"outline"}
            disabled={deleteProductMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => deleteProductMutation.mutate(productId)}
            variant={"destructive"}
            disabled={deleteProductMutation.isPending}
          >
            {deleteProductMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
