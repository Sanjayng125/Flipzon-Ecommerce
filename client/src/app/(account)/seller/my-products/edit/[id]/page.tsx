"use client";

import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import useFetch from "@/hooks/useFetch";
import { toast } from "sonner";
import useCloudinary from "@/hooks/useCloudinary";
import { useParams, useRouter } from "next/navigation";
import { productSchema } from "@/schemas";
import ImageUpload from "@/components/forms/fields/ImageUpload";
import { InputField } from "@/components/forms/fields/InputField";
import { MarkdownField } from "@/components/forms/fields/MarkdownField";
import { Button } from "@/components/ui/button";
import { CategorySelectField } from "@/components/forms/fields/CategorySelectField";
import { Spinner } from "@/components/Spinner";

type ProductFormData = z.infer<typeof productSchema>;

export default function UpdateProductPage() {
  const { id } = useParams<{ id: string }>();
  const { fetchWithAuth } = useFetch();
  const { uploadMultiple, deleteImage } = useCloudinary();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<CloudinaryImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: undefined,
      stock: undefined,
      category: "",
      images: [],
      discount: undefined,
    },
  });

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await fetchWithAuth(`/products/${id}`);
      if (res?.success) {
        return res.product;
      }
      return null;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  useEffect(() => {
    if (product) {
      setExistingImages(product.images);
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category._id,
        images: product.images,
        discount: product.discount,
        brand: product.brand,
      });
    }
  }, [product]);

  const removeExistingImage = (publicId: string) => {
    setExistingImages((prev) =>
      prev.filter((img) => img.public_id !== publicId)
    );
    setImagesToDelete((prev) => [...prev, publicId]);
  };

  const { mutate: updateProduct, isPending } = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const totalImages = existingImages.length + selectedFiles.length;
      if (totalImages === 0) {
        throw new Error("Please keep at least 1 image!");
      }

      let finalImages = [...existingImages];

      if (selectedFiles.length > 0) {
        const imgsRes = await uploadMultiple(selectedFiles, "products");
        if (imgsRes?.error || !imgsRes?.urls) {
          toast.error(imgsRes.error || "Image upload failed!");
          return;
        }

        const { urls } = imgsRes;
        finalImages = [...finalImages, ...urls];
      }

      if (imagesToDelete.length > 0) {
        await deleteImage(imagesToDelete);
      }

      data.images = finalImages;

      if (data.images.length === 0) {
        throw new Error("Image upload failed!");
      }

      // Remove optional empty fields
      const cleanedData: Record<string, any> = { ...data };
      Object.entries(cleanedData).forEach(([key, value]) => {
        if (
          value === undefined ||
          value === "" ||
          (typeof value === "object" &&
            value !== null &&
            Object.values(value).every((v) => v === undefined || v === ""))
        ) {
          delete cleanedData[key];
        }
      });

      const res = await fetchWithAuth(`/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(cleanedData),
      });

      if (!res.success) {
        throw new Error(res.message || "Failed to update product");
      }

      toast.success("✅ Product updated successfully!");
      queryClient.refetchQueries({ queryKey: ["product", id] });
      queryClient.refetchQueries({ queryKey: ["seller-products"] });
      setImagesToDelete([]);
      setSelectedFiles([]);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update Product!");
    },
  });

  const updateBtnDisabled = () => {
    const imagesChanged = selectedFiles.length > 0 || imagesToDelete.length > 0;

    return isPending || (!form.formState.isDirty && !imagesChanged);
  };

  if (productLoading) {
    return <Spinner className="mt-4" />;
  }

  if (!product) {
    return (
      <div className="p-4 mx-auto">
        <div className="text-center">Product not found!</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Update Product</h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => {
            updateProduct(values);
          })}
          className="space-y-4"
        >
          <InputField control={form.control} name="name" label="Product Name" />

          <MarkdownField
            control={form.control}
            name="description"
            label="Description"
          />

          <div className="grid grid-cols-3 gap-2 max-[350px]:grid-cols-2">
            <InputField
              control={form.control}
              name="price"
              label="Price (₹)"
              type="number"
              number
            />
            <InputField
              control={form.control}
              name="discount"
              label="Discount (%)"
              type="number"
              number
            />
            <InputField
              control={form.control}
              name="stock"
              label="Stock"
              type="number"
              number
            />
          </div>

          <InputField control={form.control} name="brand" label="Brand" />

          <CategorySelectField<ProductFormData>
            control={form.control}
            name="category"
            label="Category"
            placeholder={"Select Category"}
            disabled={isPending}
          />

          <ImageUpload
            existingImages={existingImages}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            removeExistingImage={removeExistingImage}
            isLoading={isPending}
          />

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={updateBtnDisabled()}
              className="bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50"
            >
              {isPending ? "Updating..." : "Update Product"}
            </Button>

            <Button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Back
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
