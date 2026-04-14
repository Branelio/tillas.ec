// ==============================================
// Custom Hooks
// ==============================================

export { useAuthStore } from '../store/authStore';
export { useCartStore } from '../store/cartStore';
export { useDropsStore } from '../store/dropsStore';

// Re-export hook aliases for convenience
export const useCart = () => {
  const store = require('../store/cartStore').useCartStore;
  return store();
};

export const useLoyalty = () => {
  // TODO: Implementar loyalty hooks
  return { points: 0, tier: 'BRONCE' };
};

export const useDrops = () => {
  const store = require('../store/dropsStore').useDropsStore;
  return store();
};
