import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import { Address, PaymentMethod } from './useCheckoutStore';

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  qty: number;
  image: any;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'completed' | 'Pending' | 'Processing';
  items: OrderItem[];
  address: Address;
  payment: PaymentMethod;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

interface OrdersState {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  detailsLoading: boolean;
  error: string | null;
  lastPlacedOrderId: string | null;

  addOrder: (order: Order) => void;
  setOrders: (orders: Order[]) => void;
  setSelectedOrder: (order: Order | null) => void;
  setLastPlacedOrderId: (id: string | null) => void;
  getOrderById: (id: string) => Order | undefined;

  fetchMyOrders: (userId: string, status?: string) => Promise<void>;
  fetchOrderDetails: (orderId: string) => Promise<Order | null>;
  clearOrdersError: () => void;
}

const mapBackendStatus = (
  status?: string
): 'completed' | 'Pending' | 'Processing' => {
  const normalized = String(status || '').trim().toLowerCase();

  if (normalized === 'completed') return 'completed';
  if (normalized === 'processing') return 'Processing';

  return 'Pending';
};

const mapBackendPayment = (paymentMethod?: string): PaymentMethod => {
  const method = String(paymentMethod || 'cash').toLowerCase();

  return {
    method: method as PaymentMethod['method'],
    cardHolder: '',
    last4: method === 'cash' ? undefined : '0000',
  };
};

const mapBackendOrder = (order: any): Order => {
  const total = Number(order?.totalPrice || 0);
  const shipping = Number(order?.shippingPrice || 0);
  const tax = Number(order?.taxPrice || 0);
  const subtotal = Math.max(total - shipping - tax, 0);

  return {
    id: String(order?._id || ''),
    date: order?.createdAt || new Date().toISOString(),
    status: mapBackendStatus(order?.OrderStatus),
    items: Array.isArray(order?.orderItems)
      ? order.orderItems.map((item: any) => ({
          productId:
            typeof item?.product === 'object'
              ? String(item?.product?._id || '')
              : String(item?.product || ''),
          title: item?.name || item?.product?.name || 'Product',
          price: Number(item?.price || 0),
          qty: Number(item?.qty || 1),
          image: item?.image || item?.product?.image || '',
          size: item?.size || '',
          color: item?.color || '',
        }))
      : [],
    address: {
      fullName: order?.user?.name || '',
      phone: '',
      country: order?.shippingAddress?.country || '',
      city: order?.shippingAddress?.city || '',
      addressLine: order?.shippingAddress?.address || '',
      postalCode: order?.shippingAddress?.postalCode || '',
    },
    payment: mapBackendPayment(order?.paymentMethod),
    subtotal,
    shipping,
    discount: 0,
    total,
  };
};

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      selectedOrder: null,
      loading: false,
      detailsLoading: false,
      error: null,
      lastPlacedOrderId: null,

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),

      setOrders: (orders) => set({ orders }),

      setSelectedOrder: (order) => set({ selectedOrder: order }),

      setLastPlacedOrderId: (id) => set({ lastPlacedOrderId: id }),

      getOrderById: (id) => get().orders.find((o) => o.id === id),

      clearOrdersError: () => set({ error: null }),

      fetchMyOrders: async (userId, status) => {
        try {
          set({ loading: true, error: null });

          const params: any = { userId };

          if (status) {
            params.status = status;
          }

          const res = await api.get('/orders/myorders', { params });

          const mappedOrders: Order[] = Array.isArray(res.data)
            ? res.data.map(mapBackendOrder)
            : [];

          set({
            orders: mappedOrders,
            loading: false,
          });
        } catch (error: any) {
          console.warn(
            'fetchMyOrders error:',
            error?.response?.data || error?.message
          );

          set({
            loading: false,
            error: error?.response?.data?.message || 'Failed to load orders',
          });
        }
      },

      fetchOrderDetails: async (orderId) => {
        try {
          set({ detailsLoading: true, error: null });

          const res = await api.get(`/orders/${orderId}`);
          const mapped = mapBackendOrder(res.data);

          set((state) => {
            const existingIndex = state.orders.findIndex(
              (order) => order.id === mapped.id
            );

            let updatedOrders = [...state.orders];

            if (existingIndex >= 0) {
              updatedOrders[existingIndex] = mapped;
            } else {
              updatedOrders = [mapped, ...updatedOrders];
            }

            return {
              selectedOrder: mapped,
              orders: updatedOrders,
              detailsLoading: false,
            };
          });

          return mapped;
        } catch (error: any) {
          console.warn(
            'fetchOrderDetails error:',
            error?.response?.data || error?.message
          );

          set({
            detailsLoading: false,
            error:
              error?.response?.data?.message || 'Failed to load order details',
          });

          return null;
        }
      },
    }),
    {
      name: 'orders-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        orders: state.orders,
        lastPlacedOrderId: state.lastPlacedOrderId,
      }),
    }
  )
);