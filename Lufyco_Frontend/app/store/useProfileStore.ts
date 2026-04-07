import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Address, PaymentMethod } from './useCheckoutStore';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface ProfileState {
    user: UserProfile | null;
    savedAddress: Address | null;
    savedPayment: PaymentMethod | null;
    privacyAccepted: boolean;

    updateUser: (user: Partial<UserProfile>) => void;
    saveAddress: (address: Address) => void;
    savePayment: (payment: PaymentMethod) => void;
    logout: () => void;
}

export const useProfileStore = create<ProfileState>()(
    persist(
        (set) => ({
            user: {
                id: 'u1',
                name: 'Mano D',
                email: 'manod@example.com',
                avatar: undefined
            },
            savedAddress: null,
            savedPayment: null,
            privacyAccepted: false,

            updateUser: (updates) => set((state) => ({
                user: state.user ? { ...state.user, ...updates } : { id: 'u1', name: '', email: '', ...updates }
            })),
            saveAddress: (address) => set({ savedAddress: address }),
            savePayment: (payment) => set({ savedPayment: payment }),
            logout: () => set({ user: null, savedAddress: null, savedPayment: null }),
        }),
        {
            name: 'profile-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
