"use clinet";

import Image from "next/image";
import React, { ChangeEvent, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Check, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import useFetch from "@/hooks/useFetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "../ui/form";
import useCloudinary from "@/hooks/useCloudinary";
import { toast } from "sonner";
import { UpdateStoreSchema } from "@/schemas";
import { InputField } from "../forms/fields/InputField";
import { useAuth } from "@/hooks/useAuth";
import { TextareaField } from "../forms/fields/TextareaField";

interface UpdateStoreFormProps {
  storeLogoUrl: string;
  storeName: string;
  storeDescription: string;
  setEdit: () => void;
}

export const UpdateStoreForm = ({
  storeLogoUrl,
  storeName,
  storeDescription,
  setEdit,
}: UpdateStoreFormProps) => {
  const { fetchWithAuth } = useFetch();
  const [image, setImage] = useState<File | null>(null);
  const { uploadSingle } = useCloudinary();
  const inputRef = useRef<HTMLInputElement>(null);
  const { setUser } = useAuth();

  const form = useForm<z.infer<typeof UpdateStoreSchema>>({
    resolver: zodResolver(UpdateStoreSchema),
    defaultValues: {
      storeName,
      storeDescription,
    },
  });

  const updateStoreMutation = useMutation({
    mutationFn: async (data: z.infer<typeof UpdateStoreSchema>) => {
      const apiRes = await fetchWithAuth("/users/update-profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      if (!apiRes?.success) {
        throw new Error(apiRes?.message || "Failed to update avatar");
      }

      return apiRes;
    },
    onSuccess: (res) => {
      toast(res.message);
      setUser(res.user);
      setEdit();
      form.reset({
        storeName: res.user.storeName,
        storeDescription: res.user.storeDescription,
      });
    },
    onError: (err) => {
      toast(err.message);
    },
  });

  const onSubmit = (data: z.infer<typeof UpdateStoreSchema>) => {
    updateStoreMutation.mutate(data);
  };

  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
      updateStoreLogoMutation.mutate(e.target.files[0]);
    }
  };

  const updateStoreLogoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!file) {
        throw new Error("Select Image!");
      }
      const res = await uploadSingle(file, "storeLogos");
      if (res?.error) {
        throw new Error(res.error || "Failed to update store logo");
      }

      const { url, public_id } = res;

      const apiRes = await fetchWithAuth("/users/update-profile", {
        method: "PATCH",
        body: JSON.stringify({ storeLogo: { url, public_id } }),
      });

      if (!apiRes?.success) {
        throw new Error(apiRes?.message || "Failed to update store logo");
      }

      return apiRes;
    },
    onSuccess: (res) => {
      toast(res.message);
      setUser(res.user);
      setImage(null);
      setEdit();
    },
    onError: (err) => {
      toast(err.message);
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="w-full flex flex-col space-y-1 mt-5 border-t-2 pt-5">
          <h1 className="text-xl font-semibold">Seller Details</h1>
          <div className="w-full flex flex-col space-y-3 mt-5">
            <div
              className="p-1 rounded-md bg-gray-400 w-max cursor-pointer relative"
              onClick={() => inputRef.current?.click()}
            >
              <Image
                src={(image && URL.createObjectURL(image)) || storeLogoUrl}
                alt="Avatar"
                width={40}
                height={40}
                className="w-20 h-20 object-contain"
              />
              <input
                type="file"
                hidden
                ref={inputRef}
                onChange={onImageChange}
                disabled={updateStoreLogoMutation.isPending}
              />
              {updateStoreLogoMutation.isPending && (
                <Loader2 className="absolute animate-spin top-0 left-0 w-full h-full" />
              )}
            </div>
            <InputField
              control={form.control}
              name="storeName"
              label="Store Name"
              disabled={updateStoreMutation.isPending}
            />
            <TextareaField
              control={form.control}
              name="storeDescription"
              label="Store Description"
              disabled={updateStoreMutation.isPending}
            />

            {form.formState.isDirty ? (
              <Button
                className="w-max bg-sky-800 hover:bg-sky-900 text-white disabled:opacity-50"
                disabled={updateStoreMutation.isPending}
              >
                {updateStoreMutation.isPending ? (
                  <>
                    Saving <Loader2 className="animate-spin" />
                  </>
                ) : (
                  <>
                    Save <Check />
                  </>
                )}
              </Button>
            ) : (
              <Button
                className="w-max bg-sky-800 hover:bg-sky-900 text-white"
                type="button"
                onClick={setEdit}
              >
                Done <Check />
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
};
