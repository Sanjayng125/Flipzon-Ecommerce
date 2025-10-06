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
import { useForm } from "react-hook-form";
import { ReviewSchema } from "@/schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "../ui/form";
import { InputField } from "../forms/fields/InputField";
import { TextareaField } from "../forms/fields/TextareaField";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useFetch from "@/hooks/useFetch";
import { toast } from "sonner";
import { RatingField } from "../forms/fields/RatingField";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "../ui/skeleton";

interface ReviewModalProps {
  productId?: string;
  className?: string;
}

export const ReviewModal = ({
  productId,
  className = "",
}: ReviewModalProps) => {
  const { fetchWithAuth } = useFetch();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof ReviewSchema>>({
    resolver: zodResolver(ReviewSchema),
    defaultValues: {
      rating: 0,
      title: "",
    },
  });

  const { data: myReview, isPending: isMyReviewPending } = useQuery<Review>({
    queryKey: ["myReview", productId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/reviews/my/${productId}`);

      if (res?.success) {
        form.reset({
          rating: res.review.rating,
          title: res.review.title,
          reviewContent: res.review.reviewContent ?? undefined,
        });
        return res.review;
      }
      return null;
    },
    enabled: !!user && user.role === "user",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  const addReviewMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof ReviewSchema>) => {
      if (!productId) {
        throw new Error("Product ID is required!");
      }

      const res = await fetchWithAuth(`/reviews/${productId}`, {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to add review!");
      }

      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Review added");
      setOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["myReview", productId] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to add a review");
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof ReviewSchema>) => {
      if (!myReview) {
        throw new Error("All fields are required!");
      }

      const res = await fetchWithAuth(`/reviews/${myReview._id}`, {
        method: "PATCH",
        body: JSON.stringify(formData),
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to update review!");
      }

      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Review updated");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["myReview", productId] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update review");
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      if (!reviewId) return;

      const res = await fetchWithAuth(`/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to delete review!");
      }

      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Review deleted");
      queryClient.invalidateQueries({ queryKey: ["myReview", productId] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      form.reset({
        rating: 0,
        title: "",
        reviewContent: undefined,
      });
      setOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete review");
    },
  });

  const onSubmit = (data: z.infer<typeof ReviewSchema>) => {
    if (myReview) {
      updateReviewMutation.mutate(data);
    } else {
      addReviewMutation.mutate(data);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
    }
    setOpen(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogHeader>
        <DialogTrigger asChild className={className}>
          <Button variant={"outline"}>Write a product review</Button>
        </DialogTrigger>
      </DialogHeader>
      <DialogContent>
        <DialogTitle>
          {isMyReviewPending && !myReview ? (
            <Skeleton className="w-full max-w-40 h-5 bg-skeleton" />
          ) : myReview ? (
            "Update your review"
          ) : (
            "Write a review"
          )}
        </DialogTitle>
        {isMyReviewPending && !myReview ? (
          <div className="flex flex-col space-y-2">
            <Skeleton className="w-full max-w-40 h-8 bg-skeleton" />
            <Skeleton className="w-full h-9 bg-skeleton" />
            <Skeleton className="w-full h-16 bg-skeleton" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-full max-w-20 h-8 bg-skeleton" />
              <Skeleton className="w-full max-w-20 h-8 bg-skeleton" />
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col space-y-2"
            >
              <RatingField
                control={form.control}
                name="rating"
                className="max-w-40"
                disabled={
                  addReviewMutation.isPending ||
                  updateReviewMutation.isPending ||
                  deleteReviewMutation.isPending
                }
              />
              <InputField
                control={form.control}
                name="title"
                placeholder="*Title"
                disabled={
                  addReviewMutation.isPending ||
                  updateReviewMutation.isPending ||
                  deleteReviewMutation.isPending
                }
              />
              <TextareaField
                control={form.control}
                name="reviewContent"
                placeholder="*Write a Review"
                className="resize-none"
                disabled={
                  addReviewMutation.isPending ||
                  updateReviewMutation.isPending ||
                  deleteReviewMutation.isPending
                }
              />
              <div className="flex items-center gap-2">
                <Button
                  className="bg-sky-800 hover:bg-sky-900 w-max"
                  disabled={
                    !form.formState.isDirty ||
                    addReviewMutation.isPending ||
                    updateReviewMutation.isPending ||
                    deleteReviewMutation.isPending
                  }
                >
                  {addReviewMutation.isPending || updateReviewMutation.isPending
                    ? "Submitting..."
                    : "Submit"}
                </Button>
                {myReview && (
                  <Button
                    type="button"
                    className="w-max"
                    variant={"destructive"}
                    disabled={
                      addReviewMutation.isPending ||
                      updateReviewMutation.isPending ||
                      deleteReviewMutation.isPending
                    }
                    onClick={() => deleteReviewMutation.mutate(myReview._id)}
                  >
                    {deleteReviewMutation.isPending ? "Deleting..." : "Delete"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
