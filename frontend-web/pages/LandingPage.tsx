import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  Coins,
  FileCheck2,
  Lock,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Truck,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  // Interactive Eczane Kazanç Hesaplayıcı State
  const [monthlyVolume, setMonthlyVolume] = useState<number>(35000);

  // Calculated Metrics
  const estimatedSavings = Math.round(monthlyVolume * 0.22);
  const estimatedProfitBoost = Math.round(monthlyVolume * 0.18);
  const riskReduction = Math.min(98, Math.round(monthlyVolume / 500 + 75));

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Eczacıdan.com'a kimler üye olabilir?",
      a: "Platformumuza sadece Sağlık Bakanlığı ve T.C. Eczacılar Odası'na kayıtlı, faal GLN (Global Lokasyon Numarası) sahibi yetkili eczacılar kabul edilmektedir. Eczane dışı kurum veya üçüncü şahıs üyelikleri kesinlikle engellenir.",
    },
    {
      q: "GLN ve Eczane doğrulama süreci nasıl işler?",
      a: "Kayıt olurken girdiğiniz GLN ve İl Sağlık Ruhsat bilgileriniz, ekibimiz tarafından dakikalar içinde resmi veritabanlarından kontrol edilir. Onay ardından hesabınız aktifleşir ve pazaryeri erişimine açılır.",
    },
    {
      q: "Ödemeler ve e-Fatura işlemleri nasıl yürütülmektedir?",
      a: "Tüm alım-satım ve takas işlemlerinde GİB (Gelir İdaresi Başkanlığı) onaylı 1. sınıf e-Fatura sistemi çalışır. Ödemeler 256-Bit SSL korumalı Havale/EFT ve Kredi Kartı güvencesiyle 3 iş günü içinde satıcı eczaneye aktarılır.",
    },
    {
      q: "İlaç ve takviye kargo süreçleri miad korumalı mı?",
      a: "Evet! Anlaşmalı özel ecza lojistiği kuryelerimiz ile ürünler sıcaklık takipli ve korumalı paketlerde teslim alınır. Aynı gün kargo seçeneğiyle eczaneler arası teslimat süresi en aza indirilir.",
    },
    {
      q: "Platforma üye olmak veya ilan vermek ücretli mi?",
      a: "Eczacıdan.com'a kayıt olmak, ilan açmak ve ürün araması yapmak %100 ücretsizdir. Sadece gerçekleşen başarıyla tamamlanmış siparişlerde minimum seviyede işlem güvence payı alınır.",
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-orange-500 selection:text-white">
      {/* Google Rich Snippets FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ── 1. HEADER / NAVBAR ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          {/* CLEAN LOGO: BLACK Eczacıdan + ORANGE .com */}
          <Link to="/" className="flex items-center group">
            <span className="text-2xl font-black tracking-tight text-gray-900">
              Eczacıdan<span className="text-orange-500">.com</span>
            </span>
          </Link>

          {/* NAV LINKS */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-700">
            <a href="#hakkimizda" className="hover:text-orange-600 transition">
              Hakkımızda
            </a>
            <a href="#nasil-calisir" className="hover:text-orange-600 transition">
              Nasıl Çalışır?
            </a>
            <a href="#avantajlar" className="hover:text-orange-600 transition">
              Avantajlar
            </a>
            <a href="#hesaplayici" className="hover:text-orange-600 transition">
              Kazanç Hesaplayıcı
            </a>
            <a href="#sss" className="hover:text-orange-600 transition">
              SSS
            </a>
          </nav>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/login')}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-extrabold text-gray-800 transition hover:bg-gray-50 hover:border-gray-400 shadow-xs"
            >
              Giriş Yap
            </button>
            <button
              onClick={() => navigate('/register')}
              className="rounded-xl bg-orange-500 hover:bg-orange-600 px-4.5 py-2 text-xs font-extrabold text-white shadow-md shadow-orange-500/20 active:scale-95 transition flex items-center gap-1"
            >
              <span>Üye Ol</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate('/corporate-register')}
              className="rounded-xl border border-orange-500/30 bg-orange-50 px-4 py-2 text-xs font-extrabold text-orange-900 transition hover:bg-orange-100 shadow-xs flex items-center gap-1.5"
            >
              <Building2 size={14} className="text-orange-600" />
              <span>Kurumsal Üyelik</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. HERO SECTION (LIGHT THEME) ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-white to-gray-50 pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Soft background ambient glow */}
        <div className="absolute top-1/4 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute top-1/3 right-10 -z-10 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            {/* LEFT TEXT CONTENT */}
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100/80 px-3.5 py-1.5 text-xs font-extrabold text-orange-900 shadow-xs">
                <ShieldCheck size={16} className="text-orange-600" />
                <span>%100 Sağlık Bakanlığı & GLN Onaylı Eczacı Platformu</span>
              </div>

              <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-[1.15]">
                Eczanenizin Stok Gücünü Artırın,{' '}
                <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent">
                  İlaç & Takas Ticaretinde Kazanın
                </span>
              </h1>

              <p className="text-base text-gray-600 sm:text-lg leading-relaxed max-w-2xl font-medium">
                Türkiye genelindeki <strong className="text-gray-900 font-extrabold">5.400+ doğrulanmış eczacı</strong> ile fazla stoklarınızı anında takasa açın. Uygun fiyatlı, miad kontrollü ilaç ve gıda takviyelerine 7/24 kesintisiz erişin.
              </p>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate('/register')}
                  className="rounded-2xl bg-orange-500 hover:bg-orange-600 px-7 py-3.5 text-sm font-black text-white shadow-xl shadow-orange-500/25 hover:scale-[1.02] active:scale-95 transition flex items-center gap-2"
                >
                  <span>🚀 Ücretsiz Eczane Hesabı Oluştur</span>
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="rounded-2xl border border-gray-300 bg-white px-6 py-3.5 text-sm font-bold text-gray-800 hover:bg-gray-100 transition flex items-center gap-2 shadow-sm"
                >
                  <Store size={18} className="text-orange-500" />
                  <span>Pazaryerini Keşfet</span>
                </button>
              </div>

              {/* TRUST BADGES */}
              <div className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                  <span>GLN Onaylı Üye</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  <FileCheck2 size={16} className="text-orange-600 shrink-0" />
                  <span>GİB e-Fatura</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  <Lock size={16} className="text-amber-600 shrink-0" />
                  <span>256-Bit SSL Koruma</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  <Truck size={16} className="text-blue-600 shrink-0" />
                  <span>Aynı Gün Kargo</span>
                </div>
              </div>
            </div>

            {/* RIGHT GRAPHIC MOCKUP */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl backdrop-blur-xl">
                {/* Floating Badge */}
                <div className="absolute -top-4 -right-4 rounded-2xl bg-orange-500 p-3 text-white shadow-xl animate-bounce">
                  <Sparkles size={20} />
                </div>

                {/* Header Mock */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="ml-2 text-xs font-bold text-gray-700">Eczacıdan.com Canlı B2B Panel</span>
                  </div>
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-extrabold text-green-800 border border-green-200">
                    🟢 Canlı Sistem
                  </span>
                </div>

                {/* Card Items preview */}
                <div className="space-y-3">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5 flex items-center justify-between hover:border-orange-200 transition">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 font-bold text-sm shadow-xs">
                        💊
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-gray-900">Solgar Omega-3 1000 mg</h4>
                        <p className="text-[10px] text-gray-500 font-medium">Miad: 12/2026 • MF: 10+1</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-orange-600">420,00 ₺</span>
                      <span className="block text-[9px] text-green-700 font-extrabold">%18 İndirimli</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5 flex items-center justify-between hover:border-orange-200 transition">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 font-bold text-sm shadow-xs">
                        👁️
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-gray-900">Systane Complete Göz Damlası</h4>
                        <p className="text-[10px] text-gray-500 font-medium">Miad: 09/2026 • Stok: 24 Adet</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-orange-600">185,50 ₺</span>
                      <span className="block text-[9px] text-green-700 font-extrabold">Stokta Var</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5 flex items-center justify-between hover:border-orange-200 transition">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 font-bold text-sm shadow-xs">
                        ✨
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-gray-900">La Roche-Posay Effaclar Duo</h4>
                        <p className="text-[10px] text-gray-500 font-medium">Miad: 11/2027 • Dermokozmetik</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-orange-600">340,00 ₺</span>
                      <span className="block text-[9px] text-purple-700 font-extrabold">Özel Teklif</span>
                    </div>
                  </div>
                </div>

                {/* Bottom stats banner inside mockup */}
                <div className="mt-4 rounded-xl bg-orange-50 border border-orange-200 p-3 text-center">
                  <span className="text-xs font-bold text-orange-900">
                    ⚡ Son 24 Saatte 1.480 Kutu Ürün Eczaneler Arası Takas Edildi!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. METRICS / STATS SECTION ───────────────────────────────────── */}
      <section className="border-y border-gray-200 bg-white py-10 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="text-center">
              <span className="block text-3xl sm:text-4xl font-black text-gray-900">5.400+</span>
              <span className="mt-1 block text-xs font-bold text-gray-500">Onaylı Aktif Eczacı</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl sm:text-4xl font-black text-orange-500">120.000+</span>
              <span className="mt-1 block text-xs font-bold text-gray-500">Aktif Ürün & İlaç İlanı</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl sm:text-4xl font-black text-amber-600">₺45M+</span>
              <span className="mt-1 block text-xs font-bold text-gray-500">Aylık İşlem Hacmi</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl sm:text-4xl font-black text-green-600">%100</span>
              <span className="mt-1 block text-xs font-bold text-gray-500">GİB & Mevzuat Uyumlu</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. ABOUT US (HAKKIMIZDA) ─────────────────────────────────────── */}
      <section id="hakkimizda" className="py-20 lg:py-28 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-orange-600">
              Biz Kimiz?
            </h2>
            <h3 className="text-3xl font-black text-gray-900 sm:text-4xl">
              Türkiye'nin İlk ve Tek Sadece Eczacılara Özel B2B Platformu
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-medium">
              Eczacıdan.com; eczaneler arasındaki fazla stokları ekonomiye kazandırmak, ilaç ve takviye alım maliyetlerini düşürmek ve tamamen yasal mevzuat sınırları içerisinde eczacılar arası güvenli takas sağlamak için tasarlanmış bağımsız B2B pazar yeridir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
            <div className="rounded-3xl border border-gray-200 bg-white p-7 space-y-3.5 shadow-sm hover:border-orange-300 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 font-bold">
                <ShieldCheck size={24} />
              </div>
              <h4 className="text-lg font-extrabold text-gray-900">GLN & Ruhsat Doğrulaması</h4>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Platforma üye olan her eczane Sağlık Bakanlığı GLN kaydı ve eczacı odası sicili ile manuel kontrolden geçer. Yetkisiz satıcılara kapalıdır.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-7 space-y-3.5 shadow-sm hover:border-orange-300 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 font-bold">
                <Coins size={24} />
              </div>
              <h4 className="text-lg font-extrabold text-gray-900">Sıfır Stok Maliyeti</h4>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Eczanenizde miadı yaklaşan veya fazla kalan ürünleri anında diğer eczacı meslektaşlarınıza satabilir ya da takas ederek nakde çevirebilirsiniz.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-7 space-y-3.5 shadow-sm hover:border-orange-300 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600 font-bold">
                <FileCheck2 size={24} />
              </div>
              <h4 className="text-lg font-extrabold text-gray-900">GİB Entegre e-Fatura</h4>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Gerçekleşen tüm siparişlerde resmi e-faturanız otomatik oluşturulur. Gelir İdaresi Başkanlığı mevzuatına %100 tam uyumludur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. HOW IT WORKS (NASIL ÇALIŞIR?) ────────────────────────────── */}
      <section id="nasil-calisir" className="py-20 lg:py-28 bg-white border-y border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-orange-600">
              Basit & Güvenli Akış
            </h2>
            <h3 className="text-3xl font-black text-gray-900 sm:text-4xl">
              4 Adımda Eczacıdan.com B2B Pazaryeri
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-14">
            <div className="relative rounded-3xl border border-gray-200 bg-gray-50/80 p-6 space-y-3 shadow-xs">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white font-black text-sm shadow-sm">
                1
              </span>
              <h4 className="text-base font-extrabold text-gray-900">GLN ile Üye Olun</h4>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Eczanenizin GLN numarası ve bilgileri ile üyelik formunu 1 dakikada doldurun.
              </p>
            </div>

            <div className="relative rounded-3xl border border-gray-200 bg-gray-50/80 p-6 space-y-3 shadow-xs">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white font-black text-sm shadow-sm">
                2
              </span>
              <h4 className="text-base font-extrabold text-gray-900">İlan Verin veya Arayın</h4>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Fazla stoklarınızı ücretsiz ilan olarak açın veya ihtiyacınız olan ilaçları arayın.
              </p>
            </div>

            <div className="relative rounded-3xl border border-gray-200 bg-gray-50/80 p-6 space-y-3 shadow-xs">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500 text-white font-black text-sm shadow-sm">
                3
              </span>
              <h4 className="text-base font-extrabold text-gray-900">Güvenli Sipariş Verin</h4>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Sepetinizi oluşturup 256-bit SSL korumalı altyapıyla siparişinizi tamamlayın.
              </p>
            </div>

            <div className="relative rounded-3xl border border-gray-200 bg-gray-50/80 p-6 space-y-3 shadow-xs">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-green-500 text-white font-black text-sm shadow-sm">
                4
              </span>
              <h4 className="text-base font-extrabold text-gray-900">Aynı Gün Kargo & e-Fatura</h4>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Ürünler sıcaklık takipli lojistikle eczanenize gelsin, e-faturanız paneline yüklensin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. EARNINGS CALCULATOR (KAZANÇ HESAPLAYICI) ───────────────────── */}
      <section id="hesaplayici" className="py-20 lg:py-28 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-8 sm:p-12 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

            <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
              <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-bold text-orange-400 border border-orange-500/30">
                📊 Eczane Kazanç & Tasarruf Simülatörü
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Aylık Stok & Takas Hacminizi Hesaplayın
              </h3>
              <p className="text-xs text-gray-300 font-medium">
                Eczanenizdeki fazla stokları Eczacıdan.com üzerinde takasa açarak elde edeceğiniz tahmini aylık kazancı görün.
              </p>
            </div>

            {/* SLIDER INPUT */}
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between text-sm font-bold text-white">
                <span>Aylık Fazla Stok Hacminiz:</span>
                <span className="text-2xl font-black text-orange-400">
                  {monthlyVolume.toLocaleString('tr-TR')} ₺
                </span>
              </div>

              <input
                type="range"
                min={5000}
                max={200000}
                step={5000}
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                className="w-full h-3 rounded-lg bg-gray-700 accent-orange-500 cursor-pointer"
              />

              <div className="flex justify-between text-[11px] font-mono text-gray-400">
                <span>5.000 ₺</span>
                <span>100.000 ₺</span>
                <span>200.000 ₺</span>
              </div>

              {/* RESULT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="rounded-2xl bg-gray-800/90 border border-gray-700/80 p-4 text-center">
                  <span className="block text-xs font-medium text-gray-300">Tahmini Stok Maliyet Tasarrufu</span>
                  <span className="block text-2xl font-black text-green-400 mt-1">
                    +{estimatedSavings.toLocaleString('tr-TR')} ₺
                  </span>
                </div>

                <div className="rounded-2xl bg-gray-800/90 border border-gray-700/80 p-4 text-center">
                  <span className="block text-xs font-medium text-gray-300">Aylık Eczane Kâr Artışı</span>
                  <span className="block text-2xl font-black text-orange-400 mt-1">
                    +{estimatedProfitBoost.toLocaleString('tr-TR')} ₺
                  </span>
                </div>

                <div className="rounded-2xl bg-gray-800/90 border border-gray-700/80 p-4 text-center">
                  <span className="block text-xs font-medium text-gray-300">Miad Geçme Riski Önleme</span>
                  <span className="block text-2xl font-black text-amber-400 mt-1">
                    %{riskReduction}
                  </span>
                </div>
              </div>

              <div className="text-center pt-4">
                <button
                  onClick={() => navigate('/register')}
                  className="rounded-xl bg-orange-500 hover:bg-orange-600 px-8 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-500/25 transition"
                >
                  Bu Tasarrufu Sağlamak İçin Hemen Katılın
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. TESTIMONIALS (ECZACI YORUMLARI) ──────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-orange-600">
              Meslektaşlarımızın Deneyimleri
            </h2>
            <h3 className="text-3xl font-black text-gray-900 sm:text-4xl">
              Türkiye'nin Dört Bir Yanından Eczacı Yorumları
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14">
            <div className="rounded-3xl border border-gray-200 bg-gray-50/70 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs text-gray-700 leading-relaxed italic font-medium">
                "Fazla aldığımız dermokozmetik ve besin takviyesi stoklarımız miadı dolmadan diğer eczacı meslektaşlarımıza ulaştı. Müthiş bir finansal rahatlık sağladı."
              </p>
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-extrabold text-gray-900">Ecz. Ahmet Y.</h5>
                  <span className="text-[10px] text-gray-500 font-medium">Kadıköy Şifa Eczanesi • İstanbul</span>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-bold text-green-800 border border-green-200">
                  GLN Onaylı
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gray-50/70 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs text-gray-700 leading-relaxed italic font-medium">
                "GİB e-Fatura entegrasyonu sayesinde muhasebe işlerimiz saniyeler içinde tamamlanıyor. Güvenli ödeme altyapısı ve canlı destek süper!"
              </p>
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-extrabold text-gray-900">Ecz. Elif K.</h5>
                  <span className="text-[10px] text-gray-500 font-medium">Çankaya Park Eczanesi • Ankara</span>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-bold text-green-800 border border-green-200">
                  GLN Onaylı
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gray-50/70 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs text-gray-700 leading-relaxed italic font-medium">
                "Sadece doğrulanmış onaylı eczacıların sisteme girebilmesi içimizi rahatlatıyor. Alım yaparken de satarken de %100 güvendeyiz."
              </p>
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-extrabold text-gray-900">Ecz. Mehmet T.</h5>
                  <span className="text-[10px] text-gray-500 font-medium">Karşıyaka Can Eczanesi • İzmir</span>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-bold text-green-800 border border-green-200">
                  GLN Onaylı
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. FAQ ACCORDION (SSS) ────────────────────────────────────────── */}
      <section id="sss" className="py-20 lg:py-28 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-orange-600">
              Merak Edilenler
            </h2>
            <h3 className="text-3xl font-black text-gray-900 sm:text-4xl">
              Sıkça Sorulan Sorular
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs transition"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left font-bold text-sm text-gray-900 hover:text-orange-600 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-orange-600' : ''
                        }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3 font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 9. BOTTOM CTA BANNER ──────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-lg">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8 space-y-6">
          <h3 className="text-3xl font-black tracking-tight sm:text-4xl">
            Eczanenizin Stok Gücüne Güç Katın!
          </h3>
          <p className="text-sm sm:text-base text-orange-50 max-w-2xl mx-auto font-medium">
            Hemen ücretsiz üye olun, GLN doğrulamanız tamamlansın ve Türkiye genelindeki 5.400+ eczacı ile güvenle alım-satım yapmaya başlayın.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/register')}
              className="rounded-2xl bg-gray-900 hover:bg-black px-8 py-3.5 text-xs font-extrabold text-white shadow-xl transition"
            >
              Hemen Eczacı Üyeliği Aç
            </button>
            <button
              onClick={() => navigate('/login')}
              className="rounded-2xl border border-white/40 bg-white/10 px-8 py-3.5 text-xs font-extrabold text-white hover:bg-white/20 transition"
            >
              Zaten Üyeyim, Giriş Yap
            </button>
          </div>
        </div>
      </section>

      {/* ── 10. FOOTER ────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white py-12 text-xs text-gray-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="space-y-3">
              {/* CLEAN FOOTER LOGO */}
              <Link to="/" className="flex items-center">
                <span className="text-xl font-black text-gray-900">
                  Eczacıdan<span className="text-orange-500">.com</span>
                </span>
              </Link>
              <p className="text-[11px] leading-relaxed text-gray-500 font-medium">
                Türkiye'nin sadece onaylı eczacılara özel güvenli B2B pazaryeri ve stok takas platformu.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-3 text-xs">Hızlı Bağlantılar</h5>
              <ul className="space-y-2 text-[11px] font-medium">
                <li><a href="#hakkimizda" className="hover:text-orange-600">Hakkımızda</a></li>
                <li><a href="#nasil-calisir" className="hover:text-orange-600">Nasıl Çalışır?</a></li>
                <li><a href="#avantajlar" className="hover:text-orange-600">Avantajlar</a></li>
                <li><a href="#hesaplayici" className="hover:text-orange-600">Kazanç Hesaplayıcı</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-3 text-xs">Yasal & Mevzuat</h5>
              <ul className="space-y-2 text-[11px] font-medium">
                <li><Link to="/legal/kvkk" className="hover:text-orange-600">KVKK Aydınlatma Metni</Link></li>
                <li><Link to="/legal/mevzuat" className="hover:text-orange-600">Eczacılık Mevzuatı Bildirimi</Link></li>
                <li><Link to="/legal/terms" className="hover:text-orange-600">Kullanım Koşulları</Link></li>
                <li><Link to="/legal/privacy" className="hover:text-orange-600">Gizlilik & Güvenlik Politikası</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-gray-900 mb-3 text-xs">İletişim & Destek</h5>
              <p className="text-[11px] leading-relaxed text-gray-500 font-medium">
                📍 Kadıköy / İstanbul<br />
                📞 0850 300 32 32<br />
                ✉️ destek@eczacidan.com
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-medium">
            <span
              onDoubleClick={() => navigate('/admin-portal')}
              className="cursor-default select-none hover:text-gray-900 transition"
              title="Eczacıdan.com B2B Portal"
            >
              © 2026 Eczacıdan.com B2B Teknolojileri A.Ş. Tüm hakları saklıdır.
            </span>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-[10px] font-bold text-gray-700">
                🛡️ 256-Bit SSL Koruma
              </span>
              <span className="rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-[10px] font-bold text-gray-700">
                🏛️ GİB e-Fatura Entegre
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
