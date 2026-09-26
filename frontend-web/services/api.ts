// Web tarafı için merkezi API servis katmanı.
// Authorization header ile JWT token taşır.

import type {
  AdPackageResponse,
  AdPurchaseRequest,
  CartItemResponse,
  CategoryResponse,
  ListingResponse,
  LoginRequest,
  NotificationResponse,
  OrderResponse,
  ProductResponse,
  RegisterRequest,
  RegisterResponse,
  TokenResponse,
  TransactionResponse,
  UserResponse,
} from '../types/api';

const env = (import.meta as ImportMeta & { env?: { VITE_API_BASE_URL?: string } }).env;
export const API_BASE_URL = env?.VITE_API_BASE_URL || 'http://localhost:8000';

const TOKEN_KEY = 'eczacidan_auth_token';

// sessionStorage kullanılır: sekme kapanınca token silinir (localStorage XSS riski taşır).
export function getStoredToken(): string | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage.getItem(TOKEN_KEY) : null;
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      window.sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      window.sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // SSR veya gizli mod hatasını sessizce yut
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = getStoredToken();
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: finalHeaders,
    ...rest,
  });

  const contentType = response.headers.get('content-type');
  let body: unknown = null;
  if (contentType && contentType.includes('application/json')) {
    try {
      body = await response.json();
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    let message = `İstek başarısız (HTTP ${response.status})`;
    if (body && typeof body === 'object' && 'detail' in body) {
      const d = (body as { detail: unknown }).detail;
      if (typeof d === 'string') message = d;
      else if (Array.isArray(d)) {
        const first = d[0];
        if (first && typeof first === 'object' && 'msg' in first) {
          message = String((first as { msg: string }).msg);
        } else {
          message = String(d);
        }
      }
    }
    const error = new Error(message);
    (error as unknown as { status: number }).status = response.status;
    throw error;
  }

  return (body ?? ({} as unknown)) as T;
}

export const api = {
  get: <T>(path: string, opts: Omit<RequestInit, 'method'> & { auth?: boolean } = {}) =>
    request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(
    path: string,
    body: unknown,
    opts: Omit<RequestInit, 'method' | 'body'> & { auth?: boolean } = {},
  ) =>
    request<T>(path, {
      ...opts,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers: body instanceof FormData ? {} : undefined,
    }),
  put: <T>(
    path: string,
    body: unknown,
    opts: Omit<RequestInit, 'method' | 'body'> & { auth?: boolean } = {},
  ) =>
    request<T>(path, {
      ...opts,
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: <T>(path: string, opts: Omit<RequestInit, 'method'> & { auth?: boolean } = {}) =>
    request<T>(path, { ...opts, method: 'DELETE' }),

  // ── Auth Convenience ────────────────────────────────────────────────────
  login: (payload: LoginRequest) =>
    api.post<TokenResponse>('/api/auth/login', payload, { auth: false }),
  register: (payload: RegisterRequest) =>
    api.post<RegisterResponse>('/api/auth/register', payload, { auth: false }),
  me: () => api.get<UserResponse>('/api/auth/me'),
  updateMe: (payload: Partial<UserResponse> & { password?: string }) =>
    api.put<UserResponse>('/api/auth/me', payload),

  // ── Catalog ──────────────────────────────────────────────────────────────
  categories: () => api.get<CategoryResponse[]>('/api/categories'),
  products: (params?: { category?: string; q?: string; limit?: number; offset?: number }) => {
    const usp = new URLSearchParams();
    if (params?.category) usp.set('category', params.category);
    if (params?.q) usp.set('q', params.q);
    if (params?.limit !== undefined) usp.set('limit', String(params.limit));
    if (params?.offset !== undefined) usp.set('offset', String(params.offset));
    const query = usp.toString();
    return api.get<ProductResponse[]>(`/api/products${query ? `?${query}` : ''}`);
  },
  product: (id: number) => api.get<ProductResponse>(`/api/products/${id}`),

  // ── Listings ─────────────────────────────────────────────────────────────
  listings: (params?: {
    product_id?: number;
    category?: string;
    seller_id?: number;
    q?: string;
    delivery_type?: string;
    sort?:
      | 'price_asc'
      | 'price_desc'
      | 'skt_desc'
      | 'discount_desc'
      | 'sponsored_first';
  }) => {
    const usp = new URLSearchParams();
    if (params?.product_id !== undefined) usp.set('product_id', String(params.product_id));
    if (params?.category) usp.set('category', params.category);
    if (params?.seller_id !== undefined) usp.set('seller_id', String(params.seller_id));
    if (params?.q) usp.set('q', params.q);
    if (params?.delivery_type) usp.set('delivery_type', params.delivery_type);
    if (params?.sort) usp.set('sort', params.sort);
    const query = usp.toString();
    return api.get<ListingResponse[]>(`/api/listings${query ? `?${query}` : ''}`);
  },
  listing: (id: number) => api.get<ListingResponse>(`/api/listings/${id}`),
  createListing: (payload: Omit<ListingResponse, 'id' | 'seller_id'>) =>
    api.post<ListingResponse>('/api/listings', payload),
  updateListing: (id: number, payload: Partial<ListingResponse>) =>
    api.put<ListingResponse>(`/api/listings/${id}`, payload),
  deleteListing: (id: number) =>
    api.delete<{ success: boolean; message: string }>(`/api/listings/${id}`),
  myListings: () => api.get<ListingResponse[]>('/api/me/listings'),

  // ── Cart ─────────────────────────────────────────────────────────────────
  cart: () => api.get<CartItemResponse[]>('/api/cart'),
  addToCart: (listing_id: number, quantity: number) =>
    api.post<CartItemResponse>('/api/cart', { listing_id, quantity }),
  updateCart: (item_id: number, quantity: number) =>
    api.put<CartItemResponse>(`/api/cart/${item_id}`, { quantity }),
  removeFromCart: (item_id: number) => api.delete<{ success: boolean }>(`/api/cart/${item_id}`),
  clearCart: () => api.delete<{ success: boolean }>('/api/cart'),

  // ── Orders ───────────────────────────────────────────────────────────────
  orders: () => api.get<OrderResponse[]>('/api/orders'),
  createOrder: (payload?: {
    cart_items?: { listing_id: number; quantity: number }[];
    listing_id?: number;
    quantity?: number;
  }) => api.post<OrderResponse[]>('/api/orders', payload ?? {}),

  // ── Notifications ────────────────────────────────────────────────────────
  notifications: (only_unread = false) =>
    api.get<NotificationResponse[]>(
      `/api/notifications${only_unread ? '?only_unread=true' : ''}`,
    ),
  markNotificationRead: (id: number) =>
    api.post<{ success: boolean }>(`/api/notifications/${id}/read`, {}),
  markAllNotificationsRead: () =>
    api.post<{ success: boolean }>('/api/notifications/read-all', {}),

  // ── Transactions ─────────────────────────────────────────────────────────
  transactions: () => api.get<TransactionResponse[]>('/api/transactions'),

  // ── Ads ──────────────────────────────────────────────────────────────────
  adPackages: () => api.get<AdPackageResponse[]>('/api/ad-packages'),
  purchaseAd: (payload: AdPurchaseRequest) =>
    api.post<{ success: boolean; message: string; listing_id: number }>(
      '/api/ad-purchase',
      payload,
    ),
};
