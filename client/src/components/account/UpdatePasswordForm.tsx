"use client";

import React from "react";
import { Button } from "../ui/button";
import { Check, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "../ui/form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import useFetch from "@/hooks/useFetch";
import { UpdatePasswordSchema } from "@/schemas";
import { InputField } from "../forms/fields/InputField";

interface UpdatePasswordFormProps {
  setEdit: () => void;
}

export const UpdatePasswordForm = ({ setEdit }: UpdatePasswordFormProps) => {
  const { fetchWithAuth } = useFetch();

  const form = useForm<z.infer<typeof UpdatePasswordSchema>>({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof UpdatePasswordSchema>) => {
      if (!data.oldPassword || !data.newPassword) {
        throw new Error("Invalid password");
      }
      const res = await fetchWithAuth("/users/change-password", {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      if (!res?.success) {
        throw new Error(res?.message || "Failed to update password");
      }

      return res;
    },
    onSuccess: (res) => {
      toast.success(res.message);
      form.reset();
      setEdit();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (data: z.infer<typeof UpdatePasswordSchema>) => {
    updatePasswordMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        className="w-full flex flex-col space-y-3"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <InputField
          control={form.control}
          name="oldPassword"
          label="Old Password"
          disabled={updatePasswordMutation.isPending}
          password
        />
        <InputField
          control={form.control}
          name="newPassword"
          label="New Password"
          disabled={updatePasswordMutation.isPending}
          password
        />

        {form.formState.isDirty ? (
          <Button
            className="w-max bg-sky-800 hover:bg-sky-900 text-white"
            disabled={updatePasswordMutation.isPending}
          >
            {updatePasswordMutation.isPending ? (
              <>
                Updating <Loader2 className="animate-spin" />
              </>
            ) : (
              "Update"
            )}
          </Button>
        ) : (
          <Button
            className="w-max bg-sky-800 hover:bg-sky-900 text-white"
            onClick={setEdit}
            type="button"
          >
            Done <Check />
          </Button>
        )}
      </form>
    </Form>
  );
};
