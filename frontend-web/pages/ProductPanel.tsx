import {
  Award,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Flame,
  Heart,
  Info,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLayoutContext } from '../src/components/Layout';
import { Toast } from '../src/components/Toast';
import { HeroBannerSlider } from '../src/components/HeroBannerSlider';
import { RecentlyViewedProducts } from '../src/components/RecentlyViewedProducts';
import type { Listing, Product, AdPackage } from '../src/data/mockData';
import { MOCK_AD_PACKAGES, MOCK_PRODUCTS } from '../src/data/mockData';
import { categoryToSlug, sellerToSlug, slugToCategory } from '../src/utils/slug';

// ─── HOMEPAGE CATEGORY CARDS DATA ────────────────────────────────────────────

const HOMEPAGE_CATEGORIES = [
  {
    name: 'Anne & Bebek',
    icon: '👶',
    badge: '85+ Ürün',
    color: 'from-pink-500/10 via-rose-500/5 to-purple-500/10',
    borderColor: 'hover:border-pink-400 hover:shadow-pink-500/10',
    badgeBg: 'bg-pink-100 text-pink-700',
    desc: 'Bebek şampuanları, mamalar, pişik kremleri ve anne bakım ürünleri.',
  },
  {
    name: 'Besin Takviyesi',
    icon: '💊',
    badge: '140+ Ürün',
    color: 'from-amber-500/10 via-orange-500/5 to-yellow-500/10',
    borderColor: 'hover:border-amber-400 hover:shadow-amber-500/10',
    badgeBg: 'bg-amber-100 text-amber-800',
    desc: 'Multivitaminler, balık yağları, mineraller ve bağışıklık takviyeleri.',
  },
  {
    name: 'Kişisel Bakım',
    icon: '✨',
    badge: '92+ Ürün',
    color: 'from-purple-500/10 via-indigo-500/5 to-blue-500/10',
    borderColor: 'hover:border-purple-400 hover:shadow-purple-500/10',
    badgeBg: 'bg-purple-100 text-purple-700',
    desc: 'Dermokozmetik cilt bakımı, misel sular ve saç sağlığı ürünleri.',
  },
  {
    name: 'Medikal',
    icon: '🩺',
    badge: '110+ Ürün',
    color: 'from-blue-500/10 via-cyan-500/5 to-teal-500/10',
    borderColor: 'hover:border-blue-400 hover:shadow-blue-500/10',
    badgeBg: 'bg-blue-100 text-blue-700',
    desc: 'Tansiyon aletleri, nebülizörler, şeker ölçüm cihazları ve medikal cihazlar.',
  },
  {
    name: 'Sağlık',
    icon: '🏥',
    badge: '76+ Ürün',
    color: 'from-emerald-500/10 via-green-500/5 to-teal-500/10',
    borderColor: 'hover:border-emerald-400 hover:shadow-emerald-500/10',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    desc: 'İlk yardım gereçleri, koruyucu sağlık ve hijyen destek ürünleri.',
  },
  {
    name: 'Sarf Malzemeleri',
    icon: '📦',
    badge: '64+ Ürün',
    color: 'from-gray-500/10 via-slate-500/5 to-zinc-500/10',
    borderColor: 'hover:border-gray-400 hover:shadow-gray-500/10',
    badgeBg: 'bg-gray-100 text-gray-700',
    desc: 'Enjektörler, sargı bezleri, bantlar ve klinik sarf malzemeleri.',
  },
  {
    name: 'Outlet',
    icon: '🏷️',
    badge: '45+ Ürün',
    color: 'from-red-500/10 via-orange-500/5 to-rose-500/10',
    borderColor: 'hover:border-red-400 hover:shadow-red-500/10',
    badgeBg: 'bg-red-100 text-red-700',
    desc: 'Son stoklar, seri sonu indirimleri ve özel pazaryeri kampanyaları.',
  },
  {
    name: 'Özel Kategoriler',
    icon: '⭐',
    badge: '30+ Ürün',
    color: 'from-violet-500/10 via-purple-500/5 to-fuchsia-500/10',
    borderColor: 'hover:border-violet-400 hover:shadow-violet-500/10',
    badgeBg: 'bg-violet-100 text-violet-700',
    desc: 'Eczanelere özel toplu tedarik fırsatları ve anlaşmalı ilaç ilanları.',
  },
];

// ─── FULL-PAGE SELLER STOREFRONT (ACCOUNT DASHBOARD STYLE VIEW) ─────────────

interface SellerStorefrontViewProps {
  sellerName: string;
  allListings: Listing[];
  onBack: () => void;
  onAddToCart: (listing: Listing, qty: number) => void;
  onToggleFavorite: (listingId: string, sellerName: string) => void;
  isFavorite: (listingId: string) => boolean;
}

function SellerStorefrontView({
  sellerName,
  allListings,
  onBack,
  onAddToCart,
  onToggleFavorite,
  isFavorite,
}: SellerStorefrontViewProps) {
  const [activeTab, setActiveTab] = useState<'listings' | 'about' | 'reviews'>('listings');
  const [sellerSearchQuery, setSellerSearchQuery] = useState('');
  const [sellerSortBy, setSellerSortBy] = useState<'price_asc' | 'price_desc' | 'discount_desc' | 'skt_asc'>('price_asc');
  const [quantityMap, setQuantityMap] = useState<Record<string, number>>({});

  const sellerListings = useMemo(() => {
    return allListings.filter(
      (l) => l.sellerName.toLowerCase() === sellerName.toLowerCase() && l.status === 'approved'
    );
  }, [allListings, sellerName]);

  const firstListing = sellerListings[0];
  const rating = firstListing?.sellerRating ?? 9.8;
  const city = firstListing?.sellerCity ?? 'Kadıköy / İstanbul';
  const isVerified = firstListing?.isVerifiedSeller ?? true;
  const isPremium = firstListing?.isPremiumSeller ?? true;



  const filteredListings = useMemo(() => {
    let items = sellerListings;

    if (sellerSearchQuery.trim()) {
      const q = sellerSearchQuery.toLowerCase().trim();
      items = items.filter((l) => (l.productName || '').toLowerCase().includes(q) || (l.category || '').toLowerCase().includes(q));
    }

    if (sellerSortBy === 'price_asc') {
      items = [...items].sort((a, b) => a.unitPrice - b.unitPrice);
    } else if (sellerSortBy === 'price_desc') {
      items = [...items].sort((a, b) => b.unitPrice - a.unitPrice);
    } else if (sellerSortBy === 'discount_desc') {
      items = [...items].sort((a, b) => b.discountPercentage - a.discountPercentage);
    } else if (sellerSortBy === 'skt_asc') {
      items = [...items].sort((a, b) => a.skt.localeCompare(b.skt));
    }

    return items;
  }, [sellerListings, sellerSearchQuery, sellerSortBy]);

  const handleQtyChange = (listingId: string, delta: number, minQty: number = 1) => {
    setQuantityMap((prev) => {
      const current = prev[listingId] !== undefined ? prev[listingId] : minQty;
      return { ...prev, [listingId]: Math.max(minQty, current + delta) };
    });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6 font-sans">
      {/* BREADCRUMB & BACK BUTTON */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-extrabold text-gray-700 shadow-xs hover:bg-gray-100 transition cursor-pointer"
        >
          ← Pazaryerine Dön
        </button>
        <span className="text-xs font-semibold text-gray-500">
          🏥 Eczane Mağazası Profil Detayı
        </span>
      </div>

      {/* FULL-WIDTH ACCOUNT DASHBOARD STYLE BANNER */}
      <div className="relative overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl">
        {/* Glow Effects */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-white shadow-2xl backdrop-blur-md">
              <Store size={38} className="text-orange-400" />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{sellerName}</h1>
                {isVerified ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck size={14} /> Onaylı Eczane
                  </span>
                ) : null}
                {isPremium ? (
                  <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-black text-amber-300 border border-amber-400/30">
                    ⭐ Premium B2B Mağaza
                  </span>
                ) : null}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 font-medium flex flex-wrap items-center gap-2">
                <span>📍 {city}</span>
                <span>•</span>
                <span className="text-orange-400 font-bold">Türkiye Eczacılar Birliği Anlaşmalı B2B Mağazası</span>
              </p>
            </div>
          </div>

          {/* STATS STRIP */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col items-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 border border-emerald-400/40 text-white px-5 py-3 shadow-xl">
              <span className="text-2xl font-black tabular-nums">★ {rating.toFixed(1)}</span>
              <span className="text-[10px] font-extrabold opacity-95 uppercase tracking-wider">Eczane Puanı</span>
            </div>
            <div className="flex flex-col items-center rounded-2xl bg-white/10 border border-white/20 text-white px-5 py-3 backdrop-blur-md shadow-lg">
              <span className="text-2xl font-black tabular-nums">{sellerListings.length}</span>
              <span className="text-[10px] font-extrabold opacity-95 uppercase tracking-wider">Aktif İlan</span>
            </div>
            <div className="flex flex-col items-center rounded-2xl bg-white/10 border border-white/20 text-white px-5 py-3 backdrop-blur-md shadow-lg">
              <span className="text-2xl font-black tabular-nums text-emerald-400">%99.4</span>
              <span className="text-[10px] font-extrabold opacity-95 uppercase tracking-wider">Sipariş Başarısı</span>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD STYLE TABS */}
      <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'listings', label: `📦 Eczanenin Tüm İlanları (${sellerListings.length})` },
            { id: 'about', label: '🏥 Eczane Hakkında & İletişim' },
            { id: 'reviews', label: '⭐ Değerlendirmeler & Yorumlar' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`shrink-0 rounded-xl px-5 py-3 text-xs font-black transition cursor-pointer ${
                activeTab === t.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: LISTINGS VIEW */}
      {activeTab === 'listings' ? (
        <div className="space-y-4">
          {/* SEARCH & SORT BAR */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="relative md:col-span-8">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={sellerSearchQuery}
                onChange={(e) => setSellerSearchQuery(e.target.value)}
                placeholder={`${sellerName} mağazasının ilanlarında ara...`}
                className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-9 text-xs outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-medium"
              />
              {sellerSearchQuery ? (
                <button onClick={() => setSellerSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              ) : null}
            </div>

            <div className="md:col-span-4">
              <select
                value={sellerSortBy}
                onChange={(e) => setSellerSortBy(e.target.value as any)}
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 px-3 text-xs font-bold text-gray-700 outline-none focus:border-orange-500"
              >
                <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
                <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
                <option value="discount_desc">En Yüksek İskonto (%60+)</option>
                <option value="skt_asc">SKT: En Yakın Miad</option>
              </select>
            </div>
          </div>

          {/* LISTINGS CONTAINER */}
          <div className="space-y-4">
            {filteredListings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <Info className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                <h4 className="text-base font-bold text-gray-700">Bu eczaneye ait ilan bulunamadı</h4>
                <p className="mt-1 text-xs text-gray-500">Arama teriminizi değiştirerek tekrar deneyebilirsiniz.</p>
              </div>
            ) : (
              filteredListings.map((listing) => {
                const product = MOCK_PRODUCTS.find((p) => p.id === listing.productId);
                const productName = product?.name || listing.productName || 'İlaç Teklifi';
                const psfPrice = product?.psf || listing.unitPrice * 2.5;
                const minQty = listing.minOrderQty || 1;
                const currentQty = quantityMap[listing.id] !== undefined ? quantityMap[listing.id] : minQty;
                const isFav = isFavorite(listing.id);
                const sktYear = parseInt(listing.skt.split('/')[1] || '2028', 10);
                const isYakınMiad = sktYear <= 2027 || listing.skt.includes('2026');

                return (
                  <div
                    key={listing.id}
                    className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:border-orange-300 hover:shadow-md transition duration-200"
                  >
                    {/* LEFT DETAILS */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {listing.isSponsored ? (
                          <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs">
                            ⭐ Sponsorlu İlan
                          </span>
                        ) : null}
                        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold text-orange-800">
                          %{listing.discountPercentage.toFixed(0)} İskonto
                        </span>
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${isYakınMiad ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-700'}`}>
                          SKT: {listing.skt}
                        </span>
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700">
                          Stok: {listing.stock} Kutu
                        </span>
                        {listing.mfRatio !== 'Yok' ? (
                          <span className="rounded-md bg-purple-50 text-purple-700 px-2 py-0.5 text-[10px] font-bold border border-purple-200">
                            MF: {listing.mfRatio}
                          </span>
                        ) : null}
                      </div>

                      <h4 className="font-extrabold text-base text-gray-900 leading-snug">
                        {productName}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-gray-500 pt-0.5">
                        <span className="font-semibold text-gray-700">Kategori: {listing.category || 'Medikal'}</span>
                        <span className="text-[10px] font-medium text-gray-400">
                          {listing.deliveryType === 'today' ? '🚀 Aynı Gün Kargo' : '📦 24s Kargo'}
                        </span>
                      </div>
                    </div>

                    {/* RIGHT PRICING & ACTIONS */}
                    <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0 shrink-0">
                      <div className="text-left md:text-right">
                        <span className="text-[11px] text-gray-400 block line-through">PSF: {psfPrice.toFixed(2)} TL</span>
                        <span className="text-2xl font-black text-orange-600 tracking-tight block">{listing.unitPrice.toFixed(2)} TL</span>
                        <span className="text-[10px] font-bold text-gray-400">Min. {minQty} Adet</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(listing.id, -1, minQty)}
                            className="px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-l-xl"
                          >
                            -
                          </button>
                          <span className="px-2.5 text-xs font-extrabold text-gray-900">{currentQty}</span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(listing.id, 1, minQty)}
                            className="px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-r-xl"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onAddToCart(listing, currentQty)}
                          className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-xs font-black text-white shadow-md transition active:scale-95 cursor-pointer"
                        >
                          <ShoppingCart size={16} />
                          Sepete Ekle
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleFavorite(listing.id, sellerName)}
                          className="p-2 text-gray-300 hover:text-red-500 transition cursor-pointer"
                        >
                          <Heart size={20} className={isFav ? 'fill-red-500 text-red-500' : ''} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : activeTab === 'about' ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs space-y-4 text-xs text-gray-700">
          <h3 className="text-base font-extrabold text-gray-900">Eczane Kurumsal & Doğrulama Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <span className="text-gray-400 font-bold block mb-1">Eczane Unvanı</span>
              <span className="font-extrabold text-sm text-gray-900">{sellerName}</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <span className="text-gray-400 font-bold block mb-1">Konum & Şehir</span>
              <span className="font-extrabold text-sm text-gray-900">{city}</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <span className="text-gray-400 font-bold block mb-1">Doğrulama Durumu</span>
              <span className="font-extrabold text-sm text-green-600">✓ Türkiye Eczacılar Birliği Onaylı</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <span className="text-gray-400 font-bold block mb-1">Teslimat Yetkinliği</span>
              <span className="font-extrabold text-sm text-gray-900">Aynı Gün Kurye & 24 Saat Kargo</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xs">
          <Star className="mx-auto mb-2 text-amber-400" size={32} />
          <h4 className="font-extrabold text-sm text-gray-900">{sellerName} Değerlendirmeleri</h4>
          <p className="text-xs text-gray-500 mt-1">Bu eczaneden alışveriş yapan eczacıların %99.4'ü memnun kaldı.</p>
        </div>
      )}
    </main>
  );
}

// ─── MAIN PRODUCT PANEL ──────────────────────────────────────────────────────

export default function ProductPanel() {
  const layout = useLayoutContext();
  const navigate = useNavigate();
  const { categorySlug, sellerSlug } = useParams<{ categorySlug?: string; sellerSlug?: string }>();
  const [searchParams] = useSearchParams();

  const rawCatParam = searchParams.get('category');
  const categoryParam = useMemo(() => {
    if (categorySlug) {
      return slugToCategory(categorySlug);
    }
    return rawCatParam && rawCatParam !== 'undefined' ? rawCatParam : null;
  }, [categorySlug, rawCatParam]);

  const searchQueryParam = (searchParams.get('q') || searchParams.get('search') || '').trim();

  const rawSellerParam = searchParams.get('seller');
  const sellerParam = useMemo(() => {
    if (sellerSlug) {
      const found = layout.allListings.find(
        (l) => sellerToSlug(l.sellerName) === sellerSlug,
      );
      if (found) return found.sellerName;
      return sellerSlug.replace(/-/g, ' ');
    }
    return rawSellerParam ? decodeURIComponent(rawSellerParam) : null;
  }, [sellerSlug, rawSellerParam, layout.allListings]);

  const [activeCategory, setActiveCategory] = useState<string>(categoryParam || '');

  // Sync activeCategory ONLY when categoryParam in URL changes
  useEffect(() => {
    if (categoryParam !== null && categoryParam !== activeCategory) {
      setActiveCategory(categoryParam);
      const match = MOCK_PRODUCTS.find((p) => p.category === categoryParam);
      if (match) setSelectedProduct(match);
    } else if (categoryParam === null && activeCategory !== '') {
      setActiveCategory('');
    }
  }, [categoryParam]);

  const handleCategoryChange = (category: string) => {
    const safeCat = category && category !== 'undefined' ? category : '';
    setActiveCategory(safeCat);
    if (safeCat) {
      navigate(`/kategori/${categoryToSlug(safeCat)}`);
      const match = MOCK_PRODUCTS.find((p) => p.category === safeCat);
      if (match) setSelectedProduct(match);
    } else {
      navigate('/products');
    }
  };

  const handleSelectSeller = (sellerName: string) => {
    navigate(`/magaza/${sellerToSlug(sellerName)}`);
  };

  const handleBackFromSeller = () => {
    navigate('/products');
  };

  // Check if we are on Homepage vs Category Page vs Seller Storefront Page
  const isHomepage = (!activeCategory || activeCategory === '') && !searchQueryParam && !sellerParam;

  // Computed: Products belonging ONLY to the active category (or all if none selected)
  const categoryProducts = useMemo(() => {
    if (!activeCategory) return MOCK_PRODUCTS;
    const filtered = MOCK_PRODUCTS.filter((p) => p.category === activeCategory);
    return filtered.length > 0 ? filtered : MOCK_PRODUCTS;
  }, [activeCategory]);

  const initialProduct = useMemo(() => {
    if (searchQueryParam) {
      const q = searchQueryParam.toLowerCase();
      const match = MOCK_PRODUCTS.find(
        (p) => p.name.toLowerCase().includes(q) || p.barcode.includes(q)
      );
      if (match) return match;
    }
    if (categoryParam) {
      const match = MOCK_PRODUCTS.find((p) => p.category === categoryParam);
      if (match) return match;
    }
    return MOCK_PRODUCTS[0];
  }, [categoryParam, searchQueryParam]);

  // Product state
  const [selectedProduct, setSelectedProduct] = useState<Product>(initialProduct);

  // Sync searchParam matching product if URL query changes
  useEffect(() => {
    if (searchQueryParam) {
      const q = searchQueryParam.toLowerCase();
      const match = MOCK_PRODUCTS.find(
        (p) => p.name.toLowerCase().includes(q) || p.barcode.includes(q)
      );
      if (match) {
        setSelectedProduct(match);
      }
    }
  }, [searchQueryParam]);

  // Ensure selectedProduct belongs to activeCategory if category is filtered
  useEffect(() => {
    if (activeCategory && categoryProducts.length > 0 && selectedProduct.category !== activeCategory) {
      const match = categoryProducts.find((p) => p.category === activeCategory);
      if (match) setSelectedProduct(match);
    }
  }, [activeCategory, categoryProducts, selectedProduct.category]);

  // Listings state (Connected to global LayoutContext)
  const listings = layout.allListings;

  // Fırsat & Yakın Miad Listings (%60+ discount or SKT close items)
  const allFirsatListings = useMemo(() => {
    return listings.filter((item) => {
      if (item.status === 'pending') return false;
      const isHighDiscount = item.discountPercentage >= 60;
      const sktYear = parseInt(item.skt.split('/')[1] || '2028', 10);
      const isCloseExpiry = sktYear <= 2027 || item.skt.includes('2026');
      return isHighDiscount || isCloseExpiry;
    });
  }, [listings]);

  // Vitrin Tabs state
  const [vitrinTab, setVitrinTab] = useState<'all' | 'yakin' | 'coksatan' | 'yeni'>('all');

  const displayedFirsatListings = useMemo(() => {
    if (vitrinTab === 'yakin') {
      return allFirsatListings.filter((l) => {
        const yr = parseInt(l.skt.split('/')[1] || '2028', 10);
        return yr <= 2027 || l.skt.includes('2026');
      });
    }
    if (vitrinTab === 'coksatan') {
      return allFirsatListings.filter((l) => l.isSponsored || l.discountPercentage >= 65);
    }
    if (vitrinTab === 'yeni') {
      return allFirsatListings.filter((l) => l.isNewListing);
    }
    return allFirsatListings;
  }, [allFirsatListings, vitrinTab]);

  // Classic Category Page Filter states
  const [filterTodayDelivery, setFilterTodayDelivery] = useState(false);
  const [filter24hDelivery, setFilter24hDelivery] = useState(false);
  const [filterNewListings, setFilterNewListings] = useState(false);
  const [filterDiscountedListings, setFilterDiscountedListings] = useState(false);
  const [filterVerifiedSeller, setFilterVerifiedSeller] = useState(false);
  const [filterPremiumSeller, setFilterPremiumSeller] = useState(false);
  const [categorySortBy, setCategorySortBy] = useState<'price_asc' | 'price_desc' | 'skt_desc' | 'discount_desc'>('price_asc');

  // Quantities for listings
  const [quantityMap, setQuantityMap] = useState<Record<string, number>>({});

  // Fırsat Vitrini Carousel Ref & Handlers
  const firsatCarouselRef = useRef<HTMLDivElement>(null);
  const scrollFirsatLeft = () => firsatCarouselRef.current?.scrollBy({ left: -340, behavior: 'smooth' });
  const scrollFirsatRight = () => firsatCarouselRef.current?.scrollBy({ left: 340, behavior: 'smooth' });

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleLike = (listingId: string, sellerName: string) => {
    const isFav = layout.isFavorite(listingId);
    layout.toggleFavorite(listingId);
    setToastMessage(isFav ? `${sellerName} teklifi favorilerden çıkarıldı.` : `${sellerName} teklifi favorilere eklendi!`);
  };

  const ratingBadgeClass = (rating: number): string => {
    if (rating >= 8.5) return 'bg-green-500 text-white';
    if (rating >= 7.0) return 'bg-yellow-400 text-gray-900';
    return 'bg-red-500 text-white';
  };

  // Premium Advertising Purchase Modal State
  const [isBuyAdModalOpen, setIsBuyAdModalOpen] = useState(false);
  const [selectedAdPackage, setSelectedAdPackage] = useState<AdPackage>(MOCK_AD_PACKAGES[1]);

  // Sync Header Search Suggestions & Select Handlers with LayoutContext
  useEffect(() => {
    const productSuggestions = MOCK_PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      barcode: p.barcode,
      category: p.category,
      psf: p.psf,
    }));
    layout.setSearchSuggestions(productSuggestions);

    layout.setOnSelectSuggestion((productId: string) => {
      const match = MOCK_PRODUCTS.find((p) => p.id === productId);
      if (match) {
        setSelectedProduct(match);
        if (match.category) {
          handleCategoryChange(match.category);
        }
      }
    });

    const sellerMap = new Map<string, { rating: number; count: number; city: string }>();
    listings.forEach((l) => {
      if (!sellerMap.has(l.sellerName)) {
        sellerMap.set(l.sellerName, {
          rating: l.sellerRating || 9.8,
          count: 1,
          city: l.sellerCity || 'İstanbul',
        });
      } else {
        const existing = sellerMap.get(l.sellerName)!;
        existing.count += 1;
      }
    });

    const sellerSuggestions = Array.from(sellerMap.entries()).map(([name, data]) => ({
      sellerName: name,
      sellerRating: data.rating,
      sellerListingCount: data.count,
      sellerCity: data.city,
    }));
    layout.setSellerSuggestions(sellerSuggestions);

    layout.setOnSelectSeller((sellerName: string) => {
      handleSelectSeller(sellerName);
    });
  }, [listings]);

  // Listings for current product in Category View filtered & sorted with SPONSORED HIGHEST PRIORITY
  const currentProductListings = useMemo(() => {
    const searchQ = searchQueryParam.toLowerCase().trim();

    let candidateListings = listings.filter((item) => item.status !== 'pending');

    if (searchQ) {
      candidateListings = candidateListings.filter((item) => {
        const prodName = item.productName || '';
        return (
          prodName.toLowerCase().includes(searchQ) ||
          item.sellerName.toLowerCase().includes(searchQ) ||
          (item.category || '').toLowerCase().includes(searchQ)
        );
      });
    } else {
      const exactMatches = listings.filter((item) => item.productId === selectedProduct.id);
      candidateListings = exactMatches.length > 0
        ? exactMatches
        : (activeCategory ? listings.filter((item) => item.category === activeCategory) : listings);
    }

    return candidateListings
      .filter((item) => {
        if (filterTodayDelivery && item.deliveryType !== 'today') return false;
        if (filter24hDelivery && item.deliveryType !== '24h') return false;
        if (filterNewListings && !item.isNewListing) return false;
        if (filterDiscountedListings && !item.isDiscounted) return false;
        if (filterVerifiedSeller && !item.isVerifiedSeller) return false;
        if (filterPremiumSeller && !item.isPremiumSeller && !item.isSponsored) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.isSponsored && !b.isSponsored) return -1;
        if (!a.isSponsored && b.isSponsored) return 1;

        if (categorySortBy === 'price_asc') return a.unitPrice - b.unitPrice;
        if (categorySortBy === 'price_desc') return b.unitPrice - a.unitPrice;
        if (categorySortBy === 'discount_desc') return b.discountPercentage - a.discountPercentage;
        if (categorySortBy === 'skt_desc') return b.skt.localeCompare(a.skt);
        return 0;
      });
  }, [
    listings,
    selectedProduct.id,
    activeCategory,
    searchQueryParam,
    filterTodayDelivery,
    filter24hDelivery,
    filterNewListings,
    filterDiscountedListings,
    filterVerifiedSeller,
    filterPremiumSeller,
    categorySortBy,
  ]);

  const handleQuantityChange = (listingId: string, delta: number, minQty: number = 1) => {
    setQuantityMap((prev) => {
      const current = prev[listingId] !== undefined ? prev[listingId] : minQty;
      const updated = Math.max(minQty, current + delta);
      return { ...prev, [listingId]: updated };
    });
  };

  const handleAddToCart = (listing: Listing, qty?: number) => {
    const minQty = listing.minOrderQty || 1;
    const finalQty = qty || (quantityMap[listing.id] !== undefined ? quantityMap[listing.id] : minQty);
    layout.addToCart({
      listingId: listing.id,
      productId: listing.productId || selectedProduct.id,
      productName: listing.productName || selectedProduct.name,
      sellerName: listing.sellerName,
      unitPrice: listing.unitPrice,
      quantity: finalQty,
      minOrderQty: minQty,
      skt: listing.skt,
      deliveryType: listing.deliveryType,
    });
  };

  const handlePurchaseAdPackage = (e: React.FormEvent) => {
    e.preventDefault();
    const targetListing = listings.find(
      (l) => l.productId === selectedProduct.id
    ) || currentProductListings[0];

    if (!targetListing) {
      alert('Lütfen reklam verilecek ilanı seçiniz.');
      return;
    }

    layout.updateListing(targetListing.id, {
      isSponsored: true,
      isPremiumSeller: true,
      sponsoredDays: selectedAdPackage.days,
    });

    setIsBuyAdModalOpen(false);
    setToastMessage(
      `⭐ TEBRİKLER! ${targetListing.sellerName} teklifi ${selectedAdPackage.name} (${selectedAdPackage.price} TL) ile en üst sıraya sabitlendi.`
    );
  };

  const handleClearFilters = () => {
    setFilterTodayDelivery(false);
    setFilter24hDelivery(false);
    setFilterNewListings(false);
    setFilterDiscountedListings(false);
    setFilterVerifiedSeller(false);
    setFilterPremiumSeller(false);
  };

  const activeFilterCount = [
    filterTodayDelivery,
    filter24hDelivery,
    filterNewListings,
    filterDiscountedListings,
    filterVerifiedSeller,
    filterPremiumSeller,
  ].filter(Boolean).length;

  useEffect(() => {
    const timer = setTimeout(() => {
      layout.setOnAddListingClick(() => layout.openAddListing());
      layout.setOnCategoryClick((category: string) => {
        handleCategoryChange(category);
      });
    }, 0);

    return () => {
      clearTimeout(timer);
      layout.setOnCategoryClick(undefined);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      layout.setActiveCategory(activeCategory);
    }, 0);
    return () => clearTimeout(timer);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-16 font-sans">
      {toastMessage ? <Toast message={toastMessage} onClose={() => setToastMessage(null)} /> : null}

      {/* AD PACKAGE MODAL */}
      {isBuyAdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <Sparkles className="text-amber-500" size={20} />
                Sponsorlu Reklam Paketi Al
              </h3>
              <button onClick={() => setIsBuyAdModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePurchaseAdPackage} className="space-y-4">
              <div className="space-y-2">
                {MOCK_AD_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedAdPackage(pkg)}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      selectedAdPackage.id === pkg.id
                        ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-200'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-sm text-gray-900 block">{pkg.name}</span>
                        <span className="text-xs text-orange-600 font-bold">{pkg.badgeText}</span>
                      </div>
                      <span className="text-base font-black text-gray-900">{pkg.price} TL</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsBuyAdModalOpen(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2 text-xs font-black text-white shadow-lg"
                >
                  Ödemeyi Onayla & Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────
          STATE 1: SELLER STOREFRONT VIEW (Eczane Seçildiğinde Tam Sayfa Görünümü)
          ──────────────────────────────────────────────────────────────────────── */}
      {sellerParam ? (
        <SellerStorefrontView
          sellerName={sellerParam}
          allListings={listings}
          onBack={handleBackFromSeller}
          onAddToCart={handleAddToCart}
          onToggleFavorite={toggleLike}
          isFavorite={(id) => layout.isFavorite(id)}
        />
      ) : isHomepage ? (
        /* ────────────────────────────────────────────────────────────────────────
            STATE 2: HOMEPAGE VIEW (Hero Banner + Sekmeli Vitrin + Son İnceledikleriniz + Kategori Kartları)
            ──────────────────────────────────────────────────────────────────────── */
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-8">

          {/* 1. HERO BANNER SLIDER (OTOMATİK DÖNEN KAMPANYA SLIDER'I) */}
          <HeroBannerSlider />

          {/* 2. 🔥 FİRSAT & SEKMELİ VİTRİN SLIDER CAROUSEL */}
          <div className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50/90 via-white to-amber-50/60 p-6 shadow-xl shadow-orange-500/5">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-orange-100 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-red-500 text-white shadow-lg shadow-orange-500/30">
                  <Flame size={26} className="animate-bounce" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">
                      Fırsat & Vitrin Ürünleri
                    </h2>
                    <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-black text-white shadow-xs">
                      {displayedFirsatListings.length} Teklif
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium mt-0.5">
                    Tüm kategorilerden avantajlı teklifler. Sekmeler ile filtreleyebilirsiniz!
                  </p>
                </div>
              </div>

              {/* SEKMELİ VİTRİN (TABS) & CAROUSEL NAVIGATION BUTTONS */}
              <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
                <div className="flex items-center gap-1 rounded-xl bg-orange-100/70 p-1 border border-orange-200/80">
                  {[
                    { id: 'all', label: '🔥 Tüm Fırsatlar' },
                    { id: 'yakin', label: '⏳ Yakın Miad' },
                    { id: 'coksatan', label: '⭐ Çok Satanlar' },
                    { id: 'yeni', label: '✨ Yeni Eklenenler' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setVitrinTab(tab.id as any)}
                      className={`rounded-lg px-3 py-1 text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
                        vitrinTab === tab.id
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'text-orange-950 hover:bg-orange-200/50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={scrollFirsatLeft}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-600 shadow-md transition hover:bg-orange-500 hover:text-white hover:border-orange-500 active:scale-95 cursor-pointer"
                    title="Önceki Fırsatlar"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={scrollFirsatRight}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-600 shadow-md transition hover:bg-orange-500 hover:text-white hover:border-orange-500 active:scale-95 cursor-pointer"
                    title="Sonraki Fırsatlar"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* HORIZONTAL CAROUSEL CONTAINER */}
            <div
              ref={firsatCarouselRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-3 pt-1 scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {displayedFirsatListings.map((listing) => {
                const product = MOCK_PRODUCTS.find((p) => p.id === listing.productId);
                const productName = product?.name || listing.productName || 'Fırsat İlacı';
                const psfPrice = product?.psf || listing.unitPrice * 3;
                const minQty = listing.minOrderQty || 1;
                const currentQty = quantityMap[listing.id] !== undefined ? quantityMap[listing.id] : minQty;
                const isFav = layout.isFavorite(listing.id);
                const sktYear = parseInt(listing.skt.split('/')[1] || '2028', 10);
                const isYakınMiad = sktYear <= 2027 || listing.skt.includes('2026');

                return (
                  <div
                    key={`carousel-${listing.id}`}
                    className="group relative flex w-72 shrink-0 flex-col justify-between rounded-2xl border border-orange-100 bg-white p-4 shadow-sm transition hover:border-orange-400 hover:shadow-xl"
                  >
                    <div>
                      <div className="mb-2.5 flex items-center justify-between">
                        {listing.discountPercentage >= 60 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-red-600 to-orange-600 px-2.5 py-1 text-[11px] font-black text-white shadow-xs">
                            🔥 %{listing.discountPercentage.toFixed(0)} İSKONTO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-black text-white shadow-xs">
                            ⏳ YAKIN MİAD
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleLike(listing.id, listing.sellerName)}
                          className="text-gray-300 hover:text-red-500 transition cursor-pointer"
                        >
                          <Heart size={16} className={isFav ? 'fill-red-500 text-red-500' : ''} />
                        </button>
                      </div>

                      <div className="mb-1.5 flex flex-wrap items-center gap-1 text-[10px]">
                        <span className="rounded bg-purple-50 px-2 py-0.5 font-bold text-purple-700">
                          {listing.category || product?.category || 'Kategori'}
                        </span>
                        <span className={`rounded px-1.5 py-0.5 font-bold ${isYakınMiad ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-800'}`}>
                          SKT: {listing.skt}
                        </span>
                        {listing.mfRatio !== 'Yok' ? (
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700 border border-emerald-200">
                            MF: {listing.mfRatio}
                          </span>
                        ) : null}
                      </div>

                      <h3
                        onClick={() => {
                          if (product) setSelectedProduct(product);
                        }}
                        className="font-extrabold text-sm text-gray-900 line-clamp-2 h-10 cursor-pointer hover:text-orange-600 transition"
                        title={productName}
                      >
                        {productName}
                      </h3>

                      <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-500">
                        <button
                          type="button"
                          onClick={() => handleSelectSeller(listing.sellerName)}
                          className="truncate font-semibold text-gray-700 hover:text-orange-600 transition text-left"
                        >
                          🏥 {listing.sellerName}
                        </button>
                        {listing.sellerRating ? (
                          <span className="shrink-0 rounded bg-green-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                            ★ {listing.sellerRating.toFixed(1)}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-3 border-t border-orange-100 pt-3">
                      <div className="mb-2 flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 block line-through">PSF: {psfPrice.toFixed(2)} TL</span>
                          <span className="text-lg font-black text-orange-600 tracking-tight">{listing.unitPrice.toFixed(2)} TL</span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">Stok: <b className="text-gray-900">{listing.stock} Kutu</b></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50">
                          <button type="button" onClick={() => handleQuantityChange(listing.id, -1, minQty)} className="px-2 py-1 text-xs font-bold text-gray-600 hover:bg-gray-200">-</button>
                          <span className="px-2 text-xs font-bold text-gray-800">{currentQty}</span>
                          <button type="button" onClick={() => handleQuantityChange(listing.id, 1, minQty)} className="px-2 py-1 text-xs font-bold text-gray-600 hover:bg-gray-200">+</button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddToCart(listing)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-3 py-2 text-xs font-black text-white shadow-sm transition active:scale-95 cursor-pointer"
                        >
                          <ShoppingCart size={14} />
                          Sepete Ekle
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. SON İNCELEDİĞİNİZ ÜRÜNLER (LOCAL STORAGE) */}
          <RecentlyViewedProducts
            onAddToCart={handleAddToCart}
            onToggleFavorite={toggleLike}
            isFavorite={(id) => layout.isFavorite(id)}
          />

          {/* 4. PAZARYERİ KATEGORİLERİ (GÖRSEL KART TASARIMI GRID) */}
          <div className="space-y-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-3">
              <div>
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
                  <Store className="text-orange-500" size={24} />
                  Pazaryeri Kategorilerimizi Keşfedin
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Aradığınız ilacı bulmak için kategorilere tıklayın ve özel B2B fiyatları inceleyin.
                </p>
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200 self-start sm:self-auto">
                8 Ana Kategori
              </span>
            </div>

            {/* CATEGORY CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {HOMEPAGE_CATEGORIES.map((cat) => (
                <div
                  key={cat.name}
                  onClick={() => handleCategoryChange(cat.name)}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br ${cat.color} p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${cat.borderColor} cursor-pointer`}
                >
                  <div>
                    {/* ICON & BADGE */}
                    <div className="mb-4 flex items-center justify-between">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-md group-hover:scale-110 transition duration-300">
                        {cat.icon}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-extrabold shadow-xs ${cat.badgeBg}`}>
                        {cat.badge}
                      </span>
                    </div>

                    {/* NAME & DESC */}
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-orange-600 transition">
                      {cat.name}
                    </h3>
                    <p className="mt-2 text-xs text-gray-600 font-medium leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>

                  {/* ACTION LINK */}
                  <div className="mt-5 flex items-center justify-between border-t border-gray-200/60 pt-3 text-xs font-black text-orange-600 group-hover:text-orange-700">
                    <span>Kategoriyi İncele</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-orange-600 shadow-sm group-hover:translate-x-1 group-hover:bg-orange-500 group-hover:text-white transition">
                      →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      ) : (
        /* ────────────────────────────────────────────────────────────────────────
            STATE 3: CATEGORY VIEW (Menüden Kategoriye Tıklanınca Açılan Klasik Düzen)
            ──────────────────────────────────────────────────────────────────────── */
        <main className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:flex-row">
          
          {/* LEFT SIDEBAR: SELECTED PRODUCT & FILTERS (ESKİ KLASİK YAN MENÜ) */}
          <aside className="w-full lg:w-1/4">
            <div className="sticky top-20 space-y-6">
              
              {/* SELECTED PRODUCT CARD */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
                <div className="relative mb-4 flex h-44 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gradient-to-br from-orange-50 to-purple-50 p-4">
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-white text-orange-500 shadow-md">
                      <Store size={28} />
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{selectedProduct.category}</span>
                  </div>
                  <span className="absolute left-3 top-3 rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold text-orange-800">
                    {selectedProduct.manufacturer}
                  </span>
                </div>

                <h2 className="text-lg font-extrabold text-gray-900">{selectedProduct.name}</h2>
                <div className="mt-2 flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-xs font-semibold text-gray-500">Perakende Satış Fiyatı (PSF)</span>
                  <span className="text-base font-extrabold text-orange-600">{selectedProduct.psf.toFixed(2)} TL</span>
                </div>
                <div className="mt-3 space-y-1 text-xs text-gray-500">
                  <p><span className="font-semibold text-gray-700">Barkod:</span> {selectedProduct.barcode}</p>
                  <p>{selectedProduct.description}</p>
                </div>

                {/* QUICK SELECT PRODUCTS WITHIN ACTIVE CATEGORY */}
                <div className="mt-4 border-t border-gray-100 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-900">
                      Ürün Filtresi ({categoryProducts.length} Çeşit):
                    </label>
                  </div>

                  <select
                    className="w-full rounded-xl border border-gray-300 bg-white p-2.5 text-xs font-bold text-gray-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 shadow-xs"
                    value={selectedProduct.id}
                    onChange={(e) => {
                      const val = e.target.value;
                      const match = categoryProducts.find((p) => p.id === val);
                      if (match) setSelectedProduct(match);
                    }}
                  >
                    {categoryProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (PSF: {p.psf.toFixed(2)} TL)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* REKLAM BANNER PROMO IN SIDEBAR */}
              <div className="rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 p-4 text-white shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Award size={20} className="text-yellow-200" />
                  <h4 className="font-extrabold text-sm">İlanınızı Reklam İle Öne Çıkarın!</h4>
                </div>
                <p className="text-xs text-amber-100 mb-3">
                  İlanınız en üst sırada <b>"Sponsorlu Premium İlan"</b> rozetiyle gösterilsin.
                </p>
                <button
                  onClick={() => setIsBuyAdModalOpen(true)}
                  className="w-full rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-orange-600 shadow hover:bg-amber-50 cursor-pointer"
                >
                  Reklam Paketlerini İncele (₺19.90'dan)
                </button>
              </div>

              {/* FILTERS CARD */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
                    <Filter size={18} className="text-orange-500" />
                    Filtreler
                  </h3>
                  {activeFilterCount > 0 ? (
                    <button
                      onClick={handleClearFilters}
                      className="text-xs font-semibold text-purple-700 hover:text-purple-900"
                    >
                      Temizle ({activeFilterCount})
                    </button>
                  ) : null}
                </div>

                {/* TESLİMAT FILTERS */}
                <div className="mb-4 border-b border-gray-100 pb-4 space-y-2 text-xs text-gray-700">
                  <p className="font-bold uppercase text-gray-400">Teslimat</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={filterTodayDelivery} onChange={(e) => setFilterTodayDelivery(e.target.checked)} className="rounded text-orange-500" />
                    <span>Bugün teslimat</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={filter24hDelivery} onChange={(e) => setFilter24hDelivery(e.target.checked)} className="rounded text-orange-500" />
                    <span>24 saat içinde</span>
                  </label>
                </div>

                {/* İLAN FILTERS */}
                <div className="mb-4 border-b border-gray-100 pb-4 space-y-2 text-xs text-gray-700">
                  <p className="font-bold uppercase text-gray-400">İlan Türü</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={filterNewListings} onChange={(e) => setFilterNewListings(e.target.checked)} className="rounded text-orange-500" />
                    <span>Yeni ilanlar</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={filterDiscountedListings} onChange={(e) => setFilterDiscountedListings(e.target.checked)} className="rounded text-orange-500" />
                    <span>İndirimli ilanlar</span>
                  </label>
                </div>

                {/* SATICI FILTERS */}
                <div className="space-y-2 text-xs text-gray-700">
                  <p className="font-bold uppercase text-gray-400">Satıcı Rozeti</p>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={filterVerifiedSeller} onChange={(e) => setFilterVerifiedSeller(e.target.checked)} className="rounded text-orange-500" />
                    <span>Onaylı satıcı</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={filterPremiumSeller} onChange={(e) => setFilterPremiumSeller(e.target.checked)} className="rounded text-orange-500" />
                    <span>⭐ Premium / Sponsorlu satıcı</span>
                  </label>
                </div>
              </div>

            </div>
          </aside>

          {/* RIGHT MAIN LISTINGS SECTION FOR CATEGORY */}
          <section className="w-full space-y-6 lg:w-3/4">

            {/* BANNER PROMO */}
            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-xs md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow">
                  <Clock size={20} />
                </span>
                <div>
                  <p className="font-bold text-sm text-blue-950">
                    Bu ürünü farklı teslimat seçenekleriyle alabileceğinizi biliyor muydunuz?
                  </p>
                  <p className="text-xs text-blue-700">Aynı gün kurye teslimatı yapan eczaneleri filtreleyin.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFilterTodayDelivery(true);
                  setFilter24hDelivery(false);
                }}
                className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-blue-700 cursor-pointer"
              >
                Bugün Teslim İlanları Gör
              </button>
            </div>

            {/* CATEGORY LISTINGS CONTAINER */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-4">
              
              {/* HEADER & SORTING */}
              <div className="flex flex-col gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">
                    {searchQueryParam ? `🔍 "${searchQueryParam}" Arama Sonuçları` : activeCategory ? `${activeCategory} İlanları` : 'Pazaryerindeki Tüm İlaç İlanları'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {selectedProduct.name} için {currentProductListings.length} aktif teklif listeleniyor.
                  </p>
                </div>

                {/* SORT DROPDOWN */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500">Sırala:</span>
                  <select
                    value={categorySortBy}
                    onChange={(e) => setCategorySortBy(e.target.value as any)}
                    className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-xs outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
                    <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
                    <option value="discount_desc">En Yüksek İskonto (%60+)</option>
                    <option value="skt_desc">En Uzak SKT</option>
                  </select>
                </div>
              </div>

              {/* LISTINGS HORIZONTAL ROWS */}
              {currentProductListings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
                  <Info className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                  <h4 className="text-base font-bold text-gray-700">Henüz uygun ilan bulunamadı</h4>
                  <p className="mt-1 text-xs text-gray-500">Seçili filtreleri temizleyerek tüm teklifleri görüntüleyebilirsiniz.</p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow hover:bg-orange-600"
                  >
                    Filtreleri Temizle
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentProductListings.map((listing) => {
                    const product = MOCK_PRODUCTS.find((p) => p.id === listing.productId);
                    const productName = product?.name || listing.productName || 'İlaç Teklifi';
                    const psfPrice = product?.psf || listing.unitPrice * 2.5;
                    const minQty = listing.minOrderQty || 1;
                    const currentQty = quantityMap[listing.id] !== undefined ? quantityMap[listing.id] : minQty;
                    const isFav = layout.isFavorite(listing.id);
                    const sktYear = parseInt(listing.skt.split('/')[1] || '2028', 10);
                    const isYakınMiad = sktYear <= 2027 || listing.skt.includes('2026');

                    return (
                      <div
                        key={listing.id}
                        className={`group relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border p-5 transition duration-200 shadow-xs ${
                          listing.isSponsored
                            ? 'border-amber-300 bg-gradient-to-r from-amber-50/70 via-white to-orange-50/40 ring-1 ring-amber-300'
                            : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
                        }`}
                      >
                        {/* LEFT: PRODUCT & SELLER DETAILS */}
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {listing.isSponsored ? (
                              <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs flex items-center gap-1">
                                ⭐ Sponsorlu İlan
                              </span>
                            ) : null}
                            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold text-orange-800">
                              %{listing.discountPercentage.toFixed(0)} İskonto
                            </span>
                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${isYakınMiad ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-700'}`}>
                              SKT: {listing.skt}
                            </span>
                            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700">
                              Stok: {listing.stock} Kutu
                            </span>
                            {listing.mfRatio !== 'Yok' ? (
                              <span className="rounded-md bg-purple-50 text-purple-700 px-2 py-0.5 text-[10px] font-bold border border-purple-200">
                                MF: {listing.mfRatio}
                              </span>
                            ) : null}
                          </div>

                          <h4 className="font-extrabold text-base text-gray-900 leading-snug">
                            {productName}
                          </h4>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-0.5">
                            <button
                              onClick={() => handleSelectSeller(listing.sellerName)}
                              className="font-bold text-gray-800 hover:text-orange-600 transition flex items-center gap-1 text-left"
                            >
                              🏥 {listing.sellerName}
                            </button>

                            {listing.sellerRating ? (
                              <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-extrabold ${ratingBadgeClass(listing.sellerRating)}`}>
                                ★ {listing.sellerRating.toFixed(1)}
                              </span>
                            ) : null}

                            {listing.isVerifiedSeller ? (
                              <span className="text-[10px] font-semibold text-green-600 flex items-center gap-0.5">
                                <ShieldCheck size={12} /> Onaylı Satıcı
                              </span>
                            ) : null}

                            <span className="text-[10px] font-medium text-gray-400">
                              {listing.deliveryType === 'today' ? '🚀 Bugün Teslimat' : '📦 24s Kargo'}
                            </span>
                          </div>
                        </div>

                        {/* RIGHT: PRICING, QUANTITY STEPPER & CART ACTION */}
                        <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-gray-100 pt-3 md:pt-0 shrink-0">
                          <div className="text-left md:text-right">
                            <span className="text-[11px] text-gray-400 block line-through">PSF: {psfPrice.toFixed(2)} TL</span>
                            <span className="text-2xl font-black text-orange-600 tracking-tight block">{listing.unitPrice.toFixed(2)} TL</span>
                            <span className="text-[10px] font-bold text-gray-400">Min. {minQty} Adet</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(listing.id, -1, minQty)}
                                className="px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-l-xl"
                              >
                                -
                              </button>
                              <span className="px-2.5 text-xs font-extrabold text-gray-900">{currentQty}</span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(listing.id, 1, minQty)}
                                className="px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-r-xl"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddToCart(listing)}
                              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-xs font-black text-white shadow-md transition active:scale-95 cursor-pointer"
                            >
                              <ShoppingCart size={16} />
                              Sepete Ekle
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleLike(listing.id, listing.sellerName)}
                              className="p-2 text-gray-300 hover:text-red-500 transition cursor-pointer"
                              title="Favorilere Ekle"
                            >
                              <Heart size={20} className={isFav ? 'fill-red-500 text-red-500' : ''} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
