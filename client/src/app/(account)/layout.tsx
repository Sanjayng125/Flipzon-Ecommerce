"use client";

import DashboardSidebar from "@/components/account/DashboardSidebar";
import { AccountNavbar } from "@/components/header/AccountNavbar";
import { Spinner } from "@/components/Spinner";
import { useAuth } from "@/hooks/useAuth";
import useFetch from "@/hooks/useFetch";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { hasHydrated, user } = useAuth();

  const [show, setShow] = useState(false);
  const { fetchWithAuth, logout } = useFetch();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const manualLogoutRef = useRef(false);

  const handleLogout = async (fromAllDevices: boolean) => {
    if (!hasHydrated) return;
    try {
      if (fromAllDevices) {
        const res = await fetchWithAuth(`/users/logout`, {
          method: "POST",
        });

        if (res?.success) {
          await logout();
        }

        toast.success(res?.message);
      } else {
        await logout();

        toast.success("Logged out!");
      }
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong!");
    }
  };

  const { mutate: Logout, isPending: isLogoutPending } = useMutation({
    mutationFn: async ({
      fromAllDevices = false,
    }: {
      fromAllDevices?: boolean;
    }) => handleLogout(fromAllDevices),
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
      logout();
    }
  }, [user, hasHydrated, manualLogoutRef, isLogoutPending, Logout]);

  if (isLogoutPending || !hasHydrated) {
    return <Spinner className="min-h-screen" />;
  }

  if (!user) return <Spinner className="min-h-screen" />;

  return (
    <div className="flex flex-col min-h-screen bg-layout overflow-hidden">
      <AccountNavbar
        setShow={setShow}
        manualLogoutRef={manualLogoutRef}
        isLoading={!hasHydrated || isLogoutPending}
        Logout={(fromAllDevices) => Logout({ fromAllDevices })}
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
