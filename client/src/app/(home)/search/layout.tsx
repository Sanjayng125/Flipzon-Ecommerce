import { Spinner } from "@/components/Spinner";
import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<Spinner className="min-h-screen" />}>
        {children}
      </Suspense>
    </>
  );
}
