"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useAddress } from "./useAddress";
import { useCart } from "./cart/useCart";
import { getToken, logout as logoutAction } from "@/actions/auth";

const useFetch = () => {
  const { clearAuth, user, hasHydrated, token, setToken } = useAuth();
  const { clearCart } = useCart();
  const { clearAddress } = useAddress();
  const router = useRouter();
  const queryClient = useQueryClient();

  async function logout() {
    clearAuth();
    clearCart();
    clearAddress();
    queryClient.clear();
    await logoutAction();
    router.replace("/login");
  }

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    if (hasHydrated && !user) {
      return logout();
    }

    let accessToken = token;

    if (!accessToken) {
      accessToken = await getToken();
      if (!accessToken) {
        logout();
        return { success: false, message: "Session expired!" };
      }
      setToken(accessToken);
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        'ngrok-skip-browser-warning': 'true',
        ...options.headers,
      },
    });

    const data = await res.json();

    // If session expired, log out & redirect
    if (data?.login || res.headers.get("x-clear-session") === "true") {
      logout();
      return { success: false, message: "Session expired!" };
    }

    return data;
  };

  const api = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        'ngrok-skip-browser-warning': 'true',
        ...options.headers,
      },
    });

    const data = await res.json();

    // If session expired, log out & redirect
    if (data?.login || res.headers.get("x-clear-session") === "true") {
      logout();
      return { success: false, message: "Session expired!" };
    }

    return data;
  };

  return { fetchWithAuth, api, logout };
};

export default useFetch;
