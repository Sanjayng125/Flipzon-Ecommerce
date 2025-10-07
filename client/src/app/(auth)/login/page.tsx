"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OTPForm } from "@/components/Otp";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LoginSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/forms/fields/InputField";
import { ShoppingCartIcon } from "lucide-react";
import { login } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [haveToVerify, setHaveToVerify] = useState(false);
  const queryClient = useQueryClient();
  const { setUser, setToken } = useAuth();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLoginMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof LoginSchema>) => {
      const res = await login(formData.email, formData.password);

      if (!res?.success) throw new Error(res?.message || "Login failed");

      return res;
    },
    onSuccess: (res) => {
      if (res?.to_verify) {
        setHaveToVerify(true);
        toast.error(res?.message || "Verify your email!");
        return;
      }

      setUser(res.user);
      setToken(res.token);
      if (res.user.role === "user") {
        queryClient.fetchQuery({ queryKey: ["get-cart"] });
        queryClient.fetchQuery({ queryKey: ["get-my-addresses"] });
        router.push("/");
      }
      if (res.user.role === "seller") {
        router.push("/seller/overview");
      }
      if (res.user.role === "admin") {
        router.push("/admin/overview");
      }
      toast.success(res?.message || "Logged in successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  const onSubmit = (data: z.infer<typeof LoginSchema>) => {
    handleLoginMutation.mutate(data);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-3 sm:p-6">
      <div className="max-sm:w-full md:h-full max-sm:max-w-md max-w-5xl w-4/5 sm:w-4/6 md:w-full flex justify-center md:grid md:grid-cols-2 rounded-md overflow-hidden">
        <img
          alt="login img"
          src={"/SIGN_IN_IMAGE.png"}
          width={100}
          height={100}
          className="w-full h-full hidden md:block object-cover"
        />

        <div className="w-full flex flex-col justify-center p-4 sm:p-8 bg-white relative">
          <div className="flex justify-center mb-6 md:hidden">
            <ShoppingCartIcon className="size-14 aspect-square" />
          </div>
          <h2 className="text-3xl font-bold text-center mb-1">Welcome Back</h2>
          <p className="text-center mb-6">Login to your account</p>

          {haveToVerify ? (
            <OTPForm
              email={form.getValues("email")}
              onSuccess={() => {
                setHaveToVerify(false);
              }}
            />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-2">
                  <InputField
                    control={form.control}
                    name="email"
                    disabled={handleLoginMutation.isPending}
                    placeholder="Email"
                  />

                  <InputField
                    control={form.control}
                    name="password"
                    disabled={handleLoginMutation.isPending}
                    placeholder="Password"
                    password
                    className="mb-1"
                  />
                </div>

                <div className="flex justify-end text-sm mb-6">
                  <Link
                    href="/forgot-password"
                    className="hover:underline hover:text-blue-600"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  className="w-full mb-2"
                  disabled={handleLoginMutation.isPending}
                >
                  {handleLoginMutation.isPending ? "Loading..." : "Sign-in"}
                </Button>

                <div className="flex justify-center text-sm mb-6">
                  <Link
                    href="/sign-up"
                    className="hover:underline hover:text-blue-600"
                  >
                    Create an account
                  </Link>
                </div>

                <div className="mt-6 text-center text-gray-500">
                  <p>
                    By continuing, you agree to FlipZon&apos;s{" "}
                    <Link href="#">Terms & Conditions</Link>
                  </p>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
