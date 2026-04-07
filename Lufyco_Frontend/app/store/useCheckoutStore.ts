import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Address {
    fullName: string;
    phone: string;
    country: string;
    city: string;
    addressLine: string;
    postalCode: string;
}

export interface PaymentMethod {
    method: 'visa' | 'mastercard' | 'paypal' | 'googlepay' | 'cash';
    cardHolder?: string;
    last4?: string;
}

interface CheckoutState {
    shippingAddress: Address | null;
    paymentMethod: PaymentMethod | null;
    setShippingAddress: (address: Address) => void;
    setPaymentMethod: (payment: PaymentMethod) => void;
    clearCheckoutData: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
    persist(
        (set) => ({
            shippingAddress: null,
            paymentMethod: null,
            setShippingAddress: (address) => set({ shippingAddress: address }),
            setPaymentMethod: (payment) => set({ paymentMethod: payment }),
            clearCheckoutData: () => set({ shippingAddress: null, paymentMethod: null }),
        }),
        {
            name: 'checkout-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
