"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface CartItem {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  /** Display only — the server always recalculates prices from product records. */
  price: number | null;
  size: string;
  color: string;
  quantity: number;
  customization: string;
  attachments: { ref: string; name: string }[];
}

interface CartCtx {
  items: CartItem[];
  count: number;
  ready: boolean;
  add: (item: Omit<CartItem, "key">) => void;
  update: (key: string, patch: Partial<CartItem>) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = "s216_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* storage unavailable */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, "key">) => {
    setItems((prev) => {
      const key = `${item.productId}|${item.size}|${item.color}|${item.customization}|${item.attachments.map((a) => a.ref).join(",")}`;
      const existing = prev.find((p) => p.key === key);
      if (existing) return prev.map((p) => (p.key === key ? { ...p, quantity: Math.min(10000, p.quantity + item.quantity) } : p));
      return [...prev, { ...item, key }];
    });
  }, []);
  const update = useCallback((key: string, patch: Partial<CartItem>) => setItems((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p))), []);
  const remove = useCallback((key: string) => setItems((prev) => prev.filter((p) => p.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({ items, count: items.reduce((s, i) => s + i.quantity, 0), ready, add, update, remove, clear }), [items, ready, add, update, remove, clear]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
