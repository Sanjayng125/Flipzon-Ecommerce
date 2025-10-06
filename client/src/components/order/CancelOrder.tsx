import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useFetch from "@/hooks/useFetch";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface CancelOrderProps {
  orderId: string;
  itemId: string;
  isSeller?: boolean;
}

export const CancelOrder = ({
  orderId,
  itemId,
  isSeller = false,
}: CancelOrderProps) => {
  const [open, setOpen] = React.useState(false);
  const { fetchWithAuth } = useFetch();
  const queryClient = useQueryClient();

  const cancelOrderMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithAuth(`/orders/${orderId}/cancel`, {
        method: "PUT",
        body: JSON.stringify({ itemId }),
      });

      if (!res?.success) {
        throw new Error(res?.message ?? "Failed to cancel order!");
      }

      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message);
      setOpen(false);
      if (isSeller) {
        queryClient.invalidateQueries({
          queryKey: [`get-seller-order-${orderId}`],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: ["get-my-order", orderId] });
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="w-max">
        <Button variant="destructive" color="red">
          Cancel Order
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Cancel Order</DialogTitle>
          <DialogDescription>
            Are you sure, you want to cancel this order?. The amount will be
            refunded if already paid.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3">
          <Button variant={"outline"} onClick={() => setOpen(false)}>
            No
          </Button>
          <Button
            variant="destructive"
            color="red"
            onClick={() => cancelOrderMutation.mutate()}
            disabled={cancelOrderMutation.isPending}
            className="disabled:opacity-50"
          >
            {cancelOrderMutation.isPending ? "Canceling..." : "Cancel Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
