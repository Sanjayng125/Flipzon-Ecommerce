"use client";

import { InputField } from "@/components/forms/fields/InputField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import validator from "validator";
import { z } from "zod";

const formSchema = z.object({
  newPassword: z
    .string()
    .min(5, { message: "Password must be atleast 5 characters long" })
    .max(30, { message: "Password can't be more than 30 characters long" }),
});

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("user");
  const token = searchParams.get("token");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (formData: {
      newPassword: string;
      token: string;
      email: string;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

      if (res.status === 401) {
        router.replace("/login");
      }

      const data = await res.json();

      if (!data?.success)
        throw new Error(data?.message || "Something went wrong!");
      return data;
    },
    onSuccess: () => {
      router.replace("/login");
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  useEffect(() => {
    if (!email || !token || !validator.isEmail(email)) {
      router.replace("/");
    }
  }, [email, token, router]);

  if (!email || !token || !validator.isEmail(email)) {
    return <div className="flex justify-center pt-5 text-2xl">Loading...</div>;
  }

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    resetPasswordMutation.mutate({
      newPassword: data.newPassword,
      email,
      token,
    });
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-3 sm:p-6">
      <div className="flex flex-col p-3 bg-white rounded-md">
        <h2 className="text-3xl font-bold text-center mb-1">Reset Password</h2>
        <p className="text-center mb-6">
          Enter your your new password to Reset
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mb-2">
              <InputField
                control={form.control}
                name="newPassword"
                disabled={resetPasswordMutation.isPending}
                placeholder="New Password"
                password
              />
            </div>

            <Button
              className="w-full bg-[#2563EB] hover:bg-[#1E40AF] text-white disabled:opacity-50"
              type="submit"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending
                ? "Loading..."
                : "Reset Password"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ResetPassword;
