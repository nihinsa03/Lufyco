import { create } from "zustand";
import api from "../api/api";

export type ShippingDetails = {
  country?: string;
  province?: string;
  city?: string;
  streetAddress?: string;
  postalCode?: string;
};

export type SavePaymentPayload = {
  paymentType: string;
  cardType: string;
  cardNumber: string;
  expDate: string;
  cardholderName: string;
  cvv: string;
};

export type PaymentDetails = {
  paymentType?: string;
  cardType?: string;
  cardholderName?: string;
  expDate?: string;
  last4?: string;
  createdAt?: string;
  updatedAt?: string;
};

type UserDetailsStore = {
  shippingDetails: ShippingDetails | null;
  paymentDetails: PaymentDetails | null;
  loading: boolean;
  error: string | null;

  fetchShipping: (userId: string) => Promise<ShippingDetails | null>;
  saveShipping: (
    userId: string,
    payload: ShippingDetails
  ) => Promise<ShippingDetails | null>;

  fetchPayment: (userId: string) => Promise<PaymentDetails | null>;
  savePayment: (
    userId: string,
    payload: SavePaymentPayload
  ) => Promise<PaymentDetails | null>;

  clearUserDetails: () => void;
};

export const useUserDetailsStore = create<UserDetailsStore>((set) => ({
  shippingDetails: null,
  paymentDetails: null,
  loading: false,
  error: null,

  fetchShipping: async (userId) => {
    try {
      set({ loading: true, error: null });

      const res = await api.get(`/users/${userId}/shipping-location`);
      const data = res?.data?.data || null;

      set({
        shippingDetails: data,
        loading: false,
      });

      return data;
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch shipping details",
      });
      return null;
    }
  },

  saveShipping: async (userId, payload) => {
    try {
      set({ loading: true, error: null });

      let res;
      try {
        res = await api.put(`/users/${userId}/shipping-location`, payload);
      } catch {
        res = await api.post(`/users/${userId}/shipping-location`, payload);
      }

      const data = res?.data?.data || payload || null;

      set({
        shippingDetails: data,
        loading: false,
      });

      return data;
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to save shipping details",
      });
      throw err;
    }
  },

  fetchPayment: async (userId) => {
    try {
      set({ loading: true, error: null });

      const res = await api.get(`/users/${userId}/payment-method`);
      const data = res?.data?.data || null;

      set({
        paymentDetails: data,
        loading: false,
      });

      return data;
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to fetch payment details",
      });
      return null;
    }
  },

  savePayment: async (userId, payload) => {
    try {
      set({ loading: true, error: null });

      let res;
      try {
        res = await api.put(`/users/${userId}/payment-method`, payload);
      } catch {
        res = await api.post(`/users/${userId}/payment-method`, payload);
      }

      const data = res?.data?.data || null;

      set({
        paymentDetails: data,
        loading: false,
      });

      return data;
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Failed to save payment details",
      });
      throw err;
    }
  },

  clearUserDetails: () =>
    set({
      shippingDetails: null,
      paymentDetails: null,
      loading: false,
      error: null,
    }),
}));