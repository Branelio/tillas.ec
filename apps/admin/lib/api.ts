import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ─── Tipos compartidos ───
interface ApiParams {
  limit?: number;
  page?: number;
  search?: string;
  status?: string;
  sort?: string;
  [key: string]: string | number | boolean | undefined;
}

interface ProductData {
  name: string;
  slug: string;
  description?: string;
  brandName?: string;
  categoryName?: string;
  images?: string[];
  isFeatured?: boolean;
  variants?: { size: string; price: number; stock: number; sku: string }[];
}

interface DropData {
  title: string;
  slug: string;
  description: string;
  type: string;
  isRaffle: boolean;
  startsAt: string;
  endsAt?: string;
  maxEntries?: number;
}

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
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
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
  getAll: (params?: ApiParams) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: ProductData) => api.post('/products', data),
  update: (id: string, data: Partial<ProductData>) => api.patch(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  getBrands: () => api.get('/products/brands'),
  getCategories: () => api.get('/products/categories'),
};

// ─── Orders ───
export const adminOrdersApi = {
  getAll: (params?: ApiParams) => api.get('/orders/all', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string, note?: string) =>
    api.patch(`/orders/${id}/status`, { status, note }),
};

// ─── Users ───
export const adminUsersApi = {
  getAll: (params?: ApiParams) => api.get('/users', { params }).catch(() => ({ data: [] })),
  getById: (id: string) => api.get(`/users/${id}`),
  updateRole: (id: string, role: string) => api.patch(`/users/${id}/role`, { role }),
  updateStatus: (id: string, isActive: boolean) => api.patch(`/users/${id}/status`, { isActive }),
};

// ─── Drops ───
export const adminDropsApi = {
  getAll: () => api.get('/drops'),
  create: (data: DropData) => api.post('/drops', data),
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
  getAll: (params?: ApiParams) => api.get('/payments/all', { params }),
  verify: (orderId: string, approved: boolean, note?: string) =>
    api.patch(`/payments/verify/${orderId}`, { approved, note }),
};

// ─── Returns ───
export const adminReturnsApi = {
  getAll: (params?: ApiParams) => api.get('/returns/all', { params }),
  updateStatus: (id: string, status: string, note?: string) =>
    api.patch(`/returns/${id}/status`, { status, adminNote: note }),
};

// ─── Telegram (Importaciones de proveedor) ───
export const adminTelegramApi = {
  getImports: (params?: ApiParams) => api.get('/telegram/imports', { params }),
  getImportById: (id: string) => api.get(`/telegram/imports/${id}`),
  approveImport: (id: string, data: { productName: string; sellPrice: number; brandName?: string; categoryName?: string; sizes?: string[] }) =>
    api.patch(`/telegram/imports/${id}/approve`, data),
  rejectImport: (id: string, reason?: string) =>
    api.patch(`/telegram/imports/${id}/reject`, { reason }),
  getStatus: () => api.get('/telegram/status'),
  getPendingCount: () => api.get('/telegram/imports/pending-count').catch(() => ({ data: { count: 0 } })),
  syncHistory: (limit: number) => api.patch('/telegram/sync-history', { limit }),
};
