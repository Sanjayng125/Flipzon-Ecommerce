"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import useFetch from "@/hooks/useFetch";

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

interface OTPFormProps {
  email: string;
  onSuccess: () => void;
}

export function OTPForm({ email, onSuccess }: OTPFormProps) {
  const { api } = useFetch();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  const [resendTimer, setResendTimer] = useState(300);

  const verifyOtpMutation = useMutation({
    mutationFn: async (pin: string) => {
      const res = await api("/users/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp: pin }),
      });
      if (res?.resend) {
        clearInterval(timerRef.current!);
        setResendTimer(0);
      }
      if (!res?.success) throw new Error(res?.message || "Verification failed");
      return res;
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Verified successfully!");
      clearInterval(timerRef.current!);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await api("/users/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      if (!res?.success) throw new Error(res?.message || "Resend failed");
      return res;
    },
    onSuccess: () => {
      setResendTimer(300);
      startTimer(); // Restart timer after OTP resend
      toast.success("OTP resent successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    verifyOtpMutation.mutate(data.pin);
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    resendOtpMutation.mutate();
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current); // Clear any existing timer
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current!); // Cleanup timer on unmount
  }, []);

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  if (!email) {
    return <p className="text-center">First enter email in login form.</p>;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-center"
      >
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormLabel>One-Time Password</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>
                Please enter the one-time password sent to your email.
              </FormDescription>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <div className="flex flex-col items-center justify-center mt-2 space-y-2">
          <Button
            type="submit"
            disabled={
              verifyOtpMutation.isPending || resendOtpMutation.isPending
            }
            className="disabled:opacity-50 bg-[#2563EB] hover:bg-[#1E40AF] text-white"
          >
            {verifyOtpMutation.isPending ? "Verifying..." : "Submit"}
          </Button>
          <div className="flex items-center gap-1">
            <p>Didn&apos;t receive code?</p>
            <button
              type="button"
              className="hover:text-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={resendTimer > 0 || resendOtpMutation.isPending}
              onClick={handleResendOtp}
            >
              {resendOtpMutation.isPending
                ? "Resending..."
                : `Resend (${formatTime(resendTimer)})`}
            </button>
          </div>
        </div>
      </form>
    </Form>
  );
}
