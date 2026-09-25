// Mobil tarafı için ortak API ve UI tipleri.

export interface Product {
  id: string;
  name: string;
  category: string;
  psf: number;
  barcode: string;
  manufacturer: string;
  description: string;
}

export interface Listing {
  id: string;
  productId: string;
  productName?: string;
  category?: string;
  sellerName: string;
  sellerCity: string;
  sellerRating?: number;
  sellerListingCount?: number;
  isVerifiedSeller: boolean;
  isPremiumSeller: boolean;
  isSponsored?: boolean;
  sponsoredDays?: number;
  status?: 'pending' | 'approved' | 'rejected';
  deliveryType: 'today' | '24h';
  isNewListing: boolean;
  isDiscounted: boolean;
  unitPrice: number;
  stock: number;
  mfRatio: string;
  skt: string;
  discountPercentage: number;
  minOrderQty: number;
}

export interface CartItem {
  listingId: string;
  productId: string;
  productName: string;
  sellerName: string;
  unitPrice: number;
  quantity: number;
  minOrderQty?: number;
  skt: string;
  deliveryType: 'today' | '24h';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'price' | 'order' | 'system';
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  date: string;
  sellerPharmacy: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'Kargoda' | 'Teslim Edildi' | 'Hazırlanıyor';
  trackingNumber: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: 'gelir' | 'gider';
  title: string;
  description: string;
  amount: number;
  balanceAfter: number;
}
