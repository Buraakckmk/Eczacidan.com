import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  Lock,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLayoutContext } from '../src/components/Layout';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const layout = useLayoutContext();
  const { cartItems, cartTotal, clearCart, setToastMessage } = layout;

  // Payment Method Tab State: 'card' | 'transfer' | 'credit_limit'
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'credit_limit'>('card');

  // Credit Card Form State
  const [cardName, setCardName] = useState('Ecz. Demo Eczacı');
  const [cardNumber, setCardNumber] = useState('4543 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvc, setCardCvc] = useState('882');
  const [installmentOption, setInstallmentOption] = useState<'single' | '3_installments' | '6_installments'>('single');
  const [use3DSecure, setUse3DSecure] = useState(true);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);

  // Selected Bank for Transfer
  const [selectedBank, setSelectedBank] = useState<'garanti' | 'isbank' | 'akbank'>('garanti');

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setToastMessage('Sepetiniz boş! Ödeme yapabilmek için sepetinize ürün ekleyin.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsOrderComplete(true);
      clearCart();
      setToastMessage('🎉 Siparişiniz başarıyla alındı! İTS stok ve kargo bildirimi otomatik iletildi.');
    }, 1500);
  };

  if (isOrderComplete) {
    return (
      <div className="min-h-screen bg-gray-50/70 font-sans py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-white p-8 sm:p-10 shadow-xl text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
            <CheckCircle2 size={48} className="animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800 uppercase tracking-wider">
              Ödeme Başarılı & İTS Onaylandı
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Siparişiniz Başarıyla Alındı!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed max-w-md mx-auto">
              Siparişiniz satıcı eczaneye iletilmiş olup e-Faturanız ve İTS devir belgeniz hazırlık aşamasındadır.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 text-left space-y-3">
            <div className="flex justify-between items-center text-xs font-bold border-b border-gray-200 pb-2">
              <span className="text-gray-500">Sipariş Numarası:</span>
              <span className="text-gray-900 font-mono">ECZ-20260809-982</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold border-b border-gray-200 pb-2">
              <span className="text-gray-500">Ödeme Yöntemi:</span>
              <span className="text-gray-900">
                {paymentMethod === 'card'
                  ? '💳 Kredi Kartı (3D Secure)'
                  : paymentMethod === 'transfer'
                  ? '🏦 Banka Havalesi / EFT'
                  : '🛡️ İTS Cari Bakiye Kredisi'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-gray-500">Kargo Teslimatı:</span>
              <span className="text-emerald-700 font-extrabold">🚀 24 Saat İçinde Anlaşmalı Kargo</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/account?tab=orders"
              className="flex-1 rounded-xl bg-gray-900 py-3.5 text-xs font-extrabold text-white hover:bg-gray-800 transition text-center shadow-md"
            >
              Siparişlerime Git & Takip Et
            </Link>
            <Link
              to="/products"
              className="flex-1 rounded-xl bg-orange-500 py-3.5 text-xs font-extrabold text-white hover:bg-orange-600 transition text-center shadow-lg"
            >
              Alışverişe Devam Et 🛒
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 font-sans text-gray-700 pb-16">
      {/* HEADER BAR */}
      <div className="border-b border-gray-200 bg-white shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              title="Geri Dön"
            >
              <ArrowLeft size={18} />
            </button>
            <Link to="/products" className="text-xl font-black text-gray-900 tracking-tight">
              eczacıdan<span className="text-orange-500">.com</span>
            </Link>
          </div>

          {/* CHECKOUT STEPPER */}
          <div className="hidden md:flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <Check size={14} className="rounded-full bg-emerald-100 p-0.5" /> 1. Sepet
            </span>
            <span className="text-gray-300">&gt;</span>
            <span className="flex items-center gap-1.5 text-orange-600 font-extrabold">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white">2</span> 2. Ödeme & Fatura
            </span>
            <span className="text-gray-300">&gt;</span>
            <span className="text-gray-400">3. Sipariş Onayı</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-extrabold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-full">
            <Lock size={13} className="text-emerald-600" />
            <span>256-Bit SSL Güvenli Ödeme</span>
          </div>
        </div>
      </div>

      {/* MAIN CHECKOUT BODY CONTAINER */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <CreditCard className="text-orange-500" size={26} />
          B2B Sipariş ve Ödeme Ekranı
        </h1>

        {cartItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center space-y-4">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-800">Sepetinizde ürün bulunmamaktadır</h3>
            <p className="text-xs text-gray-500">Fırsat ve vitrin ürünlerini incelemek için pazaryerine göz atabilirsiniz.</p>
            <Link
              to="/products"
              className="inline-block rounded-xl bg-orange-500 px-6 py-3 text-xs font-black text-white shadow-md hover:bg-orange-600 transition"
            >
              Vitrin Ürünlerine Git 🚀
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: PAYMENT METHODS & PHARMACY DELIVERY DETAILS (8 COLS) */}
            <div className="lg:col-span-8 space-y-6">

              {/* 1. ECZANE TESLİMAT VE FATURA BİLGİLERİ */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                    <Store className="text-orange-500" size={20} />
                    Teslimat & e-Fatura Eczane Bilgileri
                  </h2>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold px-2.5 py-0.5 border border-emerald-200">
                    ✓ İTS Doğrulanmış Eczane
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-3.5 space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Eczane Ünvanı</span>
                    <strong className="text-sm text-gray-900 block font-black">Kadıköy Şifa Eczanesi</strong>
                    <span className="text-gray-500 block">Sorumlu: Ecz. Demo Eczacı</span>
                    <span className="text-orange-600 font-mono font-bold block pt-1">GLN: 3245676600002</span>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-3.5 space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Fatura & Vergi Adresi</span>
                    <span className="text-gray-900 font-bold block">Maslak Mah. Büyükdere Cad. No:122, Sarıyer / İstanbul</span>
                    <span className="text-gray-500 block">Sarıyer V.D. — 1234567890</span>
                    <span className="text-emerald-700 font-bold block pt-1">GİB e-Fatura & İTS Entegre</span>
                  </div>
                </div>
              </div>

              {/* 2. ÖDEME YÖNTEMİ SEÇİMİ VE FORMU */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs space-y-6">
                <div className="border-b border-gray-100 pb-3">
                  <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                    <CreditCard className="text-orange-500" size={20} />
                    Ödeme Yöntemi Seçimi
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Güvenli 3D B2B altyapımız ile tercih ettiğiniz ödeme kanalını seçin.
                  </p>
                </div>

                {/* PAYMENT METHOD TABS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition cursor-pointer text-center ${
                      paymentMethod === 'card'
                        ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-200 text-orange-950 font-bold'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard size={24} className={paymentMethod === 'card' ? 'text-orange-600' : 'text-gray-400'} />
                    <span className="text-xs font-black mt-2">Kredi / Banka Kartı</span>
                    <span className="text-[10px] text-gray-500">TROY, Visa, Mastercard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition cursor-pointer text-center ${
                      paymentMethod === 'transfer'
                        ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-200 text-orange-950 font-bold'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Building2 size={24} className={paymentMethod === 'transfer' ? 'text-orange-600' : 'text-gray-400'} />
                    <span className="text-xs font-black mt-2">Havale / EFT (B2B)</span>
                    <span className="text-[10px] text-gray-500">Anlaşmalı Banka IBAN</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_limit')}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition cursor-pointer text-center ${
                      paymentMethod === 'credit_limit'
                        ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-200 text-orange-950 font-bold'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <ShieldCheck size={24} className={paymentMethod === 'credit_limit' ? 'text-orange-600' : 'text-gray-400'} />
                    <span className="text-xs font-black mt-2">İTS Cari Bakiye</span>
                    <span className="text-[10px] text-emerald-700 font-extrabold">Limit: 15.000 TL</span>
                  </button>
                </div>

                {/* METHOD 1: CREDIT CARD FORM */}
                {paymentMethod === 'card' && (
                  <form onSubmit={handleCompleteOrder} className="space-y-4 pt-2 animate-in fade-in duration-200">
                    <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-gray-900 to-gray-800 p-5 text-white shadow-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono tracking-widest text-orange-400 font-bold">B2B SANAL POS</span>
                        <div className="flex items-center gap-2 text-xs font-black">
                          <span className="rounded bg-white/20 px-2 py-0.5">💳 TROY / VISA / MC</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Kart Numarası</label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4543 •••• •••• ••••"
                          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-mono text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Kart Üzerindeki İsim</label>
                          <input
                            type="text"
                            required
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Eczacı Adı Soyadı"
                            className="w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-orange-400"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">SKT</label>
                            <input
                              type="text"
                              required
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="AA/YY"
                              className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-xs font-mono text-center text-white outline-none focus:ring-2 focus:ring-orange-400"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">CVC</label>
                            <input
                              type="text"
                              required
                              maxLength={3}
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              placeholder="•••"
                              className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-xs font-mono text-center text-white outline-none focus:ring-2 focus:ring-orange-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TAKSİT SEÇENEKLERİ */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-extrabold text-gray-900 block">Taksit İskonto Seçeneği:</label>
                      <div className="grid grid-cols-3 gap-3">
                        <label
                          onClick={() => setInstallmentOption('single')}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer text-xs transition ${
                            installmentOption === 'single'
                              ? 'border-orange-500 bg-orange-50 font-bold text-orange-950'
                              : 'border-gray-200 bg-white text-gray-700'
                          }`}
                        >
                          <span>Tek Çekim (Peşin)</span>
                          <span className="text-[10px] text-orange-600 font-extrabold">{cartTotal.toFixed(2)} ₺</span>
                        </label>

                        <label
                          onClick={() => setInstallmentOption('3_installments')}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer text-xs transition ${
                            installmentOption === '3_installments'
                              ? 'border-orange-500 bg-orange-50 font-bold text-orange-950'
                              : 'border-gray-200 bg-white text-gray-700'
                          }`}
                        >
                          <span>3 Taksit (%0 Vade)</span>
                          <span className="text-[10px] text-gray-500">3 x {(cartTotal / 3).toFixed(2)} ₺</span>
                        </label>

                        <label
                          onClick={() => setInstallmentOption('6_installments')}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer text-xs transition ${
                            installmentOption === '6_installments'
                              ? 'border-orange-500 bg-orange-50 font-bold text-orange-950'
                              : 'border-gray-200 bg-white text-gray-700'
                          }`}
                        >
                          <span>6 Taksit (B2B Özel)</span>
                          <span className="text-[10px] text-gray-500">6 x {(cartTotal / 6).toFixed(2)} ₺</span>
                        </label>
                      </div>
                    </div>

                    {/* 3D SECURE CHECKBOX */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="3dsecure"
                        checked={use3DSecure}
                        onChange={(e) => setUse3DSecure(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                      />
                      <label htmlFor="3dsecure" className="text-xs font-bold text-gray-800 cursor-pointer">
                        3D Secure SMS şifresi ile ödememi güvenle tamamlamak istiyorum.
                      </label>
                    </div>
                  </form>
                )}

                {/* METHOD 2: BANK TRANSFER / EFT */}
                {paymentMethod === 'transfer' && (
                  <div className="space-y-4 pt-2 animate-in fade-in duration-200">
                    <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-950 font-medium space-y-1">
                      <strong className="block text-sm font-black text-blue-900">ℹ️ Havale / EFT Ödeme Talimatı:</strong>
                      <p>
                        Aşağıdaki banka hesabına havale yaptıktan sonra siparişiniz otomatik onaylanacaktır. Lütfen açıklama kısmına sipariş kodunu ekleyin.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div
                        onClick={() => setSelectedBank('garanti')}
                        className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                          selectedBank === 'garanti'
                            ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-200'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div>
                          <span className="font-extrabold text-sm text-gray-900 block">Garanti BBVA</span>
                          <span className="font-mono text-xs font-bold text-orange-600 block mt-0.5">
                            TR33 0006 2000 0000 1234 5678 90
                          </span>
                          <span className="text-[10px] text-gray-500">Alıcı: Eczacıdan Teknoloji Pazaryeri A.Ş.</span>
                        </div>
                        <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1">
                          Hızlı EFT ⚡
                        </span>
                      </div>

                      <div
                        onClick={() => setSelectedBank('isbank')}
                        className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                          selectedBank === 'isbank'
                            ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-200'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div>
                          <span className="font-extrabold text-sm text-gray-900 block">Türkiye İş Bankası</span>
                          <span className="font-mono text-xs font-bold text-orange-600 block mt-0.5">
                            TR64 0006 4000 0000 9876 5432 10
                          </span>
                          <span className="text-[10px] text-gray-500">Alıcı: Eczacıdan Teknoloji Pazaryeri A.Ş.</span>
                        </div>
                        <span className="rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-1">
                          FAST Aktif ⚡
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* METHOD 3: CREDIT LIMIT / CARI BAKIYE */}
                {paymentMethod === 'credit_limit' && (
                  <div className="space-y-4 pt-2 animate-in fade-in duration-200">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 space-y-3">
                      <div className="flex justify-between items-center border-b border-emerald-200/60 pb-3">
                        <div>
                          <span className="text-xs font-bold text-emerald-800 block">Kullanılabilir B2B İTS Limitiniz:</span>
                          <span className="text-2xl font-black text-emerald-900 tracking-tight">15.000,00 ₺</span>
                        </div>
                        <span className="rounded-full bg-emerald-600 text-white text-xs font-extrabold px-3 py-1 shadow-xs">
                          Limit Uygun ✓
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs font-medium text-emerald-950">
                        <span>Sipariş Tutarı:</span>
                        <strong className="text-orange-600 font-bold">{cartTotal.toFixed(2)} ₺</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-emerald-950 border-t border-emerald-200/60 pt-2">
                        <span>Sipariş Sonrası Kalan Limit:</span>
                        <strong className="text-emerald-900">{(15000 - cartTotal).toFixed(2)} ₺</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY & PURCHASED PRODUCTS LIST (4 COLS) */}
            <div className="lg:col-span-4 space-y-6">

              {/* PURCHASED PRODUCTS LIST */}
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                    <ShoppingBag className="text-orange-500" size={20} />
                    Satın Alınan Ürünler ({cartItems.length})
                  </h3>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.listingId} className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50/70 p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 font-black text-sm">
                          💊
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black text-gray-900 line-clamp-1">{item.productName}</h4>
                          <span className="text-[10px] text-gray-500 font-medium block">Satıcı: {item.sellerName}</span>
                          <div className="mt-1 flex items-center justify-between text-xs font-bold">
                            <span className="text-gray-700">{item.quantity} Kutu</span>
                            <span className="text-orange-600 font-black">{(item.quantity * item.unitPrice).toFixed(2)} ₺</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
              </div>

              {/* ORDER PRICE SUMMARY CARD */}
              <div className="rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/60 p-6 shadow-xl space-y-4">
                <h3 className="text-base font-black text-gray-900 border-b border-orange-200/80 pb-3">
                  Sipariş Fiyat Özeti
                </h3>

                <div className="space-y-2.5 text-xs font-medium text-gray-700">
                  <div className="flex justify-between">
                    <span>Ürünler Ara Toplamı:</span>
                    <span className="font-bold text-gray-900">{cartTotal.toFixed(2)} ₺</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>B2B İskonto Kazancı:</span>
                    <span>-%15 İndirim</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Kargo Ücreti:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <Truck size={14} /> Ücretsiz Kargo
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-[11px]">
                    <span>KDV Dahil Toplam</span>
                    <span>%10 KDV Dahil</span>
                  </div>
                </div>

                <div className="border-t border-orange-200 pt-3 flex items-baseline justify-between">
                  <span className="text-sm font-black text-gray-900">Genel Toplam:</span>
                  <span className="text-2xl font-black text-orange-600 tracking-tight">{cartTotal.toFixed(2)} ₺</span>
                </div>

                {/* COMPLETE CHECKOUT SUBMIT BUTTON */}
                <button
                  type="button"
                  onClick={handleCompleteOrder}
                  disabled={isProcessing}
                  className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 py-4 text-sm font-black text-white shadow-xl shadow-orange-500/25 transition active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      3D Ödeme İşleniyor...
                    </span>
                  ) : (
                    <>
                      <span>Siparişi Onayla & Öde 🚀</span>
                    </>
                  )}
                </button>

                {/* TRUST BADGES */}
                <div className="space-y-1.5 pt-2 text-[10px] text-gray-500 font-medium border-t border-orange-100">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                    <span>BDDK Lisanslı B2B Sanal POS ve İTS Entegrasyonu</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <PackageCheck size={14} className="text-orange-500 shrink-0" />
                    <span>24 Saat İçinde Anlaşmalı Kargo Kargolama</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </main>
    </div>
  );
}
