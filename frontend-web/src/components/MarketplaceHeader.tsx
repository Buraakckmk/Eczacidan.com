import {
  Bell,
  ChevronDown,
  CreditCard,
  FileText,
  Heart,
  LogOut,
  Menu,
  MessageCircleMore,
  Package,
  Search,
  ShoppingCart,
  Store,
  UserRound,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

export interface SearchSuggestion {
  id: string;
  name: string;
  barcode: string;
  category: string;
  psf: number;
}

export interface SellerSuggestion {
  sellerName: string;
  sellerCity: string;
  sellerRating?: number;
  sellerListingCount?: number;
}

interface MarketplaceHeaderProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  isSearchOpen: boolean;
  onSearchOpenChange: (open: boolean) => void;
  searchSuggestions?: SearchSuggestion[];
  onSelectSuggestion?: (id: string) => void;
  sellerSuggestions?: SellerSuggestion[];
  onSelectSeller?: (sellerName: string) => void;
  cartCount?: number;
  notificationCount?: number;
  messageCount?: number;
  onSmartCartClick?: () => void;
  onAddListingClick?: () => void;
  onMessagesClick?: () => void;
  onNotificationsClick?: () => void;
  onCartClick?: () => void;
  username?: string;
}

function ratingColor(r: number) {
  if (r >= 8.5) return 'bg-green-500 text-white';
  if (r >= 7.0) return 'bg-yellow-400 text-gray-900';
  return 'bg-red-500 text-white';
}

