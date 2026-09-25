export interface Product {
  id: string;
  name: string;
  category: string;
  psf: number; // Perakende Satış Fiyatı
  barcode: string;
  manufacturer: string;
  description: string;
  imageUrl?: string;
}

export interface Listing {
  id: string;
  productId: string;
  productName?: string;
  category?: string;
  sellerName: string;
  sellerCity: string;
  sellerRating?: number;       // 0.0 – 10.0 arası puan
  sellerListingCount?: number; // Satıcının toplam ilan sayısı
  isVerifiedSeller: boolean;
  isPremiumSeller: boolean;
  isSponsored?: boolean; // Ücretli Öne Çıkarılmış Reklam İlanı
  sponsoredDays?: number;
  status?: 'pending' | 'approved' | 'rejected'; // Sistem Onay Durumu
  deliveryType: 'today' | '24h'; // today: Bugün Teslimat, 24h: 24 Saat İçi
  isNewListing: boolean;
  isDiscounted: boolean;
  unitPrice: number;
  stock: number;
  mfRatio: string; // e.g. "10+1" or "5+1" or "Yok"
  skt: string; // MM/YYYY
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

export interface AdPackage {
  id: string;
  name: string;
  days: number;
  price: number;
  badgeText: string;
  features: string[];
}

export interface PurchaseOrder {
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

export const MOCK_AD_PACKAGES: AdPackage[] = [
  {
    id: 'ad-1',
    name: '1 Günlük Hızlı Reklam',
    days: 1,
    price: 19.90,
    badgeText: 'Fırsat Paket',
    features: ['1 Gün Boyunca Listenin En Üstünde Gösterim', 'Sponsorlu Premium Rozeti', 'Arama Sonuçlarında Öne Çıkarma'],
  },
  {
    id: 'ad-7',
    name: '7 Günlük Standart Reklam',
    days: 7,
    price: 49.90,
    badgeText: 'En Popüler',
    features: ['7 Gün Boyunca Kesintisiz Üst Sıra Garantisi', 'Altın Işıltılı Premium Rozet', '%300 Daha Fazla Görüntülenme'],
  },
  {
    id: 'ad-30',
    name: '30 Günlük Pro Sponsor',
    days: 30,
    price: 149.90,
    badgeText: 'En Avantajlı (%50 İndirim)',
    features: ['30 Gün Boyunca Tüm İlanlarda Öne Çıkma', 'Özel Eczane Logo & Premium Rozeti', 'Haftalık İlan Analitik Raporu'],
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-2',
    name: 'Parol 500 mg 20 Tablet (Demo Test Ürünü)',
    category: 'Medikal',
    psf: 68.20,
    barcode: '8699525010019',
    manufacturer: 'Atabay İlaç',
    description: 'Ağrı kesici ve ateş düşürücü tablet (Demo Test Ürünü).',
  },
  {
    id: 'prod-firsat-1',
    name: 'Supradyn Energy Focus 30 Tablet',
    category: 'Besin Takviyesi',
    psf: 320.00,
    barcode: '8699543090123',
    manufacturer: 'Bayer',
    description: 'Multivitamin ve mineral takviyesi, zihinsel performans desteği.',
  },
  {
    id: 'prod-firsat-2',
    name: 'Solgar Omega 3 700 mg 60 Yumuşak Kapsül',
    category: 'Besin Takviyesi',
    psf: 640.00,
    barcode: '8699512340981',
    manufacturer: 'Solgar',
    description: 'Yüksek saflıkta konsantre balık yağı esansiyel yağ asitleri.',
  },
  {
    id: 'prod-firsat-3',
    name: 'Bioderma Sensibio H2O Misel Su 500 ml',
    category: 'Kişisel Bakım',
    psf: 480.00,
    barcode: '8699587654321',
    manufacturer: 'Bioderma',
    description: 'Hassas ciltler için durulama gerektirmeyen temizleyici misel solüsyon.',
  },
  {
    id: 'prod-firsat-4',
    name: 'Omron M3 Comfort Dijital Koldan Tansiyon Aleti',
    category: 'Medikal',
    psf: 1850.00,
    barcode: '8699511223344',
    manufacturer: 'Omron',
    description: 'Akıllı manşet teknolojili Klinik Onaylı koldan ölçer dijital tansiyon aleti.',
  },
  {
    id: 'prod-firsat-5',
    name: 'Mustela Gentle Cleansing Baby Shampoo 500 ml',
    category: 'Anne & Bebek',
    psf: 390.00,
    barcode: '8699599887766',
    manufacturer: 'Mustela',
    description: 'Yenidoğandan itibaren bebek saç ve vücut şampuanı.',
  },
  {
    id: 'prod-anne-1',
    name: 'Aptamil 1 Bebek Sütü 800 gr',
    category: 'Anne & Bebek',
    psf: 650.00,
    barcode: '8699500112233',
    manufacturer: 'Aptamil Nutricia',
    description: '0-6 ay bebekler için anne sütü takviyeli bebek devam sütü.',
  },
  {
    id: 'prod-anne-2',
    name: 'Prima Premium Care Bebek Bezi 4 Numara 52 Adet',
    category: 'Anne & Bebek',
    psf: 420.00,
    barcode: '8699500445566',
    manufacturer: 'P&G Prima',
    description: 'Maxi korumalı, nefes alabilen ipeksi dokulu bebek bezi.',
  },
  {
    id: 'prod-anne-3',
    name: 'Sudocrem Bebek Pişik Önleyici Krem 250 gr',
    category: 'Anne & Bebek',
    psf: 290.00,
    barcode: '8699500778899',
    manufacturer: 'Teva Sudocrem',
    description: 'Bebek pişiklerini önleyici ve koruyucu bariyer krem.',
  },
  {
    id: 'prod-firsat-6',
    name: 'Vichy Mineral 89 Nemlendirici Serum 50 ml',
    category: 'Kişisel Bakım',
    psf: 890.00,
    barcode: '8699544332211',
    manufacturer: 'Vichy',
    description: '%89 Vichy Volkanik Suyu ve Hyalüronik Asit içeren güçlendirici serum.',
  },
  {
    id: 'prod-firsat-7',
    name: 'Benexol B12 30 Film Tablet',
    category: 'Besin Takviyesi',
    psf: 180.00,
    barcode: '8699515090011',
    manufacturer: 'Bayer',
    description: 'B1, B6 ve B12 vitamin kombinasyonu desteği.',
  },
];

export const MOCK_LISTINGS: Listing[] = [
  {
    id: 'list-demo-1',
    productId: 'prod-2',
    productName: 'Parol 500 mg 20 Tablet (Demo Test Ürünü)',
    category: 'Medikal',
    sellerName: 'Kadıköy Şifa Eczanesi (Demo Hesabı)',
    sellerCity: 'Kadıköy / İstanbul',
    sellerRating: 10.0,
    sellerListingCount: 1,
    isVerifiedSeller: true,
    isPremiumSeller: true,
    isSponsored: true,
    sponsoredDays: 30,
    status: 'approved',
    deliveryType: 'today',
    isNewListing: true,
    isDiscounted: true,
    unitPrice: 26.20,
    stock: 100,
    mfRatio: '10+2',
    skt: '10/2026',
    discountPercentage: 61.5,
    minOrderQty: 1,
  },
  {
    id: 'list-firsat-7',
    productId: 'prod-firsat-7',
    productName: 'Benexol B12 30 Film Tablet',
    category: 'Besin Takviyesi',
    sellerName: 'Kadıköy Şifa Eczanesi (Demo Hesabı)',
    sellerCity: 'Kadıköy / İstanbul',
    sellerRating: 10.0,
    sellerListingCount: 15,
    isVerifiedSeller: true,
    isPremiumSeller: true,
    isSponsored: true,
    sponsoredDays: 7,
    status: 'approved',
    deliveryType: 'today',
    isNewListing: true,
    isDiscounted: true,
    unitPrice: 63.00,
    stock: 50,
    mfRatio: '10+1',
    skt: '12/2026',
    discountPercentage: 65.0,
    minOrderQty: 1,
  },
  {
    id: 'list-firsat-1',
    productId: 'prod-firsat-1',
    productName: 'Supradyn Energy Focus 30 Tablet',
    category: 'Besin Takviyesi',
    sellerName: 'Moda Eczanesi',
    sellerCity: 'Kadıköy / İstanbul',
    sellerRating: 9.9,
    sellerListingCount: 18,
    isVerifiedSeller: true,
    isPremiumSeller: true,
    isSponsored: true,
    sponsoredDays: 7,
    status: 'approved',
    deliveryType: 'today',
    isNewListing: true,
    isDiscounted: true,
    unitPrice: 95.00,
    stock: 65,
    mfRatio: '10+2',
    skt: '08/2027',
    discountPercentage: 70.3,
    minOrderQty: 1,
  },
  {
    id: 'list-firsat-2',
    productId: 'prod-firsat-2',
    productName: 'Solgar Omega 3 700 mg 60 Yumuşak Kapsül',
    category: 'Besin Takviyesi',
    sellerName: 'Kadıköy Şifa Eczanesi (Demo Hesabı)',
    sellerCity: 'Kadıköy / İstanbul',
    sellerRating: 10.0,
    sellerListingCount: 24,
    isVerifiedSeller: true,
    isPremiumSeller: true,
    isSponsored: true,
    sponsoredDays: 14,
    status: 'approved',
    deliveryType: 'today',
    isNewListing: true,
    isDiscounted: true,
    unitPrice: 220.00,
    stock: 40,
    mfRatio: '5+1',
    skt: '12/2027',
    discountPercentage: 65.6,
    minOrderQty: 1,
  },
  {
    id: 'list-firsat-3',
    productId: 'prod-firsat-3',
    productName: 'Bioderma Sensibio H2O Misel Su 500 ml',
    category: 'Kişisel Bakım',
    sellerName: 'Çamlıca Eczanesi',
    sellerCity: 'Üsküdar / İstanbul',
    sellerRating: 9.8,
    sellerListingCount: 15,
    isVerifiedSeller: true,
    isPremiumSeller: false,
    isSponsored: false,
    status: 'approved',
    deliveryType: '24h',
    isNewListing: false,
    isDiscounted: true,
    unitPrice: 165.00,
    stock: 90,
    mfRatio: '10+3',
    skt: '05/2028',
    discountPercentage: 65.6,
    minOrderQty: 2,
  },
  {
    id: 'list-firsat-4',
    productId: 'prod-firsat-4',
    productName: 'Omron M3 Comfort Dijital Koldan Tansiyon Aleti',
    category: 'Medikal',
    sellerName: 'Nişantaşı Eczanesi',
    sellerCity: 'Şişli / İstanbul',
    sellerRating: 9.7,
    sellerListingCount: 30,
    isVerifiedSeller: true,
    isPremiumSeller: true,
    isSponsored: false,
    status: 'approved',
    deliveryType: 'today',
    isNewListing: true,
    isDiscounted: true,
    unitPrice: 690.00,
    stock: 25,
    mfRatio: 'Yok',
    skt: '11/2029',
    discountPercentage: 62.7,
    minOrderQty: 1,
  },
  {
    id: 'list-firsat-5',
    productId: 'prod-firsat-5',
    productName: 'Mustela Gentle Cleansing Baby Shampoo 500 ml',
    category: 'Anne & Bebek',
    sellerName: 'Beşiktaş Eczanesi',
    sellerCity: 'Beşiktaş / İstanbul',
    sellerRating: 9.9,
    sellerListingCount: 12,
    isVerifiedSeller: true,
    isPremiumSeller: false,
    isSponsored: false,
    status: 'approved',
    deliveryType: '24h',
    isNewListing: true,
    isDiscounted: true,
    unitPrice: 130.00,
    stock: 120,
    mfRatio: '10+2',
    skt: '09/2027',
    discountPercentage: 66.6,
    minOrderQty: 1,
  },
  {
    id: 'list-firsat-6',
    productId: 'prod-firsat-6',
    productName: 'Vichy Mineral 89 Nemlendirici Serum 50 ml',
    category: 'Kişisel Bakım',
    sellerName: 'Bağdat Eczanesi',
    sellerCity: 'Kadıköy / İstanbul',
    sellerRating: 9.8,
    sellerListingCount: 22,
    isVerifiedSeller: true,
    isPremiumSeller: true,
    isSponsored: false,
    status: 'approved',
    deliveryType: 'today',
    isNewListing: false,
    isDiscounted: true,
    unitPrice: 290.00,
    stock: 55,
    mfRatio: '10+1',
    skt: '04/2028',
    discountPercentage: 67.4,
    minOrderQty: 1,
  },
  {
    id: 'list-anne-1',
    productId: 'prod-anne-1',
    productName: 'Aptamil 1 Bebek Sütü 800 gr',
    category: 'Anne & Bebek',
    sellerName: 'Kadıköy Şifa Eczanesi (Demo Hesabı)',
    sellerCity: 'Kadıköy / İstanbul',
    sellerRating: 10.0,
    sellerListingCount: 15,
    isVerifiedSeller: true,
    isPremiumSeller: true,
    isSponsored: true,
    sponsoredDays: 14,
    status: 'approved',
    deliveryType: 'today',
    isNewListing: true,
    isDiscounted: true,
    unitPrice: 240.00,
    stock: 80,
    mfRatio: '10+2',
    skt: '11/2027',
    discountPercentage: 63.0,
    minOrderQty: 1,
  },
  {
    id: 'list-anne-2',
    productId: 'prod-anne-2',
    productName: 'Prima Premium Care Bebek Bezi 4 Numara 52 Adet',
    category: 'Anne & Bebek',
    sellerName: 'Moda Eczanesi',
    sellerCity: 'Kadıköy / İstanbul',
    sellerRating: 9.9,
    sellerListingCount: 18,
    isVerifiedSeller: true,
    isPremiumSeller: true,
    isSponsored: false,
    status: 'approved',
    deliveryType: 'today',
    isNewListing: true,
    isDiscounted: true,
    unitPrice: 160.00,
    stock: 95,
    mfRatio: '5+1',
    skt: '08/2028',
    discountPercentage: 61.9,
    minOrderQty: 1,
  },
  {
    id: 'list-anne-3',
    productId: 'prod-anne-3',
    productName: 'Sudocrem Bebek Pişik Önleyici Krem 250 gr',
    category: 'Anne & Bebek',
    sellerName: 'Beşiktaş Eczanesi',
    sellerCity: 'Beşiktaş / İstanbul',
    sellerRating: 9.9,
    sellerListingCount: 12,
    isVerifiedSeller: true,
    isPremiumSeller: false,
    isSponsored: false,
    status: 'approved',
    deliveryType: '24h',
    isNewListing: false,
    isDiscounted: true,
    unitPrice: 110.00,
    stock: 140,
    mfRatio: '10+1',
    skt: '12/2027',
    discountPercentage: 62.0,
    minOrderQty: 1,
  },
];

export const MOCK_MY_LISTINGS: Listing[] = [...MOCK_LISTINGS];

export const MOCK_PURCHASES: PurchaseOrder[] = [];

export const MOCK_TRANSACTIONS: FinancialTransaction[] = [];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [];
