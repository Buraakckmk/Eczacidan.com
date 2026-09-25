import {
  Bell,
  PlusCircle,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  CartItem,
  Listing,
  MOCK_LISTINGS,
  MOCK_NOTIFICATIONS,
  NotificationItem,
} from '../data/mockData';
import { CategoryNav } from './CategoryNav';
import { Footer } from './Footer';
import { LayoutContext, LayoutContextType, useLayoutContext } from './LayoutContext';
import { LiveSupportModal } from './LiveSupportModal';
import { MarketplaceHeader, SellerSuggestion } from './MarketplaceHeader';
import { Toast } from './Toast';
import { categoryToSlug, sellerToSlug } from '../utils/slug';
import { TrustBadgesBar } from './TrustBadgesBar';

const categories = [
  'Anne & Bebek',
  'Besin Takviyesi',
  'Kişisel Bakım',
  'Medikal',
  'Sağlık',
  'Sarf Malzemeleri',
  'Outlet',
  'Özel Kategoriler',
] as const;

export { useLayoutContext };

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [searchSuggestions, setSearchSuggestions] = useState<
    Array<{ id: string; name: string; barcode: string; category: string; psf: number }>
  >([]);
  const onSelectSuggestionRef = useRef<((id: string) => void) | undefined>(undefined);

  const [sellerSuggestions, setSellerSuggestions] = useState<SellerSuggestion[]>([]);
  const onSelectSellerRef = useRef<((sellerName: string) => void) | undefined>(undefined);

  // Global Drawers/Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isAddListingOpen, setIsAddListingOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Cart & Notifications state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  // UNIFIED COMPREHENSIVE ADD LISTING FORM STATE
  const [newListingForm, setNewListingForm] = useState({
    productName: '',
    category: 'Besin Takviyesi',
    barcode: '',
    psf: '',
    unitPrice: '',
    stock: '',
    mfRatio: '10+1',
    skt: '',
    minOrderQty: '1',
    deliveryType: 'today' as 'today' | '24h',
    isSponsored: false,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Close all open modals/drawers on page route navigation
  useEffect(() => {
    setIsCartOpen(false);
    setIsAddListingOpen(false);
    setIsMessagesOpen(false);
    setIsNotificationsOpen(false);
  }, [location.pathname, location.key, location.search]);

  // Fetch initial Cart & Notifications from API if logged in
  useEffect(() => {
    (async () => {
      try {
        const [apiCart, apiNotifs] = await Promise.all([
          api.cart().catch(() => null),
          api.notifications().catch(() => null),
        ]);

        if (apiCart && Array.isArray(apiCart) && apiCart.length > 0) {
          const adaptedCart: CartItem[] = apiCart
            .filter((c) => c.product_name && !c.product_name.includes('Agavit'))
            .map((c) => ({
              listingId: String(c.listing_id),
              productId: String(c.listing_id),
              productName: c.product_name || 'İlaç/Ürün',
              sellerName: c.seller_name || 'Eczane',
              unitPrice: c.unit_price ?? 0,
              quantity: c.quantity ?? 1,
              minOrderQty: c.min_order_qty ?? 1,
              skt: c.skt || '12/2026',
              deliveryType: (c.delivery_type as 'today' | '24h') || 'today',
            }));
          setCartItems(adaptedCart);
        }

        if (apiNotifs && Array.isArray(apiNotifs) && apiNotifs.length > 0) {
          const adaptedNotifs: NotificationItem[] = apiNotifs.map((n) => ({
            id: String(n.id),
            title: n.title,
            message: n.message,
            time: n.time || 'Şimdi',
            unread: n.unread,
            type: (n.type as 'price' | 'order' | 'system') || 'system',
          }));
          setNotifications(adaptedNotifs);
        }
      } catch {
        // Fallback to local state if offline
      }
    })();
  }, []);

  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);

  // Real-time Live Support & Admin Message Sync Listener
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('eczacidan_live_chat_sync');
      channel.onmessage = (e) => {
        if (e.data && e.data.type === 'ADMIN_REPLY') {
          // 1. Increment unread message badge count on purple message icon
          setUnreadMessageCount((prev) => prev + 1);

          // 2. Add notification item to Bildirimler popover
          const newNotif: NotificationItem = {
            id: `notif-chat-${Date.now()}`,
            title: '💬 Canlı Destek Temsilcisinden Yeni Mesaj',
            message: `${e.data.senderName || 'Canlı Temsilci'}: "${e.data.text}"`,
            time: e.data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: true,
            type: 'system',
          };
          setNotifications((prev) => [newNotif, ...prev]);
        }
      };
    } catch {
      // Fallback
    }

    return () => {
      channel?.close();
    };
  }, []);

  const [activeCategory, setActiveCategory] = useState('');

  // Custom click overrides if pages supply them (stored in refs to prevent render-phase state updater crashes)
  const customOnSmartCartClickRef = useRef<(() => void) | undefined>(undefined);
  const customOnAddListingClickRef = useRef<(() => void) | undefined>(undefined);
  const customOnMessagesClickRef = useRef<(() => void) | undefined>(undefined);
  const customOnNotificationsClickRef = useRef<(() => void) | undefined>(undefined);
  const customOnCartClickRef = useRef<(() => void) | undefined>(undefined);
  const onCategoryClickRef = useRef<((category: string) => void) | undefined>(undefined);

  // Cart operations
  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.listingId === item.listingId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
        return next;
      }
      return [...prev, item];
    });

    api.addToCart(Number(item.listingId), item.quantity).catch(() => {});
    setToastMessage(`${item.productName} sepetinize eklendi!`);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (listingId: string, qty: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.listingId === listingId ? { ...item, quantity: qty } : item)),
    );
  };

  const removeFromCart = (listingId: string) => {
    setCartItems((prev) => prev.filter((i) => i.listingId !== listingId));
  };

  const clearCart = () => {
    setCartItems([]);
    api.clearCart().catch(() => {});
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
    api.markNotificationRead(Number(id)).catch(() => {});

    // Okunan bildirimi 10 saniye sonra listeden otomatik sil
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 10000);
  };

  const clearReadNotifications = () => {
    setNotifications((prev) => prev.filter((n) => n.unread));
  };

  // Cart calculations
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [cartItems],
  );
  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );
  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  );



  const isHomepage = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const isKategoriPath = location.pathname.startsWith('/kategori/');
    const isMagazaPath = location.pathname.startsWith('/magaza/');
    return (
      (location.pathname === '/' || location.pathname === '/products') &&
      !isKategoriPath &&
      !isMagazaPath &&
      !searchParams.get('category') &&
      !searchParams.get('seller') &&
      !searchParams.get('q') &&
      !searchParams.get('search')
    );
  }, [location.pathname, location.search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setIsSearchOpen(false);
      return;
    }
    navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    setIsSearchOpen(false);
  };

  // Listings state (Dynamic CRUD)
  const [allListings, setAllListings] = useState<Listing[]>(MOCK_LISTINGS);

  const addListing = (newListing: Listing) => {
    setAllListings((prev) => [newListing, ...prev]);
    setToastMessage(`${newListing.productName} ilanınız başarıyla yayınlandı!`);
  };

  const deleteListing = (id: string) => {
    setAllListings((prev) => prev.filter((l) => l.id !== id));
    api.deleteListing(Number(id)).catch(() => {});
    setToastMessage('İlan pazaryerinden ve hesabınızdan tamamen kaldırıldı.');
  };

  const updateListing = (id: string, updates: Partial<Listing>) => {
    setAllListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    );
    api.updateListing(Number(id), {
      stock: updates.stock,
      unit_price: updates.unitPrice,
    }).catch(() => {});
    setToastMessage('İlan bilgileri güncellendi.');
  };

  // Listen for Admin Listing Approvals & Rejections in Real Time
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('eczacidan_listings_sync');
      channel.onmessage = (e) => {
        if (e.data && e.data.type === 'LISTING_APPROVED') {
          const approvedItem = e.data.listing;
          const productName = approvedItem?.title || approvedItem?.productName || 'İlanınız';

          if (approvedItem) {
            const newListing: Listing = {
              id: approvedItem.id || `list-${Date.now()}`,
              productId: `prod-${Date.now()}`,
              productName: productName,
              category: approvedItem.category || 'Besin Takviyesi',
              sellerName: approvedItem.pharmacyName || 'Kadıköy Şifa Eczanesi (Demo Hesabı)',
              sellerCity: 'Kadıköy / İstanbul',
              sellerRating: 9.8,
              sellerListingCount: 5,
              isVerifiedSeller: true,
              isPremiumSeller: true,
              isSponsored: false,
              status: 'approved',
              deliveryType: 'today',
              isNewListing: true,
              isDiscounted: true,
              unitPrice: approvedItem.price || approvedItem.unitPrice || 50,
              stock: approvedItem.stock || 10,
              mfRatio: approvedItem.mf || approvedItem.mfRatio || 'Yok',
              skt: approvedItem.expiry || approvedItem.skt || '12/2027',
              discountPercentage: 20,
              minOrderQty: 1,
            };

            setAllListings((prev) => [newListing, ...prev]);
            setToastMessage(`🎉 "${newListing.productName}" ilanınız Admin tarafından onaylandı ve yayına alındı!`);
          }

          // Bildirim ekle: Onaylandı
          const approvedNotif: NotificationItem = {
            id: `notif-appr-${Date.now()}`,
            title: '✅ İlanınız Onaylandı!',
            message: `Tebrikler! "${productName}" ilanınız admin onayından geçti ve pazaryerinde yayına alındı.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: true,
            type: 'system',
          };
          setNotifications((prev) => [approvedNotif, ...prev]);
        } else if (e.data && e.data.type === 'LISTING_REJECTED') {
          const rejectedItem = e.data.listing;
          const productName = rejectedItem?.title || rejectedItem?.productName || 'İlanınız';

          setToastMessage(`❌ "${productName}" ilanınız Admin incelemesi sonucu reddedildi.`);

          // Bildirim ekle: Reddedildi
          const rejectedNotif: NotificationItem = {
            id: `notif-rej-${Date.now()}`,
            title: '❌ İlanınız Reddedildi',
            message: `"${productName}" ilanınız admin incelemesi sonucunda reddedildi. İlan şartlarını kontrol edip tekrar yükleyebilirsiniz.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: true,
            type: 'system',
          };
          setNotifications((prev) => [rejectedNotif, ...prev]);
        }
      };
    } catch {
      // Fallback
    }

    return () => channel?.close();
  }, []);

  const handleCreateListingGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListingForm.productName.trim()) return;

    const newPrice = parseFloat(newListingForm.unitPrice) || 0;
    const newStock = parseInt(newListingForm.stock, 10) || 0;
    const newMinQty = parseInt(newListingForm.minOrderQty, 10) || 1;

    const createdItem: Listing = {
      id: `list-${Date.now()}`,
      productId: `prod-${Date.now()}`,
      productName: newListingForm.productName,
      category: newListingForm.category,
      sellerName: 'Kadıköy Şifa Eczanesi (Demo Hesabı)',
      sellerCity: 'Kadıköy / İstanbul',
      sellerRating: 9.8,
      sellerListingCount: allListings.length + 1,
      isVerifiedSeller: true,
      isPremiumSeller: true,
      isSponsored: newListingForm.isSponsored,
      sponsoredDays: newListingForm.isSponsored ? 7 : 0,
      status: 'pending',
      deliveryType: newListingForm.deliveryType,
      isNewListing: true,
      isDiscounted: true,
      unitPrice: newPrice,
      stock: newStock,
      mfRatio: newListingForm.mfRatio || 'Yok',
      skt: newListingForm.skt || '12/2026',
      discountPercentage: 15,
      minOrderQty: newMinQty,
    };

    // Send to Admin Panel for Approval via BroadcastChannel
    try {
      const channel = new BroadcastChannel('eczacidan_listings_sync');
      channel.postMessage({
        type: 'NEW_LISTING_PENDING',
        listing: {
          ...createdItem,
          title: createdItem.productName,
          price: createdItem.unitPrice,
          expiry: createdItem.skt,
          mf: createdItem.mfRatio,
          barcode: newListingForm.barcode || '8699525010019',
        },
      });
      channel.close();
    } catch {
      // Fallback
    }

    // Bildirim ekle: Onaya Gönderildi
    const pendingNotif: NotificationItem = {
      id: `notif-sent-${Date.now()}`,
      title: '⏳ İlanınız Onaya Gönderildi',
      message: `"${newListingForm.productName}" ilanınız inceleme için admin onay kuyruğuna alındı.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: true,
      type: 'system',
    };
    setNotifications((prev) => [pendingNotif, ...prev]);

    setIsAddListingOpen(false);
    setNewListingForm({
      productName: '',
      category: 'Besin Takviyesi',
      barcode: '',
      psf: '',
      unitPrice: '',
      stock: '',
      mfRatio: '10+1',
      skt: '',
      minOrderQty: '1',
      deliveryType: 'today',
      isSponsored: false,
    });
    setToastMessage(` İlanınız kaydedildi ve onay için Admin Paneline gönderildi!`);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const [favoriteListingIds, setFavoriteListingIds] = useState<string[]>([]);
  const toggleFavorite = (listingId: string) => {
    setFavoriteListingIds((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId],
    );
  };
  const isFavorite = (listingId: string) => favoriteListingIds.includes(listingId);

  // Expose context value to all child components
  const contextValue = useMemo<LayoutContextType>(
    () => ({
      allListings,
      setAllListings,
      addListing,
      deleteListing,
      updateListing,

      cartItems,
      cartTotal,
      setCartItems,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      setToastMessage,

      favoriteListingIds,
      toggleFavorite,
      isFavorite,

      notifications,
      setNotifications,
      markNotificationRead,
      clearReadNotifications,
      unreadMessageCount,

      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      openNotifications: () => setIsNotificationsOpen(true),
      closeNotifications: () => setIsNotificationsOpen(false),
      openMessages: () => {
        setUnreadMessageCount(0);
        setIsMessagesOpen(true);
      },
      closeMessages: () => setIsMessagesOpen(false),
      openAddListing: () => setIsAddListingOpen(true),
      closeAddListing: () => setIsAddListingOpen(false),
      openSmartCart: () => {},
      closeSmartCart: () => {},

      setCartCount: () => {},
      setNotificationCount: () => {},
      setMessageCount: (count: number) => setUnreadMessageCount(count),
      setOnSmartCartClick: (fn) => { customOnSmartCartClickRef.current = fn; },
      setOnAddListingClick: (fn) => { customOnAddListingClickRef.current = fn; },
      setOnMessagesClick: (fn) => { customOnMessagesClickRef.current = fn; },
      setOnNotificationsClick: (fn) => { customOnNotificationsClickRef.current = fn; },
      setOnCartClick: (fn) => { customOnCartClickRef.current = fn; },
      setActiveCategory: (cat: string) => {
        setActiveCategory(cat);
        onCategoryClickRef.current?.(cat);
      },
      setOnCategoryClick: (fn) => { onCategoryClickRef.current = fn; },
      setSearchSuggestions,
      setOnSelectSuggestion: (fn) => { onSelectSuggestionRef.current = fn; },
      setSellerSuggestions,
      setOnSelectSeller: (fn) => { onSelectSellerRef.current = fn; },
    }),
    [
      allListings,
      cartItems,
      cartTotal,
      favoriteListingIds,
      notifications,
      unreadMessageCount,
    ],
  );

  return (
    <LayoutContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

        {/* STICKY HEADER & NAVBAR & TRUST BADGES */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
          <MarketplaceHeader
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            isSearchOpen={isSearchOpen}
            onSearchOpenChange={setIsSearchOpen}
            searchSuggestions={searchSuggestions}
            onSelectSuggestion={(id) => onSelectSuggestionRef.current?.(id)}
            sellerSuggestions={sellerSuggestions}
            onSelectSeller={(sellerName) => onSelectSellerRef.current?.(sellerName)}
            cartCount={cartCount}
            notificationCount={unreadNotificationCount}
            messageCount={unreadMessageCount}
            onSmartCartClick={() => customOnSmartCartClickRef.current?.()}
            onAddListingClick={() => customOnAddListingClickRef.current ? customOnAddListingClickRef.current() : setIsAddListingOpen(true)}
            onMessagesClick={() => {
              setUnreadMessageCount(0);
              if (customOnMessagesClickRef.current) {
                customOnMessagesClickRef.current();
              } else {
                setIsMessagesOpen(true);
              }
            }}
            onNotificationsClick={() => customOnNotificationsClickRef.current ? customOnNotificationsClickRef.current() : setIsNotificationsOpen(true)}
            onCartClick={() => customOnCartClickRef.current ? customOnCartClickRef.current() : setIsCartOpen(true)}
          />

          {/* CATEGORY NAV */}
          <CategoryNav
            activeCategory={activeCategory}
            onCategoryClick={(cat: string) => {
              setActiveCategory(cat);
              if (onCategoryClickRef.current) {
                onCategoryClickRef.current(cat);
              } else {
                navigate(`/kategori/${categoryToSlug(cat)}`);
              }
            }}
          />

          {/* TRUST BADGES BAR (HOMEPAGE ONLY) */}
          {isHomepage && <TrustBadgesBar />}
        </div>

        {/* PAGE CONTENT */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* FOOTER */}
        <Footer showNewsletter={isHomepage} />

        {/* MODALS / DRAWERS */}
        {/* UNIFIED COMPREHENSIVE ADD LISTING MODAL */}
        {isAddListingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <PlusCircle className="text-orange-500" size={22} />
                  B2B İlaç & Ürün İlanı Oluştur
                </h3>
                <button onClick={() => setIsAddListingOpen(false)} className="text-gray-400 hover:text-gray-700">
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleCreateListingGlobal} className="space-y-4">
                <div className="rounded-2xl bg-orange-50 border border-orange-200 p-3 text-xs text-orange-950 flex items-start gap-2.5">
                  <ShieldCheck size={18} className="text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">🛡️ Resmi İTS & Miad Kontrol Süreci</span>
                    <span>Girdiğiniz ilan Admin onayının ardından tüm onaylı eczacılara açık olarak yayına girecektir.</span>
                  </div>
                </div>

                {/* 1. URUN & BARKOD */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      İlaç / Ürün Adı *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Parol 500 mg 20 Tablet"
                      value={newListingForm.productName}
                      onChange={(e) => setNewListingForm((prev) => ({ ...prev, productName: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Kategori *
                    </label>
                    <select
                      value={newListingForm.category}
                      onChange={(e) => setNewListingForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-bold"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Barkod / GTIN Numarası (İTS Karekod) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="8699..."
                      value={newListingForm.barcode}
                      onChange={(e) => setNewListingForm((prev) => ({ ...prev, barcode: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Son Kullanma Tarihi (SKT / Miad) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YYYY (Örn: 12/2027)"
                      value={newListingForm.skt}
                      onChange={(e) => setNewListingForm((prev) => ({ ...prev, skt: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 p-2.5 text-xs outline-none focus:border-orange-500 font-bold"
                    />
                  </div>
                </div>

                {/* 2. FIYAT, STOK & MF */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">PSF (Etiket TL)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="68.20"
                      value={newListingForm.psf}
                      onChange={(e) => setNewListingForm((prev) => ({ ...prev, psf: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 p-2 text-xs outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">İlan B2B Fiyatı (TL) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="42.00"
                      value={newListingForm.unitPrice}
                      onChange={(e) => setNewListingForm((prev) => ({ ...prev, unitPrice: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 p-2 text-xs outline-none focus:border-orange-500 font-black text-orange-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Stok (Kutu) *</label>
                    <input
                      type="number"
                      required
                      placeholder="50"
                      value={newListingForm.stock}
                      onChange={(e) => setNewListingForm((prev) => ({ ...prev, stock: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 p-2 text-xs outline-none focus:border-orange-500 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">MF Oranı</label>
                    <select
                      value={newListingForm.mfRatio}
                      onChange={(e) => setNewListingForm((prev) => ({ ...prev, mfRatio: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 p-2 text-xs outline-none focus:border-orange-500 font-bold"
                    >
                      <option value="10+1">10+1</option>
                      <option value="10+2">10+2</option>
                      <option value="5+1">5+1</option>
                      <option value="20+1">20+1</option>
                      <option value="Yok">Yok</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Min. Sipariş</label>
                    <input
                      type="number"
                      value={newListingForm.minOrderQty}
                      onChange={(e) => setNewListingForm((prev) => ({ ...prev, minOrderQty: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 p-2 text-xs outline-none focus:border-orange-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Teslimat Tipi</label>
                    <select
                      value={newListingForm.deliveryType}
                      onChange={(e) =>
                        setNewListingForm((prev) => ({
                          ...prev,
                          deliveryType: e.target.value as 'today' | '24h',
                        }))
                      }
                      className="w-full rounded-xl border border-gray-300 p-2 text-xs outline-none focus:border-orange-500 font-bold"
                    >
                      <option value="today">🚀 Bugün Teslimat (Aynı Gün)</option>
                      <option value="24h">📦 24 Saat İçi Kargo</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-600" />
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">Sponsorlu İlan Yap (Öne Çıkar)</span>
                      <span className="text-[10px] text-gray-600 font-medium">Arama sonuçlarının en üstünde Altın Rozet ile gösterilir.</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={newListingForm.isSponsored}
                    onChange={(e) => setNewListingForm((prev) => ({ ...prev, isSponsored: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddListingOpen(false)}
                    className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-extrabold text-gray-700 hover:bg-gray-100 transition"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-orange-500 hover:bg-orange-600 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-orange-500/25 transition"
                  >
                    🚀 İlanı Kaydet & Admin Onayına Gönder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS POPOVER */}
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 bg-black/20">
            <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Bell size={16} className="text-orange-500" /> Bildirimler
                </h4>
                <div className="flex items-center gap-2">
                  {notifications.some((n) => !n.unread) && (
                    <button
                      onClick={clearReadNotifications}
                      className="text-[11px] font-bold text-gray-400 hover:text-red-500 transition"
                    >
                      Okunanları Temizle
                    </button>
                  )}
                  <button onClick={() => setIsNotificationsOpen(false)} className="text-xs font-bold text-gray-400 hover:text-gray-600">
                    Kapat
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 font-medium mb-2 flex items-center gap-1">
                <span>ℹ️</span> Okunan bildirimler 10 saniye sonra otomatik temizlenir.
              </p>

              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400 font-medium">
                    Henüz bir bildiriminiz yok.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        n.unread ? 'bg-orange-50 border-orange-200 shadow-xs font-bold' : 'bg-gray-50/70 border-gray-100 text-gray-500 opacity-70'
                      }`}
                    >
                      <div className="flex justify-between font-bold text-gray-900">
                        <span className="flex items-center gap-2">
                          {n.unread && <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>}
                          {n.title}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">{n.time}</span>
                      </div>
                      <p className="text-gray-600 mt-1 text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* LIVE SUPPORT MODAL */}
        <LiveSupportModal isOpen={isMessagesOpen} onClose={() => setIsMessagesOpen(false)} />

        {/* CART DRAWER */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between bg-gray-900 text-white p-4">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <ShoppingCart size={18} className="text-orange-500" />
                  Alım Sepetiniz ({cartCount})
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cartItems.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-500 font-bold">
                    Sepetinizde ürün bulunmamaktadır.
                  </div>
                ) : (
                  cartItems.map((item) => {
                    const listing = allListings.find((l) => l.id === item.listingId);
                    const minQty = listing?.minOrderQty || 1;

                    const handleDecrease = () => {
                      if (item.quantity > minQty) {
                        updateCartQuantity(item.listingId, item.quantity - 1);
                      } else {
                        setToastMessage(`⚠️ Minimum sipariş adedi (${minQty} kutu) altına inilemez.`);
                      }
                    };

                    const handleIncrease = () => {
                      updateCartQuantity(item.listingId, item.quantity + 1);
                    };

                    return (
                      <div key={item.listingId} className="flex flex-col gap-2.5 p-3.5 bg-gray-50 rounded-2xl border border-gray-200 shadow-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-black text-gray-900 leading-snug">{item.productName}</h4>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-gray-500 font-medium">
                                Satıcı:{' '}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsCartOpen(false);
                                    navigate(`/magaza/${sellerToSlug(item.sellerName)}`);
                                  }}
                                  className="font-extrabold text-orange-600 hover:underline cursor-pointer"
                                >
                                  {item.sellerName}
                                </button>
                              </span>
                              {minQty > 1 && (
                                <span className="rounded-md bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 border border-amber-200">
                                  Min: {minQty} Kutu
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.listingId)}
                            className="text-red-500 p-1.5 hover:bg-red-50 rounded-xl transition shrink-0 cursor-pointer"
                            title="Ürünü Sepetten Kaldır"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                          {/* QUANTITY INCREASE / DECREASE CONTROLS */}
                          <div className="flex items-center rounded-xl border border-gray-300 bg-white p-0.5 shadow-xs">
                            <button
                              type="button"
                              onClick={handleDecrease}
                              className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black transition cursor-pointer ${
                                item.quantity <= minQty
                                  ? 'text-gray-300 hover:bg-gray-50'
                                  : 'text-gray-700 hover:bg-orange-500 hover:text-white'
                              }`}
                              title={item.quantity <= minQty ? `Min. Sipariş: ${minQty} Kutu` : 'Azalt'}
                            >
                              -
                            </button>
                            <span className="px-3 text-xs font-black text-gray-900 tabular-nums">
                              {item.quantity} Kutu
                            </span>
                            <button
                              type="button"
                              onClick={handleIncrease}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-gray-700 hover:bg-orange-500 hover:text-white transition cursor-pointer"
                              title="Arttır"
                            >
                              +
                            </button>
                          </div>

                          {/* ITEM PRICE TOTAL */}
                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 font-medium block">{item.unitPrice.toFixed(2)} ₺ / Adet</span>
                            <span className="text-sm font-black text-orange-600 tracking-tight">
                              {(item.quantity * item.unitPrice).toFixed(2)} ₺
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
                  <div className="flex justify-between font-black text-sm text-gray-900">
                    <span>Toplam Tutar:</span>
                    <span className="text-orange-600">{cartTotal.toFixed(2)} ₺</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full rounded-xl bg-orange-500 py-3.5 text-xs font-black text-white shadow-lg hover:bg-orange-600 transition active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Ödeme Kısmına Geç</span>
                    <span>→</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </LayoutContext.Provider>
  );
}
