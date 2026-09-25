import { ArrowLeft, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function CorporateRegister() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    taxOffice: '',
    vkn: '',
    licenseNo: '',
    contactName: '',
    contactTitle: '',
    email: '',
    phone: '',
    city: '',
    district: '',
    address: '',
    categories: [] as string[],
    kvkkConsent: false,
  });

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

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

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {submitted ? (
          /* SUCCESS SUBMISSION CARD */
          <div className="rounded-3xl border border-green-200 bg-white p-8 sm:p-12 text-center shadow-xl space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 sm:text-3xl">
                Kurumsal Üyelik Başvurunuz Alınmıştır!
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-lg mx-auto font-medium">
                Tedarikçi & Ecza Deposu başvuru talebiniz B2B Kurumsal İlişkiler Ekibimize iletilmiştir. Resmi lisans incelemesinin ardından 24 saat içinde tarafınızla iletişime geçilecektir.
              </p>
            </div>
            <div className="pt-4">
              <button
                onClick={() => navigate('/')}
                className="rounded-2xl bg-orange-500 hover:bg-orange-600 px-8 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-orange-500/20 transition"
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM CARD */
          <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-lg space-y-8">
            <div className="border-b border-gray-100 pb-6 space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-extrabold text-orange-900">
                <Building2 size={14} className="text-orange-600" />
                <span>Ecza Deposu & Tedarikçi Portalı</span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">
                Kurumsal Üyelik & Başvuru Formu
              </h1>
              <p className="text-xs text-gray-600 font-medium">
                Ecza depoları, üretici ilaç ve gıda takviyesi firmaları için Türkiye genelindeki 5.400+ onaylı eczacıya doğrudan B2B tedarik imkanı.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SECTION 1: FIRMA BİLGİLERİ */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  1. Şirket & Lisans Bilgileri
                </h3>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Firma / Ecza Deposu Resmi Ünvanı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Selçuk Ecza Deposu Ticaret A.Ş."
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-medium text-gray-900 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Vergi Dairesi & VKN *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Vergi Dairesi / VKN"
                      value={formData.vkn}
                      onChange={(e) => setFormData({ ...formData, vkn: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-medium text-gray-900 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Ecza Deposu Ruhsat / Lisans No *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Sağlık Bakanlığı Lisans No"
                      value={formData.licenseNo}
                      onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-medium text-gray-900 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: YETKİLİ İLETİŞİM */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  2. Kurumsal Yetkili İletişim Bilgileri
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Yetkili Adı Soyadı *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ad Soyad"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-medium text-gray-900 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Yetkili Unvanı *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: B2B Satış Müdürü / Genel Müdür"
                      value={formData.contactTitle}
                      onChange={(e) => setFormData({ ...formData, contactTitle: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-medium text-gray-900 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Kurumsal E-posta Adresi *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="kurumsal@kurum.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-medium text-gray-900 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Kurumsal Telefon / GSM *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0850..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-medium text-gray-900 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: KATEGORİLER & ADRES */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  3. Tedarik Sağlanan Ürün Kategorileri
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    'Reçeteli / Reçetesiz İlaç',
                    'Vitamin & Takviye',
                    'Dermokozmetik',
                    'Medikal Malzeme',
                  ].map((cat) => {
                    const isSelected = formData.categories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => handleCategoryToggle(cat)}
                        className={`rounded-xl border px-3 py-2.5 text-xs font-extrabold transition text-center ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50 text-orange-900'
                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* KVKK & CONSENT */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.kvkkConsent}
                    onChange={(e) => setFormData({ ...formData, kvkkConsent: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-xs text-gray-600 font-medium leading-relaxed">
                    <Link to="/legal/kvkk" className="text-orange-600 font-bold hover:underline" target="_blank">
                      KVKK Aydınlatma Metni
                    </Link>{' '}
                    ve Kurumsal Tedarikçi Sözleşmesi şartlarını okudum, kabul ediyorum.
                  </span>
                </label>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-orange-500 hover:bg-orange-600 py-3.5 text-xs font-black text-white shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Başvuru Gönderiliyor...</span>
                  ) : (
                    <>
                      <span>Kurumsal Başvuruyu Gönder</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
