"use client";

import { RemoveHeroBtn } from "@/components/hero/RemoveHeroBtn";
import { Spinner } from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useCloudinary from "@/hooks/useCloudinary";
import useFetch from "@/hooks/useFetch";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ImageIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

interface AddHeroProps {
  image: CloudinaryImage;
  heroLink?: string;
}

const AdminHeroPage = () => {
  const { api, fetchWithAuth } = useFetch();
  const [image, setImage] = useState<File | null>(null);
  const [heroLink, setHeroLink] = useState("");
  const { uploadSingle } = useCloudinary();
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    data: heros,
    isLoading,
    refetch,
  } = useQuery<HeroProps[]>({
    queryKey: ["get-hero"],
    queryFn: async () => {
      const res = await api("/hero");

      return res.heros;
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const aspectRatio = width / height;
      const sizeInMB = file.size / (1024 * 1024);

      const isCorrectAspect = Math.abs(aspectRatio - 3) < 0.05;
      const isUnderLimit = sizeInMB <= 5;

      if (!isCorrectAspect) {
        toast.error("Image aspect ratio should be 3:1");
        return;
      }

      if (!isUnderLimit) {
        toast.error("Image size should be under 5MB");
        return;
      }

      URL.revokeObjectURL(objectUrl);
      setImage(file);
    };

    img.src = objectUrl;
  };

  const addHeroMutation = useMutation({
    mutationFn: async () => {
      if (!image) {
        throw new Error("Select Image!");
      }

      const res = await uploadSingle(image, "heroes");
      if (res?.error) {
        throw new Error(res.error || "Failed to update Avatar");
      }

      const { url, public_id } = res;

      const data: AddHeroProps = {
        image: {
          url,
          public_id,
        },
      };

      if (heroLink.trim()) {
        data.heroLink = heroLink;
      }

      const apiRes = await fetchWithAuth("/hero", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!apiRes?.success) {
        throw new Error(apiRes?.message || "Failed to add Hero!");
      }

      return apiRes;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Hero Added");
      refetch();
      setHeroLink("");
      setImage(null);
      if (inputRef.current) inputRef.current.value = "";
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add Hero!");
    },
  });

  return (
    <div className="w-full p-2">
      <h1 className="text-2xl font-semibold mb-2">Manage Hero Section</h1>

      <div className="p-2 my-2 flex flex-col gap-3 border border-border-default rounded-md">
        <div className="flex flex-col space-y-1">
          <Label className="font-semibold">Hero Link</Label>
          <Input
            placeholder="https://example.com"
            type="url"
            value={heroLink}
            onChange={(e) => setHeroLink(e.target.value)}
            disabled={addHeroMutation.isPending}
            className="disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col space-y-1">
          <Label className="font-semibold flex max-sm:flex-col w-max items-start">
            <span>Hero Image</span>
            <span>(Allowed Aspect Ratio: 3:1)</span>
          </Label>
          <button
            className="w-60 h-20 sm:w-72 sm:h-24 rounded-md border-2 border-border-default border-dashed cursor-pointer group flex relative disabled:opacity-50 overflow-hidden"
            disabled={addHeroMutation.isPending}
            onClick={() => inputRef.current?.click()}
          >
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                alt="Hero img"
                className="flex-1 w-full h-full"
              />
            ) : (
              <ImageIcon className="flex-1 w-full h-full" />
            )}
            <span className="hidden group-hover:block absolute bottom-0 left-1/2 -translate-x-1/2 w-full bg-gray-700 text-white">
              Choose Image
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            hidden
          />
        </div>
        <Button
          className="w-max bg-sky-700 hover:bg-sky-800 text-white"
          onClick={() => addHeroMutation.mutate()}
          disabled={addHeroMutation.isPending}
        >
          <span>{addHeroMutation.isPending ? "Adding..." : "Add"}</span>
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : heros && heros.length > 0 ? (
        <div className="mt-4 pt-2 flex flex-col gap-2">
          {heros.map((hero, index) => (
            <div
              key={index}
              className="flex sm:items-center justify-between border rounded-md p-3 shadow-sm max-sm:flex-col max-sm:gap-4"
            >
              <div className="flex sm:items-center gap-4 max-sm:flex-col">
                <img
                  src={hero.image.url}
                  alt={`Hero ${index + 1}`}
                  className="w-full sm:w-36 sm:h-24 object-contain rounded-md border"
                />
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Hero Link:
                  </span>
                  <a
                    href={hero.heroLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all max-w-xs"
                  >
                    {hero.heroLink || "N/A"}
                  </a>
                </div>
              </div>

              <RemoveHeroBtn
                hero={hero}
                isLoading={addHeroMutation.isPending}
                onSuccess={refetch}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center mt-2">No heroes found</p>
      )}
    </div>
  );
};

export default AdminHeroPage;
