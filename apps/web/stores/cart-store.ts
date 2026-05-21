'use client';
import { create } from 'zustand';
import { cartApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

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
  addItem: (variantId: string, quantity?: number, productDetails?: any) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  subtotal: 0,
  isLoading: false,
  itemCount: 0,

  fetchCart: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      const localCart = localStorage.getItem('localCart');
      if (localCart) {
        try {
          const items = JSON.parse(localCart);
          const subtotal = items.reduce((sum: number, i: any) => sum + (Number(i.variant.price) * i.quantity), 0);
          set({
            items,
            subtotal,
            itemCount: items.reduce((sum: number, i: any) => sum + i.quantity, 0),
            isLoading: false,
          });
        } catch {
          set({ items: [], subtotal: 0, itemCount: 0, isLoading: false });
        }
      } else {
        set({ items: [], subtotal: 0, itemCount: 0, isLoading: false });
      }
      return;
    }

    // Sincronizar carrito local si existe
    const localCartStr = localStorage.getItem('localCart');
    if (localCartStr) {
      try {
        const localItems = JSON.parse(localCartStr);
        if (localItems.length > 0) {
          set({ isLoading: true });
          for (const item of localItems) {
            await cartApi.add(item.variant.id, item.quantity);
          }
          localStorage.removeItem('localCart');
        }
      } catch (e) {
        console.error('Error al sincronizar carrito local:', e);
      }
    }

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

  addItem: async (variantId, quantity = 1, productDetails) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      const localCart = localStorage.getItem('localCart');
      let items: CartItem[] = [];
      if (localCart) {
        try { items = JSON.parse(localCart); } catch {}
      }

      const existingIndex = items.findIndex(i => i.variant.id === variantId);
      if (existingIndex > -1) {
        items[existingIndex].quantity += quantity;
      } else if (productDetails) {
        items.push({
          id: variantId,
          quantity,
          variant: productDetails.variant,
        });
      }

      localStorage.setItem('localCart', JSON.stringify(items));
      const subtotal = items.reduce((sum: number, i: any) => sum + (Number(i.variant.price) * i.quantity), 0);
      set({
        items,
        subtotal,
        itemCount: items.reduce((sum: number, i: any) => sum + i.quantity, 0),
      });
      return;
    }

    await cartApi.add(variantId, quantity);
    const { data } = await cartApi.get();
    set({
      items: data.items || [],
      subtotal: data.subtotal || 0,
      itemCount: (data.items || []).reduce((sum: number, i: CartItem) => sum + i.quantity, 0),
    });
  },

  updateItem: async (itemId, quantity) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      const localCart = localStorage.getItem('localCart');
      let items: CartItem[] = [];
      if (localCart) {
        try { items = JSON.parse(localCart); } catch {}
      }

      const existingIndex = items.findIndex(i => i.id === itemId);
      if (existingIndex > -1) {
        items[existingIndex].quantity = quantity;
      }

      localStorage.setItem('localCart', JSON.stringify(items));
      const subtotal = items.reduce((sum: number, i: any) => sum + (Number(i.variant.price) * i.quantity), 0);
      set({
        items,
        subtotal,
        itemCount: items.reduce((sum: number, i: any) => sum + i.quantity, 0),
      });
      return;
    }

    await cartApi.update(itemId, quantity);
    const { data } = await cartApi.get();
    set({
      items: data.items || [],
      subtotal: data.subtotal || 0,
      itemCount: (data.items || []).reduce((sum: number, i: CartItem) => sum + i.quantity, 0),
    });
  },

  removeItem: async (itemId) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      const localCart = localStorage.getItem('localCart');
      let items: CartItem[] = [];
      if (localCart) {
        try { items = JSON.parse(localCart); } catch {}
      }

      items = items.filter(i => i.id !== itemId);

      localStorage.setItem('localCart', JSON.stringify(items));
      const subtotal = items.reduce((sum: number, i: any) => sum + (Number(i.variant.price) * i.quantity), 0);
      set({
        items,
        subtotal,
        itemCount: items.reduce((sum: number, i: any) => sum + i.quantity, 0),
      });
      return;
    }

    await cartApi.remove(itemId);
    const { data } = await cartApi.get();
    set({
      items: data.items || [],
      subtotal: data.subtotal || 0,
      itemCount: (data.items || []).reduce((sum: number, i: CartItem) => sum + i.quantity, 0),
    });
  },

  clearCart: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      localStorage.removeItem('localCart');
      set({ items: [], subtotal: 0, itemCount: 0 });
      return;
    }

    await cartApi.clear();
    set({ items: [], subtotal: 0, itemCount: 0 });
  },
}));
