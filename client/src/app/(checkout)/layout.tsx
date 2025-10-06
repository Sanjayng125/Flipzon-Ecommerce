"use client";

import { Spinner } from "@/components/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { hasHydrated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) {
      router.replace("/");
    }
  }, [user, hasHydrated, router]);

  if (!hasHydrated) {
    return <Spinner className="min-h-screen" />;
  }

  return (
    <div className="w-full flex flex-col min-h-screen overflow-hidden">
      {/* Logo & Search-Cart */}
      <div className="w-full p-2 z-20">
        <div className="w-max">
          <Link href={"/"}>
            <div className="flex items-center gap-1 text-sky-800">
              <ShoppingCartIcon className="size-8 sm:size-10 aspect-square" />
              <p className="text-2xl font-bold">Flipzon</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="w-full border-border-default border-b-2 flex items-center justify-center p-2 pt-0">
        <h1 className="font-bold text-xl">Checkout</h1>
      </div>

      <div className="flex relative min-h-[calc(100vh-85px)] bg-layout">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
