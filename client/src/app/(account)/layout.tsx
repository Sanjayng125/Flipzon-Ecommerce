"use client";

import DashboardSidebar from "@/components/account/DashboardSidebar";
import { AccountNavbar } from "@/components/header/AccountNavbar";
import { Spinner } from "@/components/Spinner";
import { useCart } from "@/hooks/cart/useCart";
import { useAddress } from "@/hooks/useAddress";
import { useAuth } from "@/hooks/useAuth";
import useFetch from "@/hooks/useFetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { hasHydrated, clearAuth, user } = useAuth();
  const { clearAddress } = useAddress();
  const { clearCart } = useCart();
  const queryClient = useQueryClient();

  const [show, setShow] = useState(false);
  const { fetchWithAuth } = useFetch();
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const manualLogoutRef = useRef(false);

  const handleLogout = async (showToast: boolean, fromAllDevices: boolean) => {
    if (!hasHydrated) return;
    try {
      const res = await fetchWithAuth(
        `/users/logout${fromAllDevices ? "?from-all=true" : ""}`,
        {
          method: "POST",
        }
      );

      if (res?.success) {
        router.replace("/login");
        clearAuth();
        clearCart();
        clearAddress();
        queryClient.clear();
      }

      if (showToast) toast(res?.message);
    } catch (error: any) {
      if (showToast) toast(error?.message || "Something went wrong!");
    }
  };

  const { mutate: Logout, isPending: isLogoutPending } = useMutation({
    mutationFn: async ({
      showToast = true,
      fromAllDevices = false,
    }: {
      showToast: boolean;
      fromAllDevices?: boolean;
    }) => handleLogout(showToast, fromAllDevices),
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setShow(false);
      }
    };

    if (show) {
      pageRef?.current?.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      pageRef?.current?.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, setShow]);

  useEffect(() => {
    if (isLogoutPending || !hasHydrated) return;
    if (!user && !manualLogoutRef.current) {
      Logout({ showToast: false });
    }
  }, [user, hasHydrated, manualLogoutRef, isLogoutPending, Logout]);

  if (isLogoutPending || !hasHydrated) {
    return <Spinner className="min-h-screen" />;
  }

  if (!user)
    return (
      <div className="flex flex-col min-h-screen bg-layout overflow-hidden" />
    );

  return (
    <div className="flex flex-col min-h-screen bg-layout overflow-hidden">
      <AccountNavbar
        setShow={setShow}
        manualLogoutRef={manualLogoutRef}
        isLoading={!hasHydrated || isLogoutPending}
        Logout={(fromAllDevices) => Logout({ showToast: true, fromAllDevices })}
      />

      <div className="flex relative min-h-[calc(100vh-85px)] gap-2 md:m-2">
        <DashboardSidebar
          show={show}
          setShow={setShow}
          sidebarRef={sidebarRef}
        />
        <main
          ref={pageRef}
          className={`flex-1 bg-white md:rounded-md ${
            show && "max-md:brightness-50 max-md:backdrop-blur-sm"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
