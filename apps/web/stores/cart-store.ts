'use client';
import { create } from 'zustand';
import { cartApi } from '@/lib/api';

interface CartItem {
  id: string;
  quantity: number;
  variant: {
    id: string;
    size: string;
    price: number;
    sku: string;
    product: {
      id: string;
      name: string;
      slug: string;
      images: string[];
      brand: { name: string };
    };
  };
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  isLoading: boolean;
  itemCount: number;
  fetchCart: () => Promise<void>;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  subtotal: 0,
  isLoading: false,
  itemCount: 0,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await cartApi.get();
      set({
        items: data.items || [],
        subtotal: data.subtotal || 0,
        itemCount: (data.items || []).reduce((sum: number, i: CartItem) => sum + i.quantity, 0),
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (variantId, quantity = 1) => {
    await cartApi.add(variantId, quantity);
    const { data } = await cartApi.get();
    set({
      items: data.items || [],
      subtotal: data.subtotal || 0,
      itemCount: (data.items || []).reduce((sum: number, i: CartItem) => sum + i.quantity, 0),
    });
  },

  updateItem: async (itemId, quantity) => {
    await cartApi.update(itemId, quantity);
    const { data } = await cartApi.get();
    set({
      items: data.items || [],
      subtotal: data.subtotal || 0,
      itemCount: (data.items || []).reduce((sum: number, i: CartItem) => sum + i.quantity, 0),
    });
  },

  removeItem: async (itemId) => {
    await cartApi.remove(itemId);
    const { data } = await cartApi.get();
    set({
      items: data.items || [],
      subtotal: data.subtotal || 0,
      itemCount: (data.items || []).reduce((sum: number, i: CartItem) => sum + i.quantity, 0),
    });
  },

  clearCart: async () => {
    await cartApi.clear();
    set({ items: [], subtotal: 0, itemCount: 0 });
  },
}));
