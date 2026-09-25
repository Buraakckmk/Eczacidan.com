import { createContext, useContext } from 'react';
import { CartItem, Listing, NotificationItem } from '../data/mockData';

export interface LayoutContextType {
  allListings: Listing[];
  setAllListings: React.Dispatch<React.SetStateAction<Listing[]>>;
  addListing: (listing: Listing) => void;
  deleteListing: (id: string) => void;
  updateListing: (id: string, updates: Partial<Listing>) => void;

  cartItems: CartItem[];
  cartTotal: number;
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (item: CartItem) => void;
  updateCartQuantity: (listingId: string, quantity: number) => void;
  removeFromCart: (listingId: string) => void;
  clearCart: () => void;
  setToastMessage: (msg: string) => void;

  favoriteListingIds: string[];
  toggleFavorite: (listingId: string) => void;
  isFavorite: (listingId: string) => boolean;

  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  markNotificationRead: (id: string) => void;
  clearReadNotifications: () => void;
  unreadMessageCount: number;

  openCart: () => void;
  closeCart: () => void;
  openNotifications: () => void;
  closeNotifications: () => void;
  openMessages: () => void;
  closeMessages: () => void;
  openAddListing: () => void;
  closeAddListing: () => void;
  openSmartCart: () => void;
  closeSmartCart: () => void;

  setCartCount: (count: number) => void;
  setNotificationCount: (count: number) => void;
  setMessageCount: (count: number) => void;
  setOnSmartCartClick: (fn?: () => void) => void;
  setOnAddListingClick: (fn?: () => void) => void;
  setOnMessagesClick: (fn?: () => void) => void;
  setOnNotificationsClick: (fn?: () => void) => void;
  setOnCartClick: (fn?: () => void) => void;
  setActiveCategory: (category: string) => void;
  setOnCategoryClick: (fn?: (category: string) => void) => void;
  setSearchSuggestions: (
    suggestions: Array<{ id: string; name: string; barcode: string; category: string; psf: number }>,
  ) => void;
  setOnSelectSuggestion: (fn?: (id: string) => void) => void;
  setSellerSuggestions: (
    sellers: Array<{ sellerName: string; sellerCity: string; sellerRating: number; sellerListingCount: number }>,
  ) => void;
  setOnSelectSeller: (fn?: (sellerName: string) => void) => void;
}

export const LayoutContext = createContext<LayoutContextType | null>(null);

export function useLayoutContext() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayoutContext must be used inside <Layout>');
  return ctx;
}
