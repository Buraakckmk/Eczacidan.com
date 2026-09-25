// Web tarafı için ortak API tipleri.

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  gln: string;
  gnl?: string; // backward compat
  tc: string;
  username: string;
  password: string;
  email?: string;
  pharmacy_name?: string;
  pharmacy_city?: string;
  consent: boolean;
  privacy: boolean;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user_id?: number | null;
}

export interface UserResponse {
  id: number;
  username: string;
  gln: string;
  email?: string | null;
  pharmacy_name?: string | null;
  pharmacy_city?: string | null;
  pharmacy_address?: string | null;
  phone?: string | null;
  is_verified: boolean;
  is_premium: boolean;
  balance: number;
  rating: number;
  listing_count: number;
}

// ── Catalog ─────────────────────────────────────────────────────────────────

export interface CategoryResponse {
  id: number;
  name: string;
  slug?: string;
  description?: string;
}

export interface ProductResponse {
  id: number;
  name: string;
  barcode?: string | null;
  psf: number;
  manufacturer?: string | null;
  description?: string | null;
  image_url?: string | null;
  category_id?: number | null;
  category_name?: string | null;
}

// ── Listings ────────────────────────────────────────────────────────────────

export interface ListingResponse {
  id: number;
  product_id: number;
  seller_id: number;
  seller_name?: string | null;
  seller_city?: string | null;
  seller_rating?: number | null;
  seller_listing_count?: number | null;
  is_verified_seller: boolean;
  is_premium_seller: boolean;
  product_name?: string | null;
  category_name?: string | null;
  product_barcode?: string | null;
  product_psf?: number | null;
  status: string;
  delivery_type: string;
  is_new_listing: boolean;
  is_discounted: boolean;
  is_sponsored: boolean;
  sponsored_days: number;
  unit_price: number;
  stock: number;
  mf_ratio: string;
  skt?: string | null;
  discount_percentage: number;
  min_order_qty: number;
  created_at?: string | null;
}

// ── Cart / Order / Notification / Transaction / Ads ─────────────────────────

export interface CartItemResponse {
  id: number;
  listing_id: number;
  quantity: number;
  product_name?: string | null;
  seller_name?: string | null;
  unit_price?: number | null;
  min_order_qty?: number | null;
  skt?: string | null;
  delivery_type?: string | null;
}

export interface OrderResponse {
  id: number;
  order_number: string;
  product_name?: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  tracking_number?: string | null;
  date?: string | null;
  seller_id?: number | null;
  created_at?: string | null;
}

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  time?: string | null;
  unread: boolean;
  type: string;
}

export interface TransactionResponse {
  id: number;
  date?: string | null;
  type: 'gelir' | 'gider';
  title: string;
  description: string;
  amount: number;
  balance_after: number;
}

export interface AdPackageResponse {
  id: number;
  name: string;
  days: number;
  price: number;
  badge_text?: string | null;
  features: string[];
}

export interface AdPurchaseRequest {
  package_id: number;
  listing_id: number;
  payment_method: string;
}
