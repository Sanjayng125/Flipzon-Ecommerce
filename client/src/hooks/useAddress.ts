import { decryptData, encryptData } from "@/utils";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AddressStoreProps {
  Addresses: Address[];
  selectedAddress: Address | null;
  setAddresses: (data: Address[]) => void;
  setSelectedAddress: (data: Address) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  clearAddress: () => void;
}

export const useAddress = create<AddressStoreProps>()(
  persist(
    (set) => ({
      Addresses: [],
      selectedAddress: null,

      setAddresses: (data) => set({ Addresses: data }),
      setSelectedAddress: (data) => set({ selectedAddress: data }),
      isLoading: false,
      setIsLoading: (t) => set({ isLoading: t }),

      clearAddress: () => {
        set({ Addresses: [], selectedAddress: null });
        useAddress.persist.clearStorage();
      },
    }),
    {
      name: "address-storage",
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
                const encryptedData = encryptData(value);
                if (encryptedData) {
                  localStorage.setItem(key, encryptedData);
                } else {
                  console.error(
                    "Failed to encrypt data, not saving to localStorage"
                  );
                }
              },
              removeItem: (key) => localStorage.removeItem(key),
            }
          : undefined,
    }
  )
);
