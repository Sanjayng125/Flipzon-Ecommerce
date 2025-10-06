import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CartStoreProps {
  cart: Cart | null;
  setCart: (data: Cart) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  clearCart: () => void;
}

export const useCart = create<CartStoreProps>()(
  persist(
    (set) => ({
      cart: null,
      setCart: (data) => set({ cart: data }),
      isLoading: false,
      setIsLoading: (t) => set({ isLoading: t }),

      clearCart: () => {
        set({ cart: null });
        useCart.persist.clearStorage();
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
