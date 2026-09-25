import { Mail, Send } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Toast } from './Toast';

interface FooterProps {
  showNewsletter?: boolean;
}

export function Footer({ showNewsletter = false }: FooterProps) {
  const [email, setEmail] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setToastMessage(`🎉 E-posta adresiniz (${email}) bültenimize başarıyla eklendi!`);
    setEmail('');
  };

  return (
    <footer className="border-t border-gray-200 bg-white font-sans text-gray-600">
      {toastMessage ? <Toast message={toastMessage} onClose={() => setToastMessage(null)} /> : null}

      {/* TOP ORANGE NEWSLETTER BULTEN STRIP (HOMEPAGE ONLY) */}
      {showNewsletter && (
        <div className="bg-orange-500 py-6 text-white shadow-xs">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-0.5">
                <h3 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                  <Mail size={18} className="text-white shrink-0" />
                  Eczanenize Özel Fırsat İlanlarından Haberdar Olun
                </h3>
                <p className="text-xs text-orange-100 font-medium">
                  Haftalık %60+ iskontolu ve yakın miadlı B2B ilaç bültenimize ücretsiz kaydolun.
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="flex w-full max-w-md items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Eczane e-posta adresiniz..."
                  className="w-full rounded-xl border-0 bg-white px-4 py-2.5 text-xs font-medium text-gray-900 placeholder-gray-400 outline-none shadow-sm focus:ring-2 focus:ring-white/50 transition"
                  required
                />
                <button
                  type="submit"
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 border border-orange-400/40 px-5 py-2.5 text-xs font-black text-white shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Send size={13} /> Abone Ol
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MAIN FOOTER CONTENT GRID */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* COL 1: BRAND & BIO */}
          <div className="space-y-3">
            <Link to="/products" className="inline-block text-2xl font-black tracking-tight text-gray-900">
              eczacıdan<span className="text-orange-500">.com</span>
            </Link>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Türkiye’nin T.C. Sağlık Bakanlığı İTS entegreli eczaneler arası B2B takas, ilaç ve medikal tedarik pazaryeri altyapısı.
            </p>
          </div>

          {/* COL 2: PAZARYERİ MENÜSÜ */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900">
              Pazaryeri Menüsü
            </h4>
            <ul className="space-y-2 text-xs font-medium text-gray-600">
              <li>
                <Link to="/products" className="hover:text-orange-600 transition-colors">
                  Fırsat & Vitrin Ürünleri
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-orange-600 transition-colors">
                  Pazaryeri Kategorileri
                </Link>
              </li>
              <li>
                <Link to="/account?tab=listings" className="hover:text-orange-600 transition-colors">
                  Hesabım & İlan Yönetimi
                </Link>
              </li>
              <li>
                <Link to="/account?tab=orders" className="hover:text-orange-600 transition-colors">
                  Siparişlerim & Kargo Takibi
                </Link>
              </li>
              <li>
                <Link to="/account?tab=einvoice" className="hover:text-orange-600 transition-colors">
                  e-Fatura & Muhasebe İşlemleri
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 3: KURUMSAL & YASAL */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900">
              Kurumsal & Yasal
            </h4>
            <ul className="space-y-2 text-xs font-medium text-gray-600">
              <li>
                <Link to="/legal/about" className="hover:text-orange-600 transition-colors">
                  Hakkımızda & Vizyonumuz
                </Link>
              </li>
              <li>
                <Link to="/legal/terms" className="hover:text-orange-600 transition-colors">
                  B2B Kullanıcı Sözleşmesi
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className="hover:text-orange-600 transition-colors">
                  Gizlilik ve KVKK Politikası
                </Link>
              </li>
              <li>
                <Link to="/legal/its" className="hover:text-orange-600 transition-colors">
                  İTS ve İlaç Mevzuatı Bilgilendirmesi
                </Link>
              </li>
              <li>
                <Link to="/legal/refund" className="hover:text-orange-600 transition-colors">
                  İptal, İade ve Değişim Şartları
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 4: İLETİŞİM & DESTEK */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-900">
              Eczacı Destek & İletişim
            </h4>
            <ul className="space-y-2 text-xs text-gray-600 font-medium">
              <li className="text-gray-700">
                Maslak Mah. Büyükdere Cad. No:122, Sarıyer / İstanbul
              </li>
              <li>
                Tel: <span className="font-bold text-gray-900">0850 308 00 00</span>
              </li>
              <li>
                E-posta: <span className="text-gray-900 font-medium">destek@eczacidan.com</span>
              </li>
              <li className="text-gray-500 text-[11px]">
                Çalışma Saatleri: Hafta İçi 08:30 - 19:30
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* BOTTOM CLEAN COPYRIGHT BAR */}
      <div className="border-t border-gray-100 bg-gray-50/60 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 text-xs text-gray-500 font-medium">
          <p className="w-full text-center md:text-left">
            © {new Date().getFullYear()} <strong className="text-gray-800">Eczacıdan.com</strong> — Tüm Hakları Saklıdır. Türkiye Eczacılar Birliği üyesi eczanelere özel B2B platformudur.
          </p>
        </div>
      </div>
    </footer>
  );
}
