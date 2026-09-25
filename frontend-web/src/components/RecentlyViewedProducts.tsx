import { Clock, Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Listing } from '../data/mockData';
import { MOCK_LISTINGS } from '../data/mockData';

interface RecentlyViewedProductsProps {
  onAddToCart: (listing: Listing) => void;
  onToggleFavorite: (id: string, seller: string) => void;
  isFavorite: (id: string) => boolean;
}

export function RecentlyViewedProducts({
  onAddToCart,
  onToggleFavorite,
  isFavorite,
}: RecentlyViewedProductsProps) {
  const [recentListings, setRecentListings] = useState<Listing[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('eczacidan_recently_viewed');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentListings(parsed);
          return;
        }
      }
    } catch {}

    // Fallback initial items from MOCK_LISTINGS for demonstration
    setRecentListings(MOCK_LISTINGS.slice(0, 4));
  }, []);

  const handleClear = () => {
    localStorage.removeItem('eczacidan_recently_viewed');
    setRecentListings([]);
  };

  if (recentListings.length === 0) return null;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="text-purple-600" size={22} />
          <h3 className="text-lg font-black text-gray-900 tracking-tight">Son İncelediğiniz Ürünler</h3>
          <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700">
            {recentListings.length} Ürün
          </span>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-bold text-gray-400 hover:text-red-500 transition flex items-center gap-1 cursor-pointer"
        >
          <Trash2 size={14} /> Temizle
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recentListings.map((listing) => {
          const isFav = isFavorite(listing.id);
          return (
            <div
              key={`recent-${listing.id}`}
              className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-gray-50/50 p-4 hover:border-purple-300 hover:bg-white hover:shadow-md transition"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                    SKT: {listing.skt}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(listing.id, listing.sellerName)}
                    className="text-gray-300 hover:text-red-500 cursor-pointer"
                  >
                    <Heart size={16} className={isFav ? 'fill-red-500 text-red-500' : ''} />
                  </button>
                </div>
                <h4 className="font-extrabold text-xs text-gray-900 line-clamp-2 h-8">
                  {listing.productName}
                </h4>
                <p className="text-[11px] font-semibold text-gray-500 truncate mt-1">
                  🏥 {listing.sellerName}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-center justify-between">
                <div>
                  <span className="text-base font-black text-orange-600">{listing.unitPrice.toFixed(2)} TL</span>
                </div>
                <button
                  type="button"
                  onClick={() => onAddToCart(listing)}
                  className="rounded-xl bg-orange-500 hover:bg-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <ShoppingCart size={13} /> Ekle
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
