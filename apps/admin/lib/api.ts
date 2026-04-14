import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: agregar token admin
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: redirect on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// ─── Auth ───
export const adminAuthApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      // Clear cookie
      document.cookie = 'adminToken=; path=/; max-age=0';
      window.location.href = '/login';
    }
  },
};

// ─── Dashboard ───
export const dashboardApi = {
  getStats: () => api.get('/admin/stats').catch(() => ({ data: null })),
  getRecentOrders: () => api.get('/admin/recent-orders').catch(() => ({ data: [] })),
  getSalesReport: (days?: number) => api.get('/admin/sales-report', { params: { days } }).catch(() => ({ data: [] })),
  getBrandSales: () => api.get('/admin/brand-sales').catch(() => ({ data: [] })),
};

// ─── Products ───
export const adminProductsApi = {
  getAll: (params?: Record<string, any>) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.patch(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  getBrands: () => api.get('/products/brands'),
  getCategories: () => api.get('/products/categories'),
};

// ─── Orders ───
export const adminOrdersApi = {
  getAll: (params?: Record<string, any>) => api.get('/orders/all', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string, note?: string) =>
    api.patch(`/orders/${id}/status`, { status, note }),
};

// ─── Users ───
export const adminUsersApi = {
  getAll: (params?: Record<string, any>) => api.get('/users', { params }).catch(() => ({ data: [] })),
  getById: (id: string) => api.get(`/users/${id}`),
  updateRole: (id: string, role: string) => api.patch(`/users/${id}/role`, { role }),
  updateStatus: (id: string, isActive: boolean) => api.patch(`/users/${id}/status`, { isActive }),
};

// ─── Drops ───
export const adminDropsApi = {
  getAll: () => api.get('/drops'),
  create: (data: any) => api.post('/drops', data),
  updateStatus: (id: string, status: string) => api.patch(`/drops/${id}/status`, { status }),
};

// ─── Media ───
export const adminMediaApi = {
  upload: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/media/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ─── Payments (Verificación) ───
export const adminPaymentsApi = {
  getPending: () => api.get('/payments/pending'),
  getAll: (params?: Record<string, any>) => api.get('/payments/all', { params }),
  verify: (orderId: string, approved: boolean, note?: string) =>
    api.patch(`/payments/verify/${orderId}`, { approved, note }),
};

// ─── Returns ───
export const adminReturnsApi = {
  getAll: (params?: Record<string, any>) => api.get('/returns/all', { params }),
  updateStatus: (id: string, status: string, note?: string) =>
    api.patch(`/returns/${id}/status`, { status, adminNote: note }),
};
