"use client";

import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { PenLine } from "lucide-react";
import { PlusOutlined } from "@ant-design/icons";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useMutation } from "@tanstack/react-query";
import useFetch from "@/hooks/useFetch";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import useCloudinary from "@/hooks/useCloudinary";
import Image from "next/image";
import { CategorySchema } from "@/schemas";
import { InputField } from "../forms/fields/InputField";
import { Switch } from "../ui/switch";
import { CategorySelectField } from "../forms/fields/CategorySelectField";
import { DEFAULT_CATEGORY_IMAGE } from "@/utils";

interface CategoryModalProps {
  edit?: boolean;
  onSuccess?: () => void;
  data?: Category;
}

type CategoryFormData = z.infer<typeof CategorySchema>;

export const CategoryModal = ({
  edit = false,
  onSuccess = () => {},
  data,
}: CategoryModalProps) => {
  const [open, setOpen] = useState(false);
  const { fetchWithAuth } = useFetch();
  const [image, setImage] = useState<File | null>(null);
  const { uploadSingle } = useCloudinary();
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof CategorySchema>>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      parentCategory: null,
      isFeatured: false,
      showInCategoryBar: false,
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof CategorySchema>) => {
      const catData: z.infer<typeof CategorySchema> & {
        image?: {
          url: string;
          public_id: string;
        };
      } = {
        ...formData,
      };

      if (image) {
        const res = await uploadSingle(image, "categories");
        if (res?.error) {
          throw new Error(res.error || "Failed to upload image");
        }

        const { url, public_id } = res;
        catData.image = { url, public_id };
      }

      if (formData.parentCategory === "") {
        catData.parentCategory = null;
      }

      const res = await fetchWithAuth("/categories", {
        method: "POST",
        body: JSON.stringify(catData),
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to create category!");
      }

      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Category created");
      onSuccess();
      form.reset();
      setImage(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create category");
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof CategorySchema>) => {
      if (!data) return;
      const catData: z.infer<typeof CategorySchema> & {
        image?: {
          url: string;
          public_id: string;
        };
      } = {
        ...formData,
      };

      if (image) {
        const res = await uploadSingle(image, "categories");
        if (res?.error) {
          throw new Error(res.error || "Failed to upload image");
        }

        const { url, public_id } = res;
        catData.image = { url, public_id };
      }

      if (formData.parentCategory === "") {
        catData.parentCategory = null;
      }

      const res = await fetchWithAuth(`/categories/${data._id}`, {
        method: "PATCH",
        body: JSON.stringify(catData),
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to update category!");
      }

      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Category updated");
      onSuccess();
      setOpen(false);
      setImage(null);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update category");
    },
  });

  const onSubmit = (data: z.infer<typeof CategorySchema>) => {
    if (edit) {
      updateCategoryMutation.mutate(data);
    } else {
      addCategoryMutation.mutate(data);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && edit && data) {
      form.reset({
        name: data.name,
        parentCategory: data.parentCategory,
        isFeatured: data.isFeatured,
        showInCategoryBar: data.showInCategoryBar,
      });
    }

    form.clearErrors();
    setImage(null);
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogHeader>
        <DialogTrigger asChild>
          {edit ? (
            <button className="py-2 group flex items-center justify-center border-r hover:bg-black/10">
              <PenLine size={20} />
            </button>
          ) : (
            <Button
              className="flex items-center bg-sky-700 text-white"
              size={"sm"}
            >
              <PlusOutlined />
              Add Category
            </Button>
          )}
        </DialogTrigger>
      </DialogHeader>
      <DialogContent>
        <DialogTitle className="text-xl font-semibold">
          {edit ? "Update Category" : "Add Category"}
        </DialogTitle>
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col space-y-2"
            >
              <Input
                type="file"
                accept="image/*"
                hidden
                id="image"
                onChange={(e) =>
                  e.target.files?.[0] && setImage(e.target.files[0])
                }
                ref={inputRef}
              />
              <div
                className="border rounded-lg w-max p-1 cursor-pointer relative overflow-hidden"
                onClick={() => inputRef.current?.click()}
              >
                <p className="absolute w-full bg-gray-600 text-white text-xs bottom-0 left-0 px-1 pb-1 text-center">
                  Category Image
                </p>
                <Image
                  src={
                    image
                      ? URL.createObjectURL(image)
                      : edit && data
                      ? data?.image.url
                      : DEFAULT_CATEGORY_IMAGE
                  }
                  alt="Category image"
                  width={100}
                  height={100}
                  className=""
                />
              </div>
              <InputField
                control={form.control}
                name="name"
                placeholder="*Category Name"
                disabled={
                  addCategoryMutation.isPending ||
                  updateCategoryMutation.isPending
                }
              />

              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center space-x-1">
                        <Label htmlFor="isFeatured">
                          Is Category Featured:
                        </Label>
                        <Switch
                          id="isFeatured"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={
                            addCategoryMutation.isPending ||
                            updateCategoryMutation.isPending
                          }
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showInCategoryBar"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center space-x-1">
                        <Label htmlFor="showInCategoryBar">
                          Show in Category Bar:
                        </Label>
                        <Switch
                          id="showInCategoryBar"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={
                            addCategoryMutation.isPending ||
                            updateCategoryMutation.isPending
                          }
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <CategorySelectField<CategoryFormData>
                control={form.control}
                name="parentCategory"
                label="Parent Category"
                placeholder={"Select a parent category (optional)"}
                disabled={
                  addCategoryMutation.isPending ||
                  updateCategoryMutation.isPending
                }
              />

              <Button
                className={`text-white w-max ${
                  edit
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-sky-800 hover:bg-sky-900"
                }`}
                size={"sm"}
                disabled={
                  addCategoryMutation.isPending ||
                  updateCategoryMutation.isPending ||
                  (edit && !form.formState.isDirty && !image) ||
                  (!edit && !form.formState.isValid)
                }
              >
                {edit ? "Update" : "Add"}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
