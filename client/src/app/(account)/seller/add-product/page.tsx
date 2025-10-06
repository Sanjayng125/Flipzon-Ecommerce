"use client";

import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { z } from "zod";
import useFetch from "@/hooks/useFetch";
import { toast } from "sonner";
import useCloudinary from "@/hooks/useCloudinary";
import { productSchema } from "@/schemas";
import { InputField } from "@/components/forms/fields/InputField";
import { MarkdownField } from "@/components/forms/fields/MarkdownField";
import ImageUpload from "@/components/forms/fields/ImageUpload";
import { Button } from "@/components/ui/button";
import { CategorySelectField } from "@/components/forms/fields/CategorySelectField";

type ProductFormData = z.infer<typeof productSchema>;

export default function AddProductPage() {
  const { fetchWithAuth } = useFetch();
  const { uploadMultiple } = useCloudinary();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "",
      images: [],
      discount: 0,
    },
  });

  const { mutate: createProduct, isPending } = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (!selectedFiles.length) {
        throw new Error("Please select image(s). At least 1 image required!");
      }

      const imgsRes = await uploadMultiple(selectedFiles, "products");
      if (imgsRes?.error) {
        toast.error(imgsRes.error);
        return;
      }

      const { urls } = imgsRes;
      if (!urls) throw new Error("Image upload failed!");
      data.images = urls;

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

      const res = await fetchWithAuth("/products", {
        method: "POST",
        body: JSON.stringify(cleanedData),
      });

      if (!res.success) {
        throw new Error(res.message || "Failed to create product");
      }

      toast.success("✅ Product created successfully!");
      form.reset();
      setSelectedFiles([]);
      queryClient.refetchQueries({ queryKey: ["seller-products"] });
      if (inputRef.current) inputRef.current.value = "";
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create Product!");
    },
  });

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Add New Product</h2>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => {
            createProduct(values);
          })}
          className="space-y-4"
        >
          <InputField
            control={form.control}
            name="name"
            label="Product Name"
            disabled={isPending}
          />

          <MarkdownField
            control={form.control}
            name="description"
            label="Description"
            disabled={isPending}
          />

          <div className="grid grid-cols-3 gap-2 max-[350px]:grid-cols-2">
            <InputField
              control={form.control}
              name="price"
              label="Price (₹)"
              type="number"
              number
              disabled={isPending}
            />
            <InputField
              control={form.control}
              name="discount"
              label="Discount (%)"
              type="number"
              number
              disabled={isPending}
            />
            <InputField
              control={form.control}
              name="stock"
              label="Stock"
              type="number"
              number
              disabled={isPending}
            />
          </div>

          <InputField
            control={form.control}
            name="brand"
            label="Brand"
            disabled={isPending}
          />

          <CategorySelectField<ProductFormData>
            control={form.control}
            name="category"
            label="Category"
            placeholder={"Select Category"}
            disabled={isPending}
          />

          <ImageUpload
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            isLoading={isPending}
          />

          <Button
            type="submit"
            disabled={isPending}
            className="mt-2 bg-sky-800 hover:bg-sky-900 text-white"
          >
            {isPending ? "Adding..." : "Add Product"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
