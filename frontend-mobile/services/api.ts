// Mobil tarafı için merkezi API servis katmanı.

import { CartItem, FinancialTransaction, Listing, NotificationItem, OrderItem, Product } from '../types/api';

const API_BASE_URL =
  (typeof process !== 'undefined' && (process as any).env?.EXPO_PUBLIC_API_BASE_URL) ||
  'http://localhost:8000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const MOCK_MOBILE_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Agavit Şurup 150 ml',
    category: 'Besin Takviyesi',
    psf: 45.56,
    barcode: '8699543011029',
    manufacturer: 'Agavit İlaç A.Ş.',
    description: 'Multivitamin ve mineral takviyesi içeren çocuk şurubu.',
  },
  {
    id: 'prod-2',
    name: 'Parol 500 mg 20 Tablet',
    category: 'Medikal',
    psf: 68.2,
    barcode: '8699525010019',
    manufacturer: 'Atabay İlaç',
    description: 'Ağrı kesici ve ateş düşürücü tablet.',
  },
  {
    id: 'prod-3',
    name: 'Ocean Vitamin D3 1000 IU Damla 20 ml',
    category: 'Besin Takviyesi',
    psf: 185.0,
    barcode: '8697415840331',
    manufacturer: 'Orzax İlaç',
    description: 'Zeytinyağlı D3 Vitamini içeren takviye edici gıda.',
  },
];

export const MOCK_MOBILE_LISTINGS: Listing[] = [
  {
    id: 'list-1',
    productId: 'prod-1',
    productName: 'Agavit Şurup 150 ml',
    category: 'Besin Takviyesi',
    sellerName: 'Kadıköy Şifa Eczanesi',
    sellerCity: 'Kadıköy / İstanbul',
    sellerRating: 9.8,
    sellerListingCount: 12,
    isVerifiedSeller: true,
    isPremiumSeller: true,
    isSponsored: true,
    sponsoredDays: 7,
    status: 'approved',
    deliveryType: 'today',
    isNewListing: true,
    isDiscounted: true,
    unitPrice: 28.5,
    stock: 120,
    mfRatio: '10+1',
    skt: '11/2026',
    discountPercentage: 37.4,
    minOrderQty: 5,
  },
  {
    id: 'list-2',
    productId: 'prod-2',
    productName: 'Parol 500 mg 20 Tablet',
    category: 'Medikal',
    sellerName: 'Kadıköy Şifa Eczanesi',
    sellerCity: 'Kadıköy / İstanbul',
    sellerRating: 9.8,
    sellerListingCount: 12,
    isVerifiedSeller: true,
    isPremiumSeller: true,
    isSponsored: true,
    sponsoredDays: 30,
    status: 'approved',
    deliveryType: 'today',
    isNewListing: true,
    isDiscounted: true,
    unitPrice: 42.0,
    stock: 250,
    mfRatio: '10+2',
    skt: '01/2028',
    discountPercentage: 38.4,
    minOrderQty: 10,
  },
  {
    id: 'list-3',
    productId: 'prod-3',
    productName: 'Ocean Vitamin D3 1000 IU Damla 20 ml',
    category: 'Besin Takviyesi',
    sellerName: 'Kadıköy Şifa Eczanesi',
    sellerCity: 'Kadıköy / İstanbul',
    sellerRating: 9.8,
    sellerListingCount: 12,
    isVerifiedSeller: true,
    isPremiumSeller: true,
    isSponsored: false,
    status: 'approved',
    deliveryType: 'today',
    isNewListing: true,
    isDiscounted: true,
    unitPrice: 125.0,
    stock: 60,
    mfRatio: '5+1',
    skt: '09/2027',
    discountPercentage: 32.4,
    minOrderQty: 1,
  },
];

export const mobileApi = {
  getProducts: async (): Promise<Product[]> => {
    try {
      const res = await request<any[]>('/api/products');
      if (res && res.length > 0) {
        return res.map((p) => ({
          id: String(p.id),
          name: p.name,
          category: p.category_name || 'Besin Takviyesi',
          psf: p.psf || 0,
          barcode: p.barcode || '',
          manufacturer: p.manufacturer || '',
          description: p.description || '',
        }));
      }
    } catch {}
    return MOCK_MOBILE_PRODUCTS;
  },

  getListings: async (): Promise<Listing[]> => {
    try {
      const res = await request<any[]>('/api/listings?sort=sponsored_first');
      if (res && res.length > 0) {
        return res.map((l) => ({
          id: String(l.id),
          productId: String(l.product_id),
          productName: l.product_name,
          category: l.category_name,
          sellerName: l.seller_name || 'Eczane',
          sellerCity: l.seller_city || 'İstanbul',
          sellerRating: l.seller_rating || 9.0,
          sellerListingCount: l.seller_listing_count || 10,
          isVerifiedSeller: !!l.is_verified_seller,
          isPremiumSeller: !!l.is_premium_seller,
          isSponsored: !!l.is_sponsored,
          sponsoredDays: l.sponsored_days || 0,
          status: l.status === 'approved' ? 'approved' : l.status === 'pending' ? 'pending' : 'rejected',
          deliveryType: (l.delivery_type as 'today' | '24h') || 'today',
          isNewListing: !!l.is_new_listing,
          isDiscounted: !!l.is_discounted,
          unitPrice: l.unit_price,
          stock: l.stock,
          mfRatio: l.mf_ratio || 'Yok',
          skt: l.skt || '12/2026',
          discountPercentage: l.discount_percentage || 0,
          minOrderQty: l.min_order_qty || 1,
        }));
      }
    } catch {}
    return MOCK_MOBILE_LISTINGS;
  },

  getCart: async (): Promise<CartItem[]> => {
    return [
      {
        listingId: 'list-1',
        productId: 'prod-1',
        productName: 'Agavit Şurup 150 ml',
        sellerName: 'Şifa Eczanesi',
        unitPrice: 28.5,
        quantity: 10,
        minOrderQty: 5,
        skt: '11/2026',
        deliveryType: 'today',
      },
    ];
  },

  getOrders: async (): Promise<OrderItem[]> => {
    return [
      {
        id: 'ord-101',
        orderNumber: 'ECZ-20260807-001',
        date: '07 Ağustos 2026',
        sellerPharmacy: 'Güneş Eczanesi (Ankara)',
        productName: 'Parol 500 mg 20 Tablet',
        quantity: 50,
        unitPrice: 31.0,
        totalPrice: 1550.0,
        status: 'Kargoda',
        trackingNumber: 'YURT-94827104',
      },
    ];
  },

  getTransactions: async (): Promise<FinancialTransaction[]> => {
    return [
      {
        id: 'tx-1',
        date: '07 Ağustos 2026 - 16:40',
        type: 'gelir',
        title: 'İlan Satış Geliri',
        description: 'Şifa Eczanesi 20 Adet Agavit Şurup Satın Aldı',
        amount: 570.0,
        balanceAfter: 1450.0,
      },
    ];
  },
};
