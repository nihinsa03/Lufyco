import React, { createContext, useContext, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  image: any;        // require(...) or { uri }
  size?: string|null;
  color?: string|null;
  qty: number;
  selected?: boolean;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty" | "selected">, qty?: number) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  clear: () => void;
  subtotal: number;   // sum of selected items
  count: number;     // total quantity of all items
};

const CartCtx = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem: CartContextType["addItem"] = (payload, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(
        x => x.id === payload.id && x.size === payload.size && x.color === payload.color
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
        return copy;
      }
      return [{ ...payload, qty, selected: true }, ...prev];
    });
  };

  const inc = (id: string) => setItems(prev => prev.map(i => (i.id === id ? { ...i, qty: i.qty + 1 } : i)));
  const dec = (id: string) => setItems(prev => prev.map(i => (i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i)));
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const toggle = (id: string) => setItems(prev => prev.map(i => (i.id === id ? { ...i, selected: !i.selected } : i)));
  const clear = () => setItems([]);

  const subtotal = useMemo(() => items.filter(i => i.selected).reduce((s, i) => s + i.price * i.qty, 0), [items]);
  const count = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);

  return (
    <CartCtx.Provider value={{ items, addItem, inc, dec, remove, toggle, clear, subtotal, count }}>
      {children}
    </CartCtx.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
