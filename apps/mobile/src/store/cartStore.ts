// ==============================================
// Cart Store — Zustand
// ==============================================

import { create } from 'zustand';
import api from '../services/api';

interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  variant: {
    id: string;
    size: string;
    price: number;
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
  itemCount: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  subtotal: 0,
  itemCount: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/cart');
      set({ items: data.items, subtotal: data.subtotal, itemCount: data.itemCount });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (variantId, quantity = 1) => {
    await api.post('/cart', { variantId, quantity });
    const { data } = await api.get('/cart');
    set({ items: data.items, subtotal: data.subtotal, itemCount: data.itemCount });
  },

  updateQuantity: async (itemId, quantity) => {
    await api.patch(`/cart/${itemId}`, { quantity });
    const { data } = await api.get('/cart');
    set({ items: data.items, subtotal: data.subtotal, itemCount: data.itemCount });
  },

  removeItem: async (itemId) => {
    await api.delete(`/cart/${itemId}`);
    const { data } = await api.get('/cart');
    set({ items: data.items, subtotal: data.subtotal, itemCount: data.itemCount });
  },

  clearCart: async () => {
    await api.delete('/cart');
    set({ items: [], subtotal: 0, itemCount: 0 });
  },
}));
