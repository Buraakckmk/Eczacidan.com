import { ChevronDown, Heart, Plus, Search, ShieldCheck, ShoppingCart, Store, Trash2, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLayoutContext } from '../src/components/Layout';
import { Toast } from '../src/components/Toast';
import { api } from '../services/api';
import {
  FinancialTransaction,
  Listing,
  MOCK_PRODUCTS,
  MOCK_PURCHASES,
  MOCK_TRANSACTIONS,
  PurchaseOrder,
} from '../src/data/mockData';

type ProfileTab = 'settings' | 'listings' | 'orders' | 'favorites' | 'transactions' | 'reviews' | 'einvoice';
type ListingFilter = 'published' | 'unpublished' | 'pending';

const profileTabs: { id: ProfileTab; label: string }[] = [
  { id: 'settings', label: 'Profilim & Bilgilerim' },
  { id: 'listings', label: 'İlanlarım' },
  { id: 'orders', label: 'Siparişlerim' },
  { id: 'favorites', label: 'Beğendiklerim' },
  { id: 'transactions', label: 'Hesap Hareketlerim' },
  { id: 'reviews', label: 'Puan & Yorumlarım' },
  { id: 'einvoice', label: 'e-Fatura İşlemlerim' },
];

const tabLabels: Record<ProfileTab, string> = {
  settings: 'Profilim & Bilgilerim',
  listings: 'İlanlarım',
  orders: 'Siparişlerim',
  favorites: 'Beğendiklerim',
  transactions: 'Hesap Hareketlerim',
  reviews: 'Puan & Yorumlarım',
  einvoice: 'e-Fatura İşlemlerim',
};

