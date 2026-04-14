// ==============================================
// api-tillas — Tipos compartidos de la API
// Basados en el schema de Prisma de TILLAS.EC
// ==============================================

// ==================== ENUMS ====================

export type Role = 'USER' | 'ADMIN';

export type Gender = 'MALE' | 'FEMALE' | 'UNISEX' | 'KIDS';

export type ProductStatus = 'ACTIVE' | 'OUT_OF_STOCK' | 'COMING_SOON' | 'ARCHIVED';

export type OrderStatus =
  | 'PENDING'
  | 'PAYMENT_PROCESSING'
  | 'PAID'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'APPROVED'
  | 'COMPLETED'
  | 'FAILED'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type DropStatus = 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';

export type DropType = 'NORMAL' | 'RAFFLE' | 'EARLY_ACCESS';

export type LoyaltyTier = 'BRONCE' | 'PLATA' | 'ORO' | 'ELITE';

export type ReturnStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export type LoyaltyTransactionType =
  | 'PURCHASE'
  | 'FIRST_PURCHASE'
  | 'BIRTHDAY'
  | 'REVIEW_PHOTO'
  | 'REFERRAL'
  | 'REDEEM'
  | 'ADJUSTMENT';

// ==================== USUARIOS ====================

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: Role;
  favoriteSizes: string[];
  birthday?: string;
  isVerified: boolean;
  referralCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  recipientName: string;
  phone: string;
  city: string;
  sector: string;
  mainStreet: string;
  secondaryStreet?: string;
  number?: string;
  reference: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== PRODUCTOS ====================

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  brandId: string;
  brand: Brand;
  model: string;
  description: string;
  slug: string;
  images: string[];
  categoryId: string;
  category: Category;
  gender: Gender;
  status: ProductStatus;
  isFeatured: boolean;
  releaseDate?: string;
  story?: string;
  colorway?: string;
  styleCode?: string;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  price: number;
  compareAt?: number;
  stock: number;
  sku: string;
}

// ==================== REVIEWS ====================

export interface Review {
  id: string;
  productId: string;
  userId: string;
  user: User;
  rating: number;
  comment?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

// ==================== CARRITO ====================

export interface CartItem {
  id: string;
  userId: string;
  variantId: string;
  variant: ProductVariant & { product: Product };
  quantity: number;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: Product;
  createdAt: string;
}

// ==================== ÓRDENES ====================

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user: User;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  loyaltyDiscount: number;
  total: number;
  status: OrderStatus;
  shippingAddress: Record<string, any>;
  notes?: string;
  trackingCode?: string;
  estimatedDeliveryAt?: string;
  factoryOrderDate?: string;
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  variant: ProductVariant;
  productName: string;
  productImage?: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string;
  changedBy?: string;
  createdAt: string;
}

// ==================== RETURNS ====================

export interface Return {
  id: string;
  orderId: string;
  order: Order;
  userId: string;
  user: User;
  reason: string;
  images: string[];
  status: ReturnStatus;
  adminNote?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== PAGOS ====================

export interface Payment {
  id: string;
  orderId: string;
  order: Order;
  amount: number;
  method: string;
  transactionId?: string;
  receiptImage?: string;
  receiptNotes?: string;
  status: PaymentStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  paidAt?: string;
  adminNote?: string;
  refundedAmount?: number;
  paymentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== DROPS ====================

export interface Drop {
  id: string;
  title: string;
  slug: string;
  description: string;
  image?: string;
  startsAt: string;
  endsAt?: string;
  status: DropStatus;
  type: DropType;
  isRaffle: boolean;
  maxEntries?: number;
  stock?: number;
  minTier?: LoyaltyTier;
  products: DropProduct[];
  entries: DropEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface DropProduct {
  id: string;
  dropId: string;
  drop: Drop;
  productId: string;
  product: Product;
}

export interface DropEntry {
  id: string;
  dropId: string;
  drop: Drop;
  userId: string;
  user: User;
  selectedSize: string;
  isWinner: boolean;
  notified: boolean;
  createdAt: string;
}

// ==================== LOYALTY ====================

export interface LoyaltyPoints {
  id: string;
  userId: string;
  user: User;
  totalPoints: number;
  currentPoints: number;
  tier: LoyaltyTier;
  transactions: LoyaltyTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyTransaction {
  id: string;
  loyaltyId: string;
  points: number;
  type: LoyaltyTransactionType;
  description: string;
  orderId?: string;
  createdAt: string;
}

// ==================== REQUEST/RESPONSE TYPES ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  birthday?: string;
  referralCode?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  userId?: string; // Solo para mobile
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface CreateOrderRequest {
  addressId: string;
  notes?: string;
}

export interface OrderItemRequest {
  variantId: string;
  quantity: number;
}

export interface CartAddRequest {
  variantId: string;
  quantity?: number;
}

export interface CartUpdateRequest {
  quantity: number;
}

export interface CreateAddressRequest {
  label: string;
  recipientName: string;
  phone: string;
  city: string;
  sector: string;
  mainStreet: string;
  secondaryStreet?: string;
  number?: string;
  reference: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export interface DropEnterRequest {
  selectedSize: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  note?: string;
}

export interface VerifyPaymentRequest {
  approved: boolean;
  note?: string;
}

export interface CreateReturnRequest {
  orderId: string;
  reason: string;
  images?: string[];
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
  favoriteSizes?: string[];
  birthday?: string;
}

// ==================== QUERY PARAMS ====================

export interface ProductQueryParams {
  brand?: string;
  category?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'popular';
  search?: string;
  page?: number;
  limit?: number;
}

export interface OrderQueryParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export interface UserQueryParams {
  search?: string;
  role?: Role;
  page?: number;
  limit?: number;
}

// ==================== API RESPONSE WRAPPER ====================

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}
