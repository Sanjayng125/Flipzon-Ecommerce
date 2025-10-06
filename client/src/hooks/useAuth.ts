"use client";

import { decryptData, encryptData } from "@/utils";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStoreProps {
  user: UserProps | null;
  hasHydrated: boolean;
  setUser: (user: UserProps | null) => void;
  clearAuth: () => void;
}

export const useAuth = create<AuthStoreProps>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,

      setUser: (user) => set({ user }),

      clearAuth: () => {
        set({ user: null });
        useAuth.persist.clearStorage();
      },
    }),
    {
      name: process.env.NEXT_PUBLIC_AUTH_STORE_NAME || "auth-storage",
      partialize: (state) => ({
        user: state.user,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          setTimeout(() => {
            useAuth.setState({ hasHydrated: true });
          }, 0);
        };
      },
      storage:
        typeof window !== "undefined"
          ? {
            getItem: (key) => {
              try {
                const encryptedData = localStorage.getItem(key);

                if (!encryptedData) return null;

                const decrypted = decryptData(encryptedData);

                if (!decrypted) {
                  localStorage.removeItem(key);
                  return null;
                }

                return decrypted;
              } catch (err) {
                console.error("Failed to get item from localStorage", err);
                localStorage.removeItem(key);
                return null;
              }
            },
            setItem: (key, value) => {
              try {
                const encryptedData = encryptData(value);
                if (encryptedData) {
                  localStorage.setItem(key, encryptedData);
                } else {
                  console.error(
                    "Failed to encrypt data, not saving to localStorage"
                  );
                }
              } catch (err) {
                console.error("Error while saving to localStorage", err);
              }
            },
            removeItem: (key) => localStorage.removeItem(key),
          }
          : undefined,
    }
  )
);
