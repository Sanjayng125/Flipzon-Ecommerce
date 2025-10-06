"use client";

import { useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface ExistingImage {
  public_id: string;
  url: string;
}

interface ImageUploadProps {
  label?: string;
  maxImages?: number;
  existingImages?: ExistingImage[]; // only for update
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  removeExistingImage?: (id: string) => void; // only for update
  isLoading?: boolean;
}

export default function ImageUpload({
  label = "Product Images (Kindly name images as 1, 2, 3... to order them)",
  maxImages = 6,
  existingImages = [],
  selectedFiles,
  setSelectedFiles,
  removeExistingImage,
  isLoading = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + files.length;

    if (totalImages > maxImages) {
      toast.error(`You can upload a maximum of ${maxImages} images.`);
      e.target.value = "";
      setSelectedFiles([]);
      return;
    }
    setSelectedFiles(files);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeSelectedFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
  };

  return (
    <div className="flex flex-col gap-2">
      <FormLabel>{label}</FormLabel>

      {/* Existing Images (only update case) */}
      {existingImages.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Current Images:</p>
          <div className="flex gap-2 flex-wrap">
            {existingImages.map((img) => (
              <div key={img.public_id} className="relative">
                <Image
                  src={img.url}
                  alt="product img"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-md"
                />
                {removeExistingImage && (
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.public_id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Images Upload */}
      <Input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        disabled={isLoading}
        className="cursor-pointer disabled:cursor-not-allowed"
      />

      {/* Preview new selected files */}
      {selectedFiles?.length > 0 && (
        <div className="mt-2">
          {existingImages.length > 0 && (
            <p className="text-sm text-gray-600 mb-2">New Images to Upload:</p>
          )}
          <div className="flex gap-2 flex-wrap">
            {isLoading && <Loader2 className="w-20 h-20 animate-spin" />}
            {selectedFiles.map((img, i) => (
              <div key={i} className="relative">
                <Image
                  src={URL.createObjectURL(img)}
                  alt="new product img"
                  width={80}
                  height={80}
                  className={`w-20 h-20 object-cover rounded-md ${
                    isLoading ? "opacity-50" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => removeSelectedFile(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                  disabled={isLoading}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
