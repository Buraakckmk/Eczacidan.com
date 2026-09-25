import { Award, CreditCard, Lock, ShieldCheck, Sparkles, Truck } from 'lucide-react';

const BADGES = [
  { icon: ShieldCheck, text: '🛡️ T.C. Sağlık Bakanlığı İTS Uyumlu Altyapı' },
  { icon: Truck, text: '🚚 İstanbul İçi Aynı Gün Kurye & 24 Saat Kargo' },
  { icon: CreditCard, text: '💳 BDDK Onaylı %100 Güvenli Havuz Ödeme' },
  { icon: Sparkles, text: '✨ Eczanelere Özel Toplu İskonto Fırsatları' },
  { icon: Award, text: '🏅 Türkiye Eczacılar Birliği Üyelik Güvencesi' },
  { icon: Lock, text: '🔒 256-Bit SSL Şifreli B2B Eczane Alışverişi' },
];

export function TrustBadgesBar() {
  return (
    <div className="relative overflow-hidden border-b border-orange-600/30 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 py-2 text-white shadow-xs select-none">
      <div className="animate-marquee gap-10 pr-10">
        {[...BADGES, ...BADGES].map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <div key={idx} className="flex shrink-0 items-center gap-2 text-xs font-extrabold tracking-wide whitespace-nowrap">
              <Icon size={16} className="text-amber-200 shrink-0" />
              <span>{badge.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
