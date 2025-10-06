import { Spinner } from "@/components/Spinner";
import { ShoppingCartIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
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

      <div className="flex relative min-h-[calc(100vh-56px)] bg-layout">
        <main className="flex-1">
          <Suspense fallback={<Spinner className="min-h-screen" />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