export default function AccountDashboard() {
  const navigate = useNavigate();
  const layout = useLayoutContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as ProfileTab | null;

  const [activeTab, setActiveTab] = useState<ProfileTab>(tabParam || 'settings');

  // Sync activeTab when tabParam in the URL changes (e.g. from header dropdown)
  useEffect(() => {
    if (tabParam && profileTabs.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabId: ProfileTab) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId }, { replace: true });
  };
  const [listingFilter, setListingFilter] = useState<ListingFilter>('published');
  const [listingSearch, setListingSearch] = useState('');
  const [listingCategoryFilter, setListingCategoryFilter] = useState('all');
  const [listingSortOrder, setListingSortOrder] = useState('default');

  const [purchases, setPurchases] = useState<PurchaseOrder[]>(MOCK_PURCHASES);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(MOCK_TRANSACTIONS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const myListings = layout.allListings;

  // Fetch API data for account dashboard
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [apiListings, apiOrders, apiTx] = await Promise.all([
          api.myListings().catch(() => null),
          api.orders().catch(() => null),
          api.transactions().catch(() => null),
        ]);

        if (!cancelled && apiListings && Array.isArray(apiListings) && apiListings.length > 0) {
          const adapted: Listing[] = apiListings.map((l) => ({
            id: String(l.id),
            productId: String(l.product_id),
            productName: l.product_name ?? undefined,
            category: l.category_name ?? 'Besin Takviyesi',
            sellerName: l.seller_name ?? 'Kadıköy Şifa Eczanesi',
            sellerCity: l.seller_city ?? 'Kadıköy / İstanbul',
            isVerifiedSeller: !!l.is_verified_seller,
            isPremiumSeller: !!l.is_premium_seller,
            isSponsored: !!l.is_sponsored,
            sponsoredDays: l.sponsored_days,
            status: l.status === 'approved' ? 'approved' : l.status === 'pending' ? 'pending' : 'rejected',
            deliveryType: (l.delivery_type as 'today' | '24h') || 'today',
            isNewListing: !!l.is_new_listing,
            isDiscounted: !!l.is_discounted,
            unitPrice: l.unit_price,
            stock: l.stock,
            mfRatio: l.mf_ratio || 'Yok',
            skt: l.skt ?? '12/2026',
            discountPercentage: l.discount_percentage ?? 0,
            minOrderQty: l.min_order_qty ?? 1,
          }));
          layout.setAllListings(adapted);
        }

        if (!cancelled && apiOrders && Array.isArray(apiOrders) && apiOrders.length > 0) {
          const adaptedOrders: PurchaseOrder[] = apiOrders.map((o) => ({
            id: String(o.id),
            orderNumber: o.order_number,
            date: o.date || o.created_at || 'Ağustos 2026',
            sellerPharmacy: o.product_name ? `Eczane (${o.product_name})` : 'Eczane',
            productName: o.product_name || 'İlaç/Takviye',
            quantity: o.quantity,
            unitPrice: o.unit_price,
            totalPrice: o.total_price,
            status: (o.status as 'Kargoda' | 'Teslim Edildi' | 'Hazırlanıyor') || 'Hazırlanıyor',
            trackingNumber: o.tracking_number || 'YURT-10029384',
          }));
          setPurchases(adaptedOrders);
        }

        if (!cancelled && apiTx && Array.isArray(apiTx) && apiTx.length > 0) {
          const adaptedTx: FinancialTransaction[] = apiTx.map((t) => ({
            id: String(t.id),
            date: t.date || 'Ağustos 2026',
            type: t.type,
            title: t.title,
            description: t.description,
            amount: t.amount,
            balanceAfter: t.balance_after,
          }));
          setTransactions(adaptedTx);
        }
      } catch {
        // Fallback to mock data
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const publishedCount = myListings.filter((l) => l.status === 'approved').length;
  const pendingCount = myListings.filter((l) => l.status === 'pending').length;
  const unpublishedCount = myListings.filter((l) => l.status === 'rejected').length;

  const filteredListings = useMemo(() => {
    let items = myListings;

    if (listingFilter === 'published') items = items.filter((l) => l.status === 'approved');
    if (listingFilter === 'pending') items = items.filter((l) => l.status === 'pending');
    if (listingFilter === 'unpublished') items = items.filter((l) => l.status === 'rejected');

    if (listingCategoryFilter !== 'all') {
      items = items.filter((item) => item.category === listingCategoryFilter);
    }

    if (listingSearch.trim()) {
      const q = listingSearch.toLowerCase();
      items = items.filter((item) => {
        const product = MOCK_PRODUCTS.find((p) => p.id === item.productId);
        const name = product?.name || item.productName || '';
        return (
          name.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          (item.category || '').toLowerCase().includes(q)
        );
      });
    }

    if (listingSortOrder === 'price_asc') {
      items = [...items].sort((a, b) => a.unitPrice - b.unitPrice);
    } else if (listingSortOrder === 'price_desc') {
      items = [...items].sort((a, b) => b.unitPrice - a.unitPrice);
    } else if (listingSortOrder === 'stock_desc') {
      items = [...items].sort((a, b) => b.stock - a.stock);
    }

    return items;
  }, [listingFilter, listingSearch, listingCategoryFilter, listingSortOrder, myListings]);

  // Layout search suggestions
  React.useEffect(() => {
    const timer = setTimeout(() => {
      layout.setSearchSuggestions(
        MOCK_PRODUCTS.map((p) => ({ id: p.id, name: p.name, barcode: p.barcode, category: p.category, psf: p.psf }))
      );
      layout.setOnSelectSuggestion(() => navigate('/products'));
    }, 0);
    return () => {
      clearTimeout(timer);
      layout.setSearchSuggestions([]);
      layout.setOnSelectSuggestion(undefined);
    };
  }, []);

  const handleDeleteListing = (id: string) => {
    layout.deleteListing(id);
    setToastMessage('İlan pazaryerinden tamamen kaldırıldı.');
  };

  const updateListingField = (listingId: string, field: 'stock' | 'unitPrice', value: string) => {
    const numeric = field === 'stock' ? parseInt(value, 10) : parseFloat(value);
    if (Number.isNaN(numeric)) return;
    layout.updateListing(listingId, { [field]: numeric });
  };

  const renderTabContent = () => {
    if (activeTab === 'listings') {
      return (
        <div className="space-y-0">
          {/* YAYINDAKİ İLANLARIMDA ARA & FİLTRELE CARD */}
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50/80 via-white to-orange-50/30 px-4 py-5 sm:px-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Search size={18} className="text-orange-500" />
                  Yayındaki İlanlarımda Ara & Filtrele
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Eczanenize ait tüm aktif ilanları ilaç adı, barkod veya kategoriye göre anında listeleyin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => layout.openAddListing()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-orange-600 active:scale-95 shrink-0"
              >
                <Plus size={15} />
                + Yeni İlan Ekle
              </button>
            </div>

            {/* SEARCH & FILTER CONTROLS */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              {/* SEARCH INPUT */}
              <div className="relative md:col-span-6">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                  placeholder="Yayındaki ilanlarımda ara (ilaç adı, barkod)..."
                  className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-9 text-xs outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-white font-medium shadow-xs"
                />
                {listingSearch ? (
                  <button
                    onClick={() => setListingSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                ) : null}
              </div>

              {/* CATEGORY SELECTOR */}
              <div className="relative md:col-span-3">
                <select
                  value={listingCategoryFilter}
                  onChange={(e) => setListingCategoryFilter(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-3.5 pr-8 text-xs font-semibold text-gray-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 shadow-xs"
                >
                  <option value="all">Tüm Kategoriler</option>
                  <option value="Besin Takviyesi">Besin Takviyesi</option>
                  <option value="Medikal">Medikal</option>
                  <option value="Kişisel Bakım">Kişisel Bakım</option>
                  <option value="Anne & Bebek">Anne & Bebek</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>

              {/* SORT SELECTOR */}
              <div className="relative md:col-span-3">
                <select
                  value={listingSortOrder}
                  onChange={(e) => setListingSortOrder(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-3.5 pr-8 text-xs font-semibold text-gray-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 shadow-xs"
                >
                  <option value="default">Sırala: Varsayılan</option>
                  <option value="price_asc">Fiyat: Düşükten Yüksek</option>
                  <option value="price_desc">Fiyat: Yüksekten Düşük</option>
                  <option value="stock_desc">Stok: En Çok</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
          </div>

          {/* STATUS TABS */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 bg-white sm:px-6">
            <div className="flex flex-wrap items-center gap-6">
              {[
                { id: 'published' as const, label: 'Yayında Olanlar', count: publishedCount },
                { id: 'unpublished' as const, label: 'Yayında Olmayanlar', count: unpublishedCount },
                { id: 'pending' as const, label: 'Onay Bekleyenler', count: pendingCount },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setListingFilter(item.id)}
                  className={`text-xs font-bold transition flex items-center gap-1.5 ${
                    listingFilter === item.id
                      ? 'text-orange-600 border-b-2 border-orange-500 pb-1'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                      listingFilter === item.id ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* LISTINGS TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="w-10 p-4">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="w-16 p-4" />
                  <th className="p-4">Ürün Adı</th>
                  <th className="p-4">Miad</th>
                  <th className="p-4">Stok</th>
                  <th className="p-4">Fiyat</th>
                  <th className="p-4">Alış Fiyatım</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-sm text-gray-500">
                      Bu filtrede gösterilecek ilan bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((listing) => {
                    const product = MOCK_PRODUCTS.find((p) => p.id === listing.productId);
                    const productName = product?.name || listing.productName || 'Ürün';

                    return (
                      <tr key={listing.id} className="hover:bg-gray-50/80">
                        <td className="p-4">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </td>
                        <td className="p-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-gradient-to-br from-orange-50 to-purple-50">
                            <Store size={18} className="text-orange-500" />
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-gray-900">{productName}</div>
                          {listing.isSponsored ? (
                            <span className="mt-1 inline-block text-xs font-bold text-amber-600">Öne Çıkarıldı</span>
                          ) : null}
                        </td>
                        <td className="p-4 text-gray-700">{listing.skt}</td>
                        <td className="p-4">
                          <input
                            type="number"
                            defaultValue={listing.stock}
                            onBlur={(e) => updateListingField(listing.id, 'stock', e.target.value)}
                            className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                          />
                        </td>
                        <td className="p-4">
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={listing.unitPrice}
                            onBlur={(e) => updateListingField(listing.id, 'unitPrice', e.target.value)}
                            className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                          />
                        </td>
                        <td className="p-4">
                          <input
                            type="text"
                            placeholder=""
                            className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                          />
                        </td>
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => handleDeleteListing(listing.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 transition shadow-sm"
                            title="İlanı Pazaryerinden ve Hesabınızdan Kaldırın"
                          >
                            <Trash2 size={14} />
                            Sil
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === 'orders') {
      return (
        <div className="overflow-x-auto p-4 sm:p-6">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="p-4">Sipariş No</th>
                <th className="p-4">Tarih</th>
                <th className="p-4">Ürün</th>
                <th className="p-4">Satıcı</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchases.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/80">
                  <td className="p-4 font-semibold text-gray-900">{order.orderNumber}</td>
                  <td className="p-4 text-gray-600">{order.date}</td>
                  <td className="p-4">{order.productName}</td>
                  <td className="p-4 text-gray-600">{order.sellerPharmacy}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800">{order.status}</span>
                  </td>
                  <td className="p-4 text-right font-bold text-orange-600">{order.totalPrice.toFixed(2)} TL</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === 'reviews') {
      return (
        <div className="space-y-6 p-4 sm:p-6">
          <div className="flex flex-col gap-4 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-500 text-2xl font-extrabold text-white shadow-md">
                9.8
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Eczane İtibar & Derecelendirme Puanı</h3>
                <p className="text-xs text-gray-600">392 onaylı B2B e-ticaret işlemine göre hesaplanmıştır.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800 flex items-center gap-1">
                <ShieldCheck size={14} /> Onaylı Güvenilir Satıcı
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-extrabold text-gray-900">392</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">Tamamlanan İlan Satışı</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-extrabold text-green-600">%99.4</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">Zamanında Kargo Teslimatı</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className="text-2xl font-extrabold text-purple-700">%100</p>
              <p className="text-xs font-semibold text-gray-500 mt-0.5">İTS Ruhsatlı Orijinal İlaç</p>
            </div>
          </div>

          <h3 className="text-sm font-bold text-gray-900 pt-2">Diğer Eczanelerden Gelen Değerlendirmeler</h3>
          <div className="space-y-3">
            {[
              { buyer: 'Çamlıca Eczanesi', rating: 10, comment: 'Paketleme çok titiz, kargo süper hızlı geldi. Kesinlikle tavsiye ederim.', date: '05 Ağu 2026' },
              { buyer: 'Güven Eczanesi', rating: 9, comment: 'Ürünler tazeliğini koruyordu, miadlar uzundu. Tekrar alırım.', date: '02 Ağu 2026' },
              { buyer: 'Umut Eczanesi', rating: 10, comment: 'Her zamanki gibi sorunsuz. Yıllardır çalışıyoruz.', date: '28 Tem 2026' },
            ].map((rev, idx) => (
              <div key={idx} className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-gray-900">{rev.buyer}</span>
                  <span className="rounded bg-green-500 px-2 py-0.5 text-xs font-extrabold text-white">
                    {rev.rating} / 10
                  </span>
                </div>
                <p className="text-xs text-gray-700">{rev.comment}</p>
                <span className="text-[10px] text-gray-400 block pt-1">{rev.date}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'favorites') {
      const favoritedListings = layout.allListings.filter((l) =>
        layout.favoriteListingIds.includes(l.id)
      );

      return (
        <div className="space-y-4 p-4 sm:p-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Heart size={18} className="fill-red-500 text-red-500" />
                Beğendiğim Eczane İlanları
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Pazaryerinde favoriye aldığınız spesifik eczane teklifleri ve koşulları.
              </p>
            </div>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 border border-red-200">
              {favoritedListings.length} Kayıtlı İlan
            </span>
          </div>

          {favoritedListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-12 text-center bg-gray-50/50">
              <Heart className="h-12 w-12 text-gray-300 mb-3" />
              <p className="font-bold text-gray-800 text-sm">Henüz beğendiğiniz bir eczane teklifi bulunmuyor</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                Pazaryerindeki ilan listesindeki kalp (❤️) butonuna tıklayarak beğendiğiniz teklifleri buraya ekleyebilirsiniz.
              </p>
              <button
                onClick={() => navigate('/products')}
                className="mt-4 rounded-lg bg-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-orange-600 transition"
              >
                Pazaryeri İlanlarını İncele →
              </button>
            </div>
          ) : (
            /* ALT ALTA (VERTICAL LIST) DÜZEN */
            <div className="space-y-3">
              {favoritedListings.map((listing) => {
                const minQty = listing.minOrderQty || 1;

                return (
                  <div
                    key={listing.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-orange-300 hover:shadow-md transition"
                  >
                    {/* 1) SATICI VE İLAÇ BİLGİSİ */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                          {listing.category || 'Besin Takviyesi'}
                        </span>
                        {listing.sellerRating !== undefined ? (
                          <span className="rounded bg-green-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                            ★ {listing.sellerRating.toFixed(1)}
                          </span>
                        ) : null}
                        <span className="font-bold text-sm text-gray-900">{listing.sellerName}</span>
                        {listing.isVerifiedSeller ? (
                          <span className="flex items-center gap-0.5 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-800">
                            <ShieldCheck size={10} /> Onaylı Eczane
                          </span>
                        ) : null}
                      </div>

                      <h4 className="font-extrabold text-base text-gray-900">
                        {listing.productName || 'Agavit Şurup 150 ml'}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span>Konum: <b className="text-gray-700">{listing.sellerCity}</b></span>
                        <span>•</span>
                        <span>SKT (Miad): <b className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-semibold">{listing.skt}</b></span>
                        <span>•</span>
                        <span>Stok: <b className="text-gray-800">{listing.stock} Kutu</b></span>
                        {listing.mfRatio !== 'Yok' ? (
                          <>
                            <span>•</span>
                            <span className="text-purple-700 font-bold bg-purple-50 px-1.5 py-0.5 rounded">MF: {listing.mfRatio}</span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    {/* 2) FİYAT VE İSKONTO BİLGİSİ */}
                    <div className="flex items-center justify-between md:flex-col md:items-end border-t md:border-t-0 border-gray-100 pt-3 md:pt-0">
                      <div className="text-left md:text-right">
                        <div className="text-xs text-gray-400">Birim Fiyat</div>
                        <div className="text-xl font-extrabold text-orange-600">
                          {listing.unitPrice.toFixed(2)} TL
                        </div>
                        <div className="text-[11px] font-bold text-green-600">
                          %{listing.discountPercentage} İskonto • Min {minQty} Adet
                        </div>
                      </div>

                      {/* 3) AKSİYON BUTONLARI (ALT ALTA / YAN YANA) */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => {
                            layout.addToCart({
                              listingId: listing.id,
                              productId: listing.productId,
                              productName: listing.productName || 'İlaç Teklifi',
                              sellerName: listing.sellerName,
                              unitPrice: listing.unitPrice,
                              quantity: minQty,
                              minOrderQty: minQty,
                              skt: listing.skt,
                              deliveryType: listing.deliveryType,
                            });
                            setToastMessage(`${listing.productName} sepete eklendi!`);
                          }}
                          className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-orange-600 transition"
                        >
                          <ShoppingCart size={14} />
                          Sepete Ekle
                        </button>

                        <button
                          onClick={() => {
                            layout.toggleFavorite(listing.id);
                            setToastMessage(`${listing.sellerName} teklifi favorilerden çıkarıldı.`);
                          }}
                          className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 hover:bg-red-100 transition"
                          title="Favorilerden Çıkar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'einvoice') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">e-Fatura İşlemleri</h2>
              <p className="text-xs text-gray-500">GİB Entegrasyonlu E-Fatura & E-Arşiv faturalarınız</p>
            </div>
            <button
              onClick={() => setToastMessage('Tüm e-faturalarınız ZIP arşivi olarak indiriliyor.')}
              className="rounded-xl bg-purple-700 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-purple-800"
            >
              📥 Toplu e-Fatura İndir (ZIP)
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 bg-gray-50 font-bold text-gray-700">
                <tr>
                  <th className="p-4">Fatura No</th>
                  <th className="p-4">Alıcı / Satıcı Eczane</th>
                  <th className="p-4">Tarih</th>
                  <th className="p-4">GİB Durumu</th>
                  <th className="p-4 text-right">Tutar</th>
                  <th className="p-4 text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs font-semibold text-gray-500">
                    Henüz kesilmiş veya alınan e-fatura bulunmamaktadır.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === 'transactions') {
      return (
        <div className="overflow-x-auto p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between rounded-lg bg-orange-50 px-4 py-3">
            <span className="text-sm font-semibold text-gray-700">Güncel Bakiye</span>
            <span className="text-lg font-extrabold text-orange-600">1.450,00 TL</span>
          </div>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="p-4">Tarih</th>
                <th className="p-4">İşlem</th>
                <th className="p-4">Açıklama</th>
                <th className="p-4 text-right">Tutar</th>
                <th className="p-4 text-right">Bakiye</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/80">
                  <td className="p-4 text-gray-600">{tx.date}</td>
                  <td className="p-4">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-bold ${
                        tx.type === 'gelir' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tx.title}
                    </span>
                  </td>
                  <td className="p-4">{tx.description}</td>
                  <td className={`p-4 text-right font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? `+${tx.amount.toFixed(2)} TL` : `${tx.amount.toFixed(2)} TL`}
                  </td>
                  <td className="p-4 text-right font-semibold text-gray-900">{tx.balanceAfter.toFixed(2)} TL</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTab === 'settings') {
      return (
        <div className="space-y-5 p-4 sm:p-6">
          <h2 className="text-base font-bold text-gray-900">Eczane Profili & Ayarları</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-gray-600">Eczane Ticari Unvanı</span>
              <input
                readOnly
                value="Kadıköy Şifa Eczanesi Ltd. Şti."
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-gray-600">GLN Numarası</span>
              <input readOnly value="3245676600002" className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-semibold text-purple-900" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-gray-600">Sorumlu Eczacı</span>
              <input readOnly value="Dr. Ecz. Burak Yılmaz" className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-gray-600">İletişim Telefonu</span>
              <input defaultValue="0216 345 67 89" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-gray-600">Fatura Adresi</span>
            <textarea
              rows={2}
              defaultValue="Caferağa Mah. Moda Cad. No: 42 Kadıköy / İstanbul"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </label>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setToastMessage('Eczane profil ayarlarınız başarıyla güncellendi!')}
              className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Ayarları Kaydet
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="text-gray-800">
      {toastMessage ? <Toast message={toastMessage} onClose={() => setToastMessage(null)} /> : null}

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        {/* BREADCRUMB */}
        <div className="mb-4 text-sm text-gray-500">
          <Link to="/products" className="hover:text-orange-600">
            Anasayfa
          </Link>
          <span className="mx-2">&gt;</span>
          <span>Profilim</span>
          <span className="mx-2">&gt;</span>
          <span className="font-semibold text-gray-800">{tabLabels[activeTab]}</span>
        </div>

        {/* MAIN WHITE CONTAINER */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* PROFILE TAB NAV */}
          <nav className="flex items-center gap-4 overflow-x-auto border-b border-gray-200 px-4 sm:gap-6 sm:px-6 bg-gray-50/50">
            {profileTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative shrink-0 whitespace-nowrap py-3.5 px-2 text-sm font-bold transition-all duration-150 ${
                    isActive
                      ? 'text-orange-600 border-b-2 border-orange-500'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50 rounded-t-lg'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
