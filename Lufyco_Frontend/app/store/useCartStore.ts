import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CartItem = {
    id: string; // unique id (e.g. productId-size-color)
    productId: string;
    title: string;
    price: number;
    image: any;
    size?: string;
    color?: string;
    qty: number;
};

type CartState = {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    incrementQty: (id: string) => void;
    decrementQty: (id: string) => void;
    clearCart: () => void;

    // Computed (helper functions to used in components)
    getTotalPrice: () => number;
    getItemCount: () => number;
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                console.log('Adding item:', item);
                const currentItems = get().items;
                // Sanitize image - allow numbers (local assets) and strings (URLs)
                const safeImage = item.image || '';
                const safeItem = { ...item, image: safeImage };
                const uniqueId = `${safeItem.productId}-${safeItem.size || 'def'}-${safeItem.color || 'def'}`;
                const qtyToAdd = safeItem.qty || 1;

                const existingIndex = currentItems.findIndex((i) => i.id === uniqueId);

                if (existingIndex >= 0) {
                    const updated = currentItems.map((i, index) =>
                        index === existingIndex ? { ...i, qty: i.qty + qtyToAdd } : i
                    );
                    set({ items: updated });
                } else {
                    set({ items: [...currentItems, { ...safeItem, id: uniqueId, qty: qtyToAdd }] });
                }
            },

            removeItem: (id) => {
                set({ items: get().items.filter((i) => i.id !== id) });
            },

            incrementQty: (id) => {
                const updated = get().items.map((i) => {
                    if (i.id === id) return { ...i, qty: i.qty + 1 };
                    return i;
                });
                set({ items: updated });
            },

            decrementQty: (id) => {
                const currentItems = get().items;
                const target = currentItems.find((i) => i.id === id);
                if (!target) return;

                if (target.qty > 1) {
                    set({ items: currentItems.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i)) });
                } else {
                    set({ items: currentItems.filter((i) => i.id !== id) });
                }
            },

            clearCart: () => set({ items: [] }),

            getTotalPrice: () => {
                return get().items.reduce((total, item) => total + item.price * item.qty, 0);
            },

            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.qty, 0);
            }
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
