"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useAddress } from "./useAddress";
import { useCart } from "./cart/useCart";

const useFetch = () => {
  const { clearAuth, user, hasHydrated } = useAuth();
  const { clearCart } = useCart();
  const { clearAddress } = useAddress();
  const router = useRouter();
  const queryClient = useQueryClient();

  async function login() {
    clearAuth();
    clearCart();
    clearAddress();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/logout`, {
      method: "POST",
      credentials: "include",
    });
    queryClient.clear();
    router.replace("/login");
  }

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    if (hasHydrated && !user) {
      return login();
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api${url}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    // if (!res.ok) throw new Error(res.statusText || "Something went wrong");

    const data = await res.json();

    // If session expired, log out & redirect
    if (data?.login || res.headers.get("x-clear-session") === "true") {
      return login();
    }

    return data;
  };

  const api = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await res.json();

    // If session expired, log out & redirect
    if (data?.login || res.headers.get("x-clear-session") === "true") {
      return login();
    }

    // if (!res.ok) throw new Error(data?.message || "Something went wrong");

    return data;
  };

  return { fetchWithAuth, api, login };
};

export default useFetch;
