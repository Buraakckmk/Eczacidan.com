import { ArrowLeft, CheckCircle2, FileText, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

type LegalDocType = 'kvkk' | 'mevzuat' | 'terms' | 'privacy';

export default function LegalPage() {
  const { docType } = useParams<{ docType?: string }>();
  const [activeTab, setActiveTab] = useState<LegalDocType>(
    (docType as LegalDocType) || 'kvkk'
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-black tracking-tight text-gray-900">
              Eczacıdan<span className="text-orange-500">.com</span>
            </span>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
          >
            <ArrowLeft size={14} />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* SIDEBAR NAVIGATION */}
          <aside className="md:col-span-4 space-y-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-xs space-y-1">
              <h3 className="px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-gray-400">
                Yasal & Mevzuat Belgeleri
              </h3>

              {[
                { id: 'kvkk' as const, label: 'KVKK Aydınlatma Metni', icon: ShieldCheck },
                { id: 'mevzuat' as const, label: 'Eczacılık Mevzuatı Bildirimi', icon: FileText },
                { id: 'terms' as const, label: 'Kullanım Koşulları', icon: CheckCircle2 },
                { id: 'privacy' as const, label: 'Gizlilik & Güvenlik Politikası', icon: Lock },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-extrabold transition text-left ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-white' : 'text-orange-500'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-xs space-y-2 text-orange-950 font-medium">
              <span className="font-bold block">🔒 Resmi Mevzuat Güvencesi</span>
              <p className="leading-relaxed">
                Eczacıdan.com platformunda gerçekleşen tüm işlemler T.C. Sağlık Bakanlığı, Türkiye İlaç ve Tıbbi Cihaz Kurumu (TİTCK) ve GİB e-Fatura standartlarına %100 uyumludur.
              </p>
            </div>
          </aside>

          {/* DOCUMENT CONTENT */}
          <section className="md:col-span-8">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
              {/* TAB 1: KVKK AYDINLATMA METNİ */}
              {activeTab === 'kvkk' && (
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-4">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-extrabold text-orange-800 border border-orange-200">
                      Yasal Metin • Son Güncelleme: 08.08.2026
                    </span>
                    <h1 className="text-2xl font-black text-gray-900 mt-2">
                      6698 Sayılı KVKK Uyarınca Aydınlatma Metni
                    </h1>
                  </div>

                  <div className="text-xs text-gray-600 space-y-4 leading-relaxed font-medium">
                    <p>
                      <strong>Eczacıdan.com B2B Teknolojileri A.Ş.</strong> (“Şirket”) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca onaylı eczacı üyelerimizin kişisel verilerinin gizliliğine ve güvenliğine azami önem vermekteyiz.
                    </p>

                    <h3 className="text-sm font-bold text-gray-900">1. Veri Sorumlusunun Kimliği</h3>
                    <p>
                      KVKK uyarınca kişisel verileriniz; veri sorumlusu sıfatıyla Kadıköy / İstanbul adresinde mukim Eczacıdan.com B2B Teknolojileri A.Ş. tarafından aşağıda açıklanan kapsamda işlenmektedir.
                    </p>

                    <h3 className="text-sm font-bold text-gray-900">2. İşlenen Kişisel Veriler ve İşleme Amaçları</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Eczacı Kimlik ve İletişim Bilgileri:</strong> Ad, soyad, T.C. kimlik numarası, e-posta adresi, telefon numarası.</li>
                      <li><strong>Eczane Ruhsat & GLN Bilgileri:</strong> Sağlık Bakanlığı GLN numarası, eczane unvanı, il/ilçe ruhsat kaydı.</li>
                      <li><strong>Finansal ve Fatura Bilgileri:</strong> Banka IBAN bilgileri, vergi dairesi, vergi numarası ve GİB e-fatura kayıtları.</li>
                    </ul>

                    <h3 className="text-sm font-bold text-gray-900">3. Verilerin Aktarıldığı Taraflar</h3>
                    <p>
                      Toplanan kişisel verileriniz; sadece resmi B2B ticaret süreçlerinin yürütülmesi, anlaşmalı ecza kargo lojistik firmaları ve yasal zorunluluklar çerçevesinde Sağlık Bakanlığı ile Gelir İdaresi Başkanlığı sistemlerine aktarılmaktadır.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: ECZACILIK MEVZUATI BİLDİRİMİ */}
              {activeTab === 'mevzuat' && (
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-4">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-extrabold text-orange-800 border border-orange-200">
                      Yasal Bildirim • 6197 Sayılı Eczacılar Kanunu Uyumlu
                    </span>
                    <h1 className="text-2xl font-black text-gray-900 mt-2">
                      Eczacılık Mevzuatı ve GLN Doğrulama Bildirimi
                    </h1>
                  </div>

                  <div className="text-xs text-gray-600 space-y-4 leading-relaxed font-medium">
                    <p>
                      Eczacıdan.com platformu; 6197 sayılı Eczacılar ve Eczaneler Hakkında Kanun ile Eczacılar ve Eczaneler Hakkında Yönetmelik hükümlerine tam uyumlu olarak işletilmektedir.
                    </p>

                    <h3 className="text-sm font-bold text-gray-900">1. Sadece Onaylı Eczacı Erişimi</h3>
                    <p>
                      Platforma halka açık perakende satış kesinlikle yapılmaz. Sadece T.C. Sağlık Bakanlığı İlaç Takip Sistemi (İTS) ve GLN kaydı bulunan serbest eczacılar ve yetkili ecza depoları üye olabilir.
                    </p>

                    <h3 className="text-sm font-bold text-gray-900">2. İlaç Takas ve Stok Dengeleme</h3>
                    <p>
                      Eczaneler arası ürün aktarımlarında İTS bildirim zorunlulukları gözetilir. Miad kontrollü ürünler için sıcaklık takipli ecza lojistiği kullanılır.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: KULLANIM KOŞULLARI */}
              {activeTab === 'terms' && (
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-4">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-extrabold text-orange-800 border border-orange-200">
                      Kullanım Koşulları & Sözleşmesi
                    </span>
                    <h1 className="text-2xl font-black text-gray-900 mt-2">
                      Eczacıdan.com Platform Kullanım Sözleşmesi
                    </h1>
                  </div>

                  <div className="text-xs text-gray-600 space-y-4 leading-relaxed font-medium">
                    <p>
                      Bu kullanım sözleşmesi, Eczacıdan.com web sitesi ve mobil uygulamalarını kullanan tüm onaylı eczacı üyelerin hak ve sorumluluklarını düzenlemektedir.
                    </p>

                    <h3 className="text-sm font-bold text-gray-900">1. İlan Açma ve Doğruluk Yükümlülüğü</h3>
                    <p>
                      Satıcı eczane, yayınladığı ilanlardaki son kullanma tarihi (SKT), stok adedi ve kutu kondisyonu bilgilerinin doğru olduğunu taahhüt eder.
                    </p>

                    <h3 className="text-sm font-bold text-gray-900">2. Sipariş ve Teslimat Süreçleri</h3>
                    <p>
                      Onaylanan siparişler en geç 24 saat içerisinde kargoya teslim edilir. Ürün alıcıya ulaştığında onay verilir ve ödeme aktarılır.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: GİZLİLİK & GÜVENLİK */}
              {activeTab === 'privacy' && (
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-4">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-[10px] font-extrabold text-orange-800 border border-orange-200">
                      Güvenlik Standartları
                    </span>
                    <h1 className="text-2xl font-black text-gray-900 mt-2">
                      Gizlilik ve Bilgi Güvenliği Politikası
                    </h1>
                  </div>

                  <div className="text-xs text-gray-600 space-y-4 leading-relaxed font-medium">
                    <p>
                      Eczacıdan.com; 256-Bit SSL şifreleme, güvenlik duvarı korumaları ve yüksek seviyeli veri tabanı izolasyon teknolojileri ile korunmaktadır.
                    </p>

                    <h3 className="text-sm font-bold text-gray-900">1. Şifreleme ve Kart Güvenliği</h3>
                    <p>
                      Ödeme altyapımızda kredi kartı veya IBAN bilgileriniz hiçbir şekilde sunucularımızda tutulmaz; doğrudan BDDK lisanslı ödeme kuruluşlarına aktarılır.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
