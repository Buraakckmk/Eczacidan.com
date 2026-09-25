import { ChevronLeft, ChevronRight, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

const BANNERS = [
  {
    id: 1,
    title: 'Eczaneler Arası B2B İlaç & Medikal Fırsatları',
    subtitle: 'Fazla stoklarınızı nakde dönüştürün, %60’a varan iskontolu takviye ve medikal ürünleri keşfedin.',
    badge: '🔥 Haftanın Kampanyası',
    bgGradient: 'from-orange-600 via-amber-600 to-purple-900',
    icon: Sparkles,
  },
  {
    id: 2,
    title: 'T.C. İTS & Sağlık Bakanlığı Tam Uyumlu Altyapı',
    subtitle: 'Otomatik İTS bildirimi, e-Fatura kesimi ve BDDK lisanslı güvenli havuz ödeme güvencesi.',
    badge: '🛡️ %100 Güvenli Eczane Ticareti',
    bgGradient: 'from-indigo-900 via-purple-900 to-slate-950',
    icon: ShieldCheck,
  },
  {
    id: 3,
    title: 'Aynı Gün Kurye & 24 Saat Hızlı Teslimat',
    subtitle: 'İstanbul içi aynı gün kurye, tüm Türkiye’ye 24 saatte hızlı ve sigortalı ilaç sevkıyatı.',
    badge: '🚀 Hızlı Lojistik',
    bgGradient: 'from-emerald-800 via-teal-900 to-slate-900',
    icon: TrendingUp,
  },
];

export function HeroBannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200 shadow-xl group">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {BANNERS.map((banner) => {
          const Icon = banner.icon;
          return (
            <div
              key={banner.id}
              className={`w-full shrink-0 bg-gradient-to-r ${banner.bgGradient} p-8 sm:p-12 text-white min-h-[200px] sm:min-h-[240px] flex flex-col justify-center relative`}
            >
              <div className="max-w-2xl space-y-3 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-extrabold backdrop-blur-md border border-white/30 text-amber-200">
                  <Icon size={14} /> {banner.badge}
                </span>
                <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
                  {banner.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-200 font-medium leading-relaxed">
                  {banner.subtitle}
                </p>
              </div>

              {/* BACKGROUND WATERMARK ICON */}
              <Icon size={240} className="absolute right-6 -bottom-10 opacity-10 text-white pointer-events-none hidden sm:block" />
            </div>
          );
        })}
      </div>

      {/* ARROWS */}
      <button
        type="button"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md transition hover:bg-black/60 cursor-pointer opacity-80 group-hover:opacity-100"
        title="Önceki Slayt"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md transition hover:bg-black/60 cursor-pointer opacity-80 group-hover:opacity-100"
        title="Sonraki Slayt"
      >
        <ChevronRight size={20} />
      </button>

      {/* PAGINATION DOTS */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {BANNERS.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentSlide(idx)}
            className={`h-2.5 rounded-full transition-all cursor-pointer ${
              currentSlide === idx ? 'w-8 bg-amber-400' : 'w-2.5 bg-white/50 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
