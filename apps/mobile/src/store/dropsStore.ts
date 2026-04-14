// ==============================================
// Drops Store — Zustand
// ==============================================

import { create } from 'zustand';
import api from '../services/api';

interface Drop {
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  startsAt: string;
  endsAt?: string;
  status: string;
  isRaffle: boolean;
  products: any[];
  totalEntries?: number;
}

interface DropsState {
  drops: Drop[];
  isLoading: boolean;
  fetchDrops: () => Promise<void>;
  enterDrop: (dropId: string, selectedSize: string) => Promise<void>;
}

export const useDropsStore = create<DropsState>((set) => ({
  drops: [],
  isLoading: false,

  fetchDrops: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/drops');
      set({ drops: data });
    } finally {
      set({ isLoading: false });
    }
  },

  enterDrop: async (dropId, selectedSize) => {
    await api.post(`/drops/${dropId}/enter`, { selectedSize });
  },
}));
