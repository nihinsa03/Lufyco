import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WishlistItem = {
    id: string; // usually just productId usually, but requirement says { id, productId... }
    productId: string;
    title: string;
    price: number;
    image: any;
    size?: string;
    color?: string;
};

type WishlistState = {
    items: WishlistItem[];
    addToWishlist: (item: WishlistItem) => void;
    removeFromWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    toggleWishlist: (item: WishlistItem) => void;
};

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],

            addToWishlist: (item) => {
                const exists = get().items.some(i => i.productId === item.productId);
                if (!exists) {
                    set({ items: [...get().items, item] });
                }
            },

            removeFromWishlist: (productId) => {
                set({ items: get().items.filter((i) => i.productId !== productId) });
            },

            isInWishlist: (productId) => {
                return get().items.some((i) => i.productId === productId);
            },

            toggleWishlist: (item) => {
                if (get().isInWishlist(item.productId)) {
                    get().removeFromWishlist(item.productId);
                } else {
                    get().addToWishlist(item);
                }
            }
        }),
        {
            name: 'wishlist-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
