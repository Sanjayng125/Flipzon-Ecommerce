"use client";

import React from "react";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import useFetch from "@/hooks/useFetch";
import { toast } from "sonner";

interface RemoveHeroBtnProps {
  hero: HeroProps;
  isLoading?: boolean;
  onSuccess?: () => void;
}

export const RemoveHeroBtn = ({
  hero,
  isLoading = false,
  onSuccess = () => {},
}: RemoveHeroBtnProps) => {
  const { fetchWithAuth } = useFetch();

  const removeHeroMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!id) {
        throw new Error("Hero ID is required!");
      }

      const apiRes = await fetchWithAuth(`/hero/${id}`, {
        method: "DELETE",
      });

      if (!apiRes?.success) {
        throw new Error(apiRes?.message || "Failed to remove Hero!");
      }

      return apiRes;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Hero removed!");
      onSuccess();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to remove Hero!");
    },
  });

  return (
    <Button
      onClick={() => removeHeroMutation.mutate(hero._id)}
      variant={"destructive"}
      size={"sm"}
      disabled={removeHeroMutation.isPending || isLoading}
      className="w-max"
    >
      {removeHeroMutation.isPending ? "Removing..." : "Remove"}
    </Button>
  );
};
