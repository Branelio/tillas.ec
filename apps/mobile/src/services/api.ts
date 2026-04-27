// ==============================================
// API Service — Axios client
// ==============================================

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/theme';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: agregar token a cada request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: refresh token automático en 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const userId = await SecureStore.getItemAsync('userId');
        if (refreshToken && userId) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            userId,
            refreshToken,
          });
          await SecureStore.setItemAsync('accessToken', data.accessToken);
          await SecureStore.setItemAsync('refreshToken', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('userId');
      }
    }
    return Promise.reject(error);
  },
);

// ─── Products ───
export const productsApi = {
  getAll: (params?: Record<string, any>) => api.get('/products', { params }),
  getBySlug: (slug: string) => api.get(`/products/${slug}`),
  getFeatured: () => api.get('/products/featured'),
  getNewArrivals: () => api.get('/products/new-arrivals'),
  getBrands: () => api.get('/products/brands'),
  getCategories: () => api.get('/products/categories'),
};

// ─── Auth ───
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  verifyOtp: (data: { email: string; code: string }) => api.post('/auth/verify-otp', data),
  resendOtp: (email: string) => api.post('/auth/resend-otp', { email }),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getProfile: () => api.get('/users/profile'),
  logout: () => api.post('/auth/logout'),
};

// ─── Cart ───
export const cartApi = {
  get: () => api.get('/cart'),
  add: (variantId: string, quantity = 1) => api.post('/cart', { variantId, quantity }),
  update: (itemId: string, quantity: number) => api.patch(`/cart/${itemId}`, { quantity }),
  remove: (itemId: string) => api.delete(`/cart/${itemId}`),
  clear: () => api.delete('/cart'),
};

// ─── Orders ───
export const ordersApi = {
  create: (addressId: string) => api.post('/orders', { addressId }),
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
};

// ─── Users ───
export const usersApi = {
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data: any) => api.post('/users/addresses', data),
  updateAddress: (id: string, data: any) => api.patch(`/users/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/users/addresses/${id}`),
  updateProfile: (data: any) => api.patch('/users/profile', data),
  getWishlist: () => api.get('/users/wishlist'),
  toggleWishlist: (productId: string) => api.post('/users/wishlist/toggle', { productId }),
};

// ─── Reviews ───
export const reviewsApi = {
  getByProduct: (productId: string) => api.get(`/reviews/product/${productId}`),
  create: (data: any) => api.post('/reviews', data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
};

// ─── Drops ───
export const dropsApi = {
  getAll: () => api.get('/drops'),
  getBySlug: (slug: string) => api.get(`/drops/${slug}`),
  enter: (dropId: string, selectedSize: string) => api.post(`/drops/${dropId}/enter`, { selectedSize }),
  getMyEntries: () => api.get('/drops/my-entries'),
};

// ─── Payments (Transferencia Bancaria) ───
export const paymentsApi = {
  getBankInfo: () => api.get('/payments/bank-info'),
  uploadReceipt: (orderId: string, file: any, notes?: string) => {
    const fd = new FormData();
    fd.append('receipt', {
      uri: file.uri,
      name: file.fileName || `receipt-${Date.now()}.jpg`,
      type: file.mimeType || file.type || 'image/jpeg',
    } as any);
    fd.append('orderId', orderId);
    if (notes) fd.append('notes', notes);
    return api.post('/payments/upload-receipt', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getStatus: (orderId: string) => api.get(`/payments/status/${orderId}`),
};

export default api;
