"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type QuoteItem = {
  key: string; // slug + size code + finish
  slug: string;
  range: string;
  name: string;
  sizeCode: string;
  sizeLabel: string;
  dims: [number, number, number];
  finish: string;
  qty: number;
};

type QuoteState = {
  items: QuoteItem[];
  add: (item: Omit<QuoteItem, "key">) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

export const useQuote = create<QuoteState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const key = `${item.slug}:${item.sizeCode}:${item.finish}`;
          const existing = s.items.find((i) => i.key === key);
          if (existing) return { items: s.items.map((i) => (i.key === key ? { ...i, qty: i.qty + item.qty } : i)) };
          return { items: [...s.items, { ...item, key }] };
        }),
      setQty: (key, qty) => set((s) => ({ items: s.items.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(100000, qty)) } : i)) })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
    }),
    { name: "jiph-quote" },
  ),
);
