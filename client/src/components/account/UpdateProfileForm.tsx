"use client";

import Image from "next/image";
import React, { ChangeEvent, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Check, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "../ui/form";
import useFetch from "@/hooks/useFetch";
import { toast } from "sonner";
import useCloudinary from "@/hooks/useCloudinary";
import { useMutation } from "@tanstack/react-query";
import { UpdateProfileSchema } from "@/schemas";
import { InputField } from "../forms/fields/InputField";
import { refreshSession } from "@/actions/auth";
import { useAuth } from "@/hooks/useAuth";

interface UpdateFormProps {
  name: string;
  phone: string;
  avatar: string;
  setEdit: () => void;
}

export const UpdateProfileForm = ({
  name,
  phone,
  avatar,
  setEdit,
}: UpdateFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const { fetchWithAuth } = useFetch();
  const { uploadSingle } = useCloudinary();
  const { setUser } = useAuth();

  const updateAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!file) {
        throw new Error("Select Image!");
      }
      const res = await uploadSingle(file, "avatars");
      if (res?.error) {
        throw new Error(res.error || "Failed to update Avatar");
      }

      const { url, public_id } = res;

      const apiRes = await fetchWithAuth("/users/update-profile", {
        method: "PATCH",
        body: JSON.stringify({ avatar: { url, public_id } }),
      });

      if (!apiRes?.success) {
        throw new Error(apiRes?.message || "Failed to update avatar");
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
      setImage(null);
      toast(err.message);
    },
  });

  const form = useForm<z.infer<typeof UpdateProfileSchema>>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name,
      phone,
    },
  });

  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
      updateAvatarMutation.mutate(e.target.files[0]);
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof UpdateProfileSchema>) => {
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
        name: res.user.name,
        phone: res.user.phone,
      });
      refreshSession();
    },
    onError: (err) => {
      toast(err.message);
    },
  });

  const onSubmit = (data: z.infer<typeof UpdateProfileSchema>) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-center gap-3">
          <div
            className="p-1 rounded-md bg-gray-400 cursor-pointer group relative"
            onClick={() => inputRef.current?.click()}
          >
            <Image
              src={image ? URL.createObjectURL(image) : avatar}
              alt="Avatar"
              width={40}
              height={40}
              className={`w-20 h-20 object-contain ${
                updateAvatarMutation.isPending && "opacity-50"
              }`}
            />
            <span className="absolute bottom-0 left-0 w-full text-center bg-gray-600 text-white rounded-b-md">
              Select
            </span>
            <input
              type="file"
              hidden
              ref={inputRef}
              onChange={onImageChange}
              disabled={updateAvatarMutation.isPending}
              accept="image/*"
            />
            {updateAvatarMutation.isPending && (
              <Loader2 className="absolute animate-spin top-0 left-0 w-full h-full" />
            )}
          </div>

          <div className="w-full flex flex-col space-y-1">
            <InputField
              control={form.control}
              name="name"
              label="Name"
              disabled={updateProfileMutation.isPending}
            />
          </div>
        </div>

        <div className="w-full flex flex-col space-y-3 mt-5">
          <InputField
            control={form.control}
            name="phone"
            label="Phone Number"
            disabled={updateProfileMutation.isPending}
          />
          {form.formState.isDirty ? (
            <Button
              className="w-max bg-sky-800 hover:bg-sky-900 text-white disabled:opacity-50"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
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
      </form>
    </Form>
  );
};
