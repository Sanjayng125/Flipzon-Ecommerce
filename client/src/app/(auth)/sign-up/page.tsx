"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OTPForm } from "@/components/Otp";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/forms/fields/InputField";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SignupSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShoppingCartIcon } from "lucide-react";
import useFetch from "@/hooks/useFetch";

export default function RegisterPage() {
  const router = useRouter();
  const [haveToVerify, setHaveToVerify] = useState(false);
  const { api } = useFetch();

  const form = useForm<z.infer<typeof SignupSchema>>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const handleSignupMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof SignupSchema>) => {
      const res = await api("/users/sign-up", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!res?.success) throw new Error(res?.message || "Signup failed");
      return res;
    },
    onSuccess: (res) => {
      if (res?.to_verify) {
        setHaveToVerify(true);
        toast.error(res?.message || "Verify your email!");
        return;
      }

      toast.success(res?.message || "Account created!");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  const onOtpSuccess = () => {
    setHaveToVerify(false);
    router.push("/login");
  };

  const onSubmit = (data: z.infer<typeof SignupSchema>) => {
    handleSignupMutation.mutate(data);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-3 sm:p-6">
      <div className="max-sm:w-full md:h-full max-sm:max-w-md max-w-5xl w-4/5 sm:w-4/6 md:w-full flex justify-center md:grid md:grid-cols-2 rounded-md overflow-hidden">
        <img
          alt="singup img"
          src={"/SIGN_UP_IMAGE.png"}
          width={100}
          height={100}
          className="w-full h-full hidden md:block object-cover"
        />

        <div className="w-full flex flex-col justify-center p-4 sm:p-8 bg-white relative">
          <div className="flex justify-center mb-6 md:hidden">
            <ShoppingCartIcon className="size-14 aspect-square" />
          </div>
          <h2 className="text-3xl font-bold text-center mb-1">
            Welcome to Flipzon
          </h2>
          <p className="text-center mb-6">Create an account to continue</p>

          {haveToVerify ? (
            <OTPForm email={form.getValues("email")} onSuccess={onOtpSuccess} />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-2 mb-5">
                  <InputField
                    control={form.control}
                    name="name"
                    disabled={handleSignupMutation.isPending}
                    placeholder="Name"
                  />

                  <InputField
                    control={form.control}
                    name="email"
                    disabled={handleSignupMutation.isPending}
                    placeholder="Email"
                  />

                  <InputField
                    control={form.control}
                    name="password"
                    disabled={handleSignupMutation.isPending}
                    placeholder="Password"
                    password
                    className="mb-1"
                  />

                  <InputField
                    control={form.control}
                    name="phone"
                    disabled={handleSignupMutation.isPending}
                    placeholder="Phone"
                  />
                </div>

                <Button
                  className="w-full mb-2"
                  disabled={handleSignupMutation.isPending}
                >
                  {handleSignupMutation.isPending ? "Loading..." : "Sign-up"}
                </Button>

                <div className="flex justify-center text-sm mb-6">
                  <Link
                    href="/login"
                    className="hover:underline hover:text-blue-600"
                  >
                    Already have an account?
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
