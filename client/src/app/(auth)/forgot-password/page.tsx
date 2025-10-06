"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Check, ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const ForgotPasswordPage = () => {
  const [success, setSuccess] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: async (formData: { email: string }) => {
      setSuccess(false);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!data?.success)
        throw new Error(data?.message || "Something went wrong!");
      return data;
    },
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  const formSchema = z.object({
    email: z.string().email(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    forgotPasswordMutation.mutate(data);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-3 sm:p-6">
      <div className="max-sm:w-full h-full max-sm:max-w-md max-w-5xl w-4/5 sm:w-4/6 md:w-full flex justify-center md:grid md:grid-cols-2 rounded-md overflow-hidden">
        <img
          alt="login img"
          src={"/FORGOT_PASSWORD_IMAGE.png"}
          width={100}
          height={100}
          className="w-full h-full hidden md:block object-cover"
        />

        <div className="w-full flex flex-col justify-center p-4 sm:p-8 bg-white relative">
          <div className="flex flex-col p-3">
            <div className="flex justify-center mb-6 md:hidden">
              <ShoppingCartIcon className="size-14 aspect-square" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-1">
              Forgot Password
            </h2>
            <p className="text-center mb-6">
              Enter your email to reset your password
            </p>

            {!success ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <div className="mb-2">
                          <FormControl>
                            <Input
                              placeholder="Email"
                              className="bg-[#cad0d8] border-none"
                              {...field}
                              disabled={forgotPasswordMutation.isPending}
                            />
                          </FormControl>
                          <div className="flex justify-between text-sm mt-2">
                            <FormMessage className="text-red-500" />
                            <Link href="/login" className="ml-auto">
                              <Button
                                type="button"
                                variant={"ghost"}
                                className="flex items-center hover:underline hover:text-blue-600"
                              >
                                Login
                                <ArrowRight />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button
                    className="w-full"
                    disabled={forgotPasswordMutation.isPending}
                  >
                    {forgotPasswordMutation.isPending
                      ? "Loading..."
                      : "Reset Password"}
                  </Button>
                </form>
              </Form>
            ) : (
              <div>
                <div className="flex items-center gap-1 justify-center mt-3 text-green-600 text-lg font-semibold">
                  <p>Check your email for reset link</p>
                  <Check />
                </div>

                <div className="mt-1 text-center text-gray-500">
                  <p>Don&apos;t! share the reset link with anyone.</p>
                </div>

                <div className="flex justify-center text-sm mt-2">
                  <Link href="/login">
                    <Button className="flex items-center">
                      Login
                      <ArrowRight />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