export function MarketplaceHeader({
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  isSearchOpen,
  onSearchOpenChange,
  searchSuggestions = [],
  onSelectSuggestion,
  sellerSuggestions = [],
  onSelectSeller,
  cartCount = 0,
  notificationCount = 0,
  messageCount = 0,
  onSmartCartClick,
  onAddListingClick,
  onMessagesClick,
  onNotificationsClick,
  onCartClick,
  username = 'eczanesifa',
}: MarketplaceHeaderProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isAccountPage = location.pathname === '/account';
  const currentTab = searchParams.get('tab') || (isAccountPage ? 'settings' : '');

  const isTabActive = (tabKey: string) => isAccountPage && currentTab === tabKey;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Normalization helper
  const normalizeText = (str: string) =>
    str
      .toLocaleLowerCase('tr-TR')
      .replace(/i̇/g, 'i')
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');

  // Filter & Rank Search Suggestions by Relevance to searchQuery
  const filteredSearchSuggestions = useMemo(() => {
    const q = normalizeText(searchQuery.trim());
    if (!q) return searchSuggestions;

    const scored = searchSuggestions
      .map((item) => {
        const nName = normalizeText(item.name);
        const nBarcode = normalizeText(item.barcode);
        const nCat = normalizeText(item.category);

        let score = 0;

        // Exact match or prefix match on product name (Highest Priority)
        if (nName === q) score += 300;
        else if (nName.startsWith(q)) score += 200;
        else {
          const words = nName.split(' ');
          if (words.some((w) => w.startsWith(q))) score += 120;
          else if (nName.includes(q)) score += 60;
        }

        // Barcode match
        if (nBarcode.startsWith(q)) score += 150;
        else if (nBarcode.includes(q)) score += 80;

        // Category match
        if (nCat.includes(q)) score += 40;

        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.map((entry) => entry.item);
  }, [searchQuery, searchSuggestions]);

  // Filter & Rank Seller Suggestions by Relevance to searchQuery
  const filteredSellerSuggestions = useMemo(() => {
    const q = normalizeText(searchQuery.trim());
    if (!q) return sellerSuggestions;

    const scored = sellerSuggestions
      .map((seller) => {
        const nName = normalizeText(seller.sellerName);
        const nCity = normalizeText(seller.sellerCity);

        let score = 0;
        if (nName === q) score += 300;
        else if (nName.startsWith(q)) score += 200;
        else {
          const words = nName.split(' ');
          if (words.some((w) => w.startsWith(q))) score += 120;
          else if (nName.includes(q)) score += 60;
        }

        if (nCity.includes(q)) score += 40;

        return { seller, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.map((entry) => entry.seller);
  }, [searchQuery, sellerSuggestions]);

  const hasResults = filteredSearchSuggestions.length > 0 || filteredSellerSuggestions.length > 0;
  const showDropdown = isSearchOpen && (hasResults || searchQuery.trim().length > 0);

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const qNorm = normalizeText(query.trim());
    const textNorm = normalizeText(text);
    const idx = textNorm.indexOf(qNorm);

    if (idx === -1) return text;

    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + query.trim().length);
    const after = text.slice(idx + query.trim().length);

    return (
      <>
        {before}
        <span className="bg-orange-100 text-orange-600 font-black px-0.5 rounded-xs">{match}</span>
        {after}
      </>
    );
  };

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSearchOpenChange(false);
        setIsUserMenuOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onSearchOpenChange]);

  // Click outside listener
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onSearchOpenChange(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onSearchOpenChange]);

  const handleSubmit = (e: React.FormEvent) => {
    if (!searchQuery.trim()) {
      e.preventDefault();
      onSearchOpenChange(false);
      return;
    }
    onSearchSubmit(e);
    onSearchQueryChange('');
    onSearchOpenChange(false);
    inputRef.current?.blur();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-6">
        <Link
          to="/products"
          onClick={() => {
            onSearchQueryChange('');
            onSearchOpenChange(false);
          }}
          className="shrink-0 text-lg font-bold tracking-tight text-gray-900 transition hover:opacity-90 sm:text-2xl"
        >
          eczacıdan<span className="text-orange-500">.com</span>
        </Link>

        {/* SEARCH FORM */}
        <div ref={dropdownRef} className="relative min-w-0 flex-1">
          <form onSubmit={handleSubmit}>
            <div
              className={`flex items-center overflow-hidden rounded-full border bg-white p-1 pl-3.5 pr-1 transition ${
                isSearchOpen
                  ? 'border-orange-500 ring-2 ring-orange-100 shadow-sm'
                  : 'border-gray-300 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100'
              }`}
            >
              <input
                ref={inputRef}
                className="min-w-0 flex-1 bg-transparent px-1 py-1 text-xs sm:text-sm text-gray-900 outline-none placeholder:text-gray-400 font-medium"
                placeholder="Ürün, barkod veya satıcı ara..."
                value={searchQuery}
                onChange={(e) => {
                  onSearchQueryChange(e.target.value);
                  onSearchOpenChange(true);
                }}
                onFocus={() => {
                  if (hasResults) onSearchOpenChange(true);
                }}
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    onSearchQueryChange('');
                    onSearchOpenChange(false);
                    inputRef.current?.focus();
                  }}
                  className="mr-1.5 shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                  title="Aramayı temizle"
                >
                  <X size={15} />
                </button>
              ) : null}

              <button
                type="submit"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 active:scale-95 transition shadow-xs cursor-pointer"
                title="Arama Yap"
              >
                <Search size={15} />
              </button>
            </div>
          </form>

          {/* SEARCH SUGGESTIONS DROPDOWN */}
          {showDropdown ? (
            <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl animate-in fade-in duration-150">
              {filteredSearchSuggestions.length > 0 ? (
                <div>
                  <div className="sticky top-0 bg-gray-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 flex justify-between items-center">
                    <span>İlaç / Ürünler ({filteredSearchSuggestions.length})</span>
                    {searchQuery.trim() && (
                      <span className="text-[10px] text-orange-600 font-semibold">Alaka düzeyine göre sıralandı</span>
                    )}
                  </div>
                  {filteredSearchSuggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectSuggestion?.(item.id);
                        onSearchQueryChange('');
                        onSearchOpenChange(false);
                        inputRef.current?.blur();
                      }}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left border-b border-gray-50 last:border-0 hover:bg-orange-50/60 transition"
                    >
                      <div>
                        <div className="font-bold text-sm text-gray-900">
                          {highlightMatch(item.name, searchQuery)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Barkod: {highlightMatch(item.barcode, searchQuery)} • {item.category}
                        </div>
                      </div>
                      <div className="ml-3 shrink-0 text-sm font-bold text-orange-600">
                        {item.psf.toFixed(2)} TL
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}

              {filteredSellerSuggestions.length > 0 ? (
                <div>
                  <div
                    className={`sticky top-0 bg-gray-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 ${
                      filteredSearchSuggestions.length > 0 ? 'border-t border-gray-200 mt-0' : ''
                    }`}
                  >
                    Satıcılar ({filteredSellerSuggestions.length})
                  </div>
                  {filteredSellerSuggestions.map((seller) => (
                    <button
                      key={seller.sellerName}
                      type="button"
                      onClick={() => {
                        onSelectSeller?.(seller.sellerName);
                        onSearchQueryChange('');
                        onSearchOpenChange(false);
                        inputRef.current?.blur();
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-purple-50 transition"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                        <Store size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {seller.sellerRating !== undefined ? (
                            <span
                              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums ${ratingColor(
                                seller.sellerRating
                              )}`}
                            >
                              {seller.sellerRating.toFixed(1)}
                            </span>
                          ) : null}
                          <span className="truncate text-sm font-semibold text-gray-900">
                            {highlightMatch(seller.sellerName, searchQuery)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {seller.sellerCity}
                          {seller.sellerListingCount !== undefined
                            ? ` · ${seller.sellerListingCount} ilan`
                            : ''}
                        </div>
                      </div>
                      <span className="shrink-0 text-[11px] font-semibold text-purple-600">
                        Profile Git →
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}

              {/* NO RESULTS STATE */}
              {searchQuery.trim().length > 0 && !hasResults && (
                <div className="p-6 text-center text-xs text-gray-500 font-bold space-y-1">
                  <div className="text-gray-400 text-xl mb-1">🔍</div>
                  <div className="text-gray-800 font-extrabold">"{searchQuery}" aramasıyla eşleşen sonuç bulunamadı</div>
                  <div className="text-[11px] text-gray-400 font-normal">Farklı bir ilaç adı, barkod numarası veya eczane ismi yazarak deneyebilirsiniz.</div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* RIGHT ACTION BUTTONS */}
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          {onSmartCartClick ? (
            <button
              type="button"
              onClick={onSmartCartClick}
              className="hidden items-center rounded-full bg-purple-700 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-purple-800 md:flex"
            >
              Akıllı Sepet
            </button>
          ) : (
            <Link
              to="/products"
              className="hidden items-center rounded-full bg-purple-700 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-purple-800 md:flex"
            >
              Akıllı Sepet
            </Link>
          )}

          {onAddListingClick ? (
            <button
              type="button"
              onClick={onAddListingClick}
              className="hidden items-center rounded-full bg-orange-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 lg:flex"
            >
              Ücretsiz İlan Ekle
            </button>
          ) : (
            <Link
              to="/products"
              className="hidden items-center rounded-full bg-orange-500 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 lg:flex"
            >
              Ücretsiz İlan Ekle
            </Link>
          )}

          {/* USER PROFILE DROPDOWN MENU */}
          <div ref={userMenuRef} className="relative hidden lg:block">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm font-bold text-gray-800 shadow-sm transition hover:border-orange-400 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-100"
              title="Hesabım ve Eczane Panelim"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-extrabold text-white">
                {username.substring(0, 2).toUpperCase()}
              </span>
              <span>{username}</span>
              <ChevronDown
                size={15}
                className={`text-gray-500 transition-transform duration-200 ${
                  isUserMenuOpen ? 'rotate-180 text-orange-500' : ''
                }`}
              />
            </button>

            {/* FLOATING ACCORDION / DROPDOWN PANEL */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                {/* PHARMACY HEADER CARD */}
                <div className="mb-2 rounded-xl bg-gradient-to-br from-orange-50 to-purple-50 p-3 border border-orange-100">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white font-extrabold text-sm shadow">
                      🏥
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-xs text-gray-900 truncate">
                        Kadıköy Şifa Eczanesi
                      </h4>
                      <p className="text-[11px] font-mono text-purple-700 font-bold">
                        GLN: 3245676600002
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-orange-100/70 pt-2 text-[10px]">
                    <span className="rounded bg-green-100 px-1.5 py-0.5 font-bold text-green-800">
                      ✓ Onaylı Eczacı
                    </span>
                    <span className="font-bold text-gray-600">★ 9.8 Puan</span>
                  </div>
                </div>

                {/* NAVIGATION OPTIONS */}
                <div className="space-y-0.5">
                  <Link
                    to="/account?tab=settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition ${
                      isTabActive('settings')
                        ? 'font-black text-orange-600 bg-orange-50'
                        : 'font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <UserRound size={15} className={isTabActive('settings') ? 'text-orange-600' : 'text-orange-500'} />
                    <span>Hesabım & Profilim</span>
                  </Link>

                  <Link
                    to="/account?tab=listings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition ${
                      isTabActive('listings')
                        ? 'font-black text-orange-600 bg-orange-50'
                        : 'font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Store size={15} className={isTabActive('listings') ? 'text-orange-600' : 'text-gray-400'} />
                    <span>İlanlarım & Ürünlerim</span>
                  </Link>

                  <Link
                    to="/account?tab=orders"
                    onClick={() => setIsUserMenuOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition ${
                      isTabActive('orders')
                        ? 'font-black text-orange-600 bg-orange-50'
                        : 'font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Package size={15} className={isTabActive('orders') ? 'text-orange-600' : 'text-gray-400'} />
                    <span>Siparişlerim</span>
                  </Link>

                  <Link
                    to="/account?tab=favorites"
                    onClick={() => setIsUserMenuOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition ${
                      isTabActive('favorites')
                        ? 'font-black text-orange-600 bg-orange-50'
                        : 'font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Heart size={15} className={isTabActive('favorites') ? 'text-orange-600 fill-orange-500' : 'text-red-500'} />
                    <span>Beğendiğim Eczane İlanları</span>
                  </Link>

                  <Link
                    to="/account?tab=transactions"
                    onClick={() => setIsUserMenuOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs transition ${
                      isTabActive('transactions')
                        ? 'font-black text-orange-600 bg-orange-50'
                        : 'font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard size={15} className={isTabActive('transactions') ? 'text-orange-600' : 'text-gray-400'} />
                      <span>Hesap Hareketlerim</span>
                    </div>
                    <span className="font-mono font-bold text-orange-600 text-[11px]">
                      ₺1.450
                    </span>
                  </Link>

                  <Link
                    to="/account?tab=einvoice"
                    onClick={() => setIsUserMenuOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition ${
                      isTabActive('einvoice')
                        ? 'font-black text-orange-600 bg-orange-50'
                        : 'font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <FileText size={15} className={isTabActive('einvoice') ? 'text-orange-600' : 'text-purple-600'} />
                    <span>e-Fatura İşlemlerim</span>
                  </Link>
                </div>

                <div className="my-1.5 border-t border-gray-100" />

                {/* LOGOUT BUTTON */}
                <Link
                  to="/login"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-500 hover:text-white shadow-sm"
                >
                  <LogOut size={15} />
                  <span>Çıkış Yap</span>
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE TOGGLE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 transition hover:text-gray-900 lg:hidden"
            title="Menü"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <button
            type="button"
            onClick={onMessagesClick}
            className="relative p-2 text-gray-600 transition hover:text-gray-900"
            title="Mesajlar"
          >
            <MessageCircleMore size={20} />
            {messageCount > 0 ? (
              <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                {messageCount > 9 ? '9+' : messageCount}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={onNotificationsClick}
            className="relative p-2 text-gray-600 transition hover:text-gray-900"
            title="Bildirimler"
          >
            <Bell size={20} />
            {notificationCount > 0 ? (
              <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {notificationCount}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={onCartClick}
            className="relative p-2 text-gray-600 transition hover:text-gray-900"
            title="Sepet"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 ? (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-0.5 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-2">
            <Link
              to="/account?tab=settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-lg bg-orange-50 px-3 py-2.5 text-xs font-bold text-orange-900"
            >
              <span>👤 Eczane Panelim (Kadıköy Şifa Eczanesi)</span>
              <span className="text-orange-600 font-mono">GLN: 3245676600002 →</span>
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onAddListingClick?.();
              }}
              className="w-full text-left rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white"
            >
              ➕ Ücretsiz İlan Ekle
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onSmartCartClick?.();
              }}
              className="w-full text-left rounded-lg bg-purple-700 px-3 py-2 text-xs font-bold text-white"
            >
              ⚡ Akıllı Sepet Optimizasyonu
            </button>
            <div className="my-1 border-t border-gray-100" />
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              📦 Tüm Pazaryeri İlaçları
            </Link>
            <Link
              to="/account?tab=settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              👤 Hesabım & Profilim
            </Link>
            <Link
              to="/account?tab=listings"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              📋 İlanlarım & Siparişlerim
            </Link>
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              🚪 Oturumu Kapat / Çıkış Yap
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
