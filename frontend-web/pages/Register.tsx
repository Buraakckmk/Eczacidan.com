import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../src/components/AuthContext';
import InteractiveDnaBackground from '../src/components/InteractiveDnaBackground';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    gln: '',
    tc: '',
    username: '',
    email: '',
    pharmacy_name: '',
    pharmacy_city: '',
    password: '',
    consent: false,
    privacy: false,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!form.consent || !form.privacy) {
      setError('Lütfen gerekli onayları işaretleyin.');
      return;
    }
    if (form.gln.length !== 13) {
      setError('GLN numarası 13 haneli olmalıdır.');
      return;
    }
    if (form.tc.length !== 11) {
      setError('T.C. Kimlik No 11 haneli olmalıdır.');
      return;
    }
    if (form.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.register({
        gln: form.gln,
        gnl: form.gln,
        tc: form.tc,
        username: form.username,
        password: form.password,
        email: form.email || undefined,
        pharmacy_name: form.pharmacy_name || undefined,
        pharmacy_city: form.pharmacy_city || undefined,
        consent: form.consent,
        privacy: form.privacy,
      });
      if (!res.success) {
        throw new Error(res.message || 'Kayıt başarısız oldu.');
      }
      // Otomatik giriş
      await login(form.username, form.password);
      navigate('/products', { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kayıt başarısız oldu.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 p-4 overflow-hidden selection:bg-orange-500 selection:text-white">
      <InteractiveDnaBackground />
      <div className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20">
        <div className="hidden w-1/2 bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-700 p-8 text-white md:flex md:flex-col md:justify-between">
          <div>
            <div className="mb-6 text-4xl font-extrabold text-black">
              Eczacıdan<span className="text-orange-400">.com</span>
            </div>            <h2 className="mt-2 text-3xl font-extrabold leading-tight">
              Ücretsiz B2B
              <br />
              Eczane Üyeliği
            </h2>
            <p className="mt-3 text-sm text-purple-100/90 leading-relaxed">
              GLN ve T.C. bilgilerinizle 2 dakikada üye olun, hemen kendi eczanenizden ilan vermeye ve
              diğer eczanelerden uygun fiyata ürün almaya başlayın.
            </p>
          </div>
          <ul className="space-y-2 text-xs text-purple-100">
            <li>✓ %100 Ücretsiz Üyelik</li>
            <li>✓ İlaç ruhsat & İTS otomatik doğrulama</li>
            <li>✓ 7/24 Canlı Eczane Mesajlaşması</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-h-[100vh overflow-y-auto p-8 md:w-1/2">
          <h1 className="mb-1 text-xl font-bold text-gray-900">Üye Kaydı</h1>
          <p className="mb-6 text-xs text-gray-500">
            * işaretli alanlar zorunludur. Demo GLN: 3245676600002 örnek geçerlidir.
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">GLN Numarası *</label>
              <input
                value={form.gln}
                maxLength={13}
                onChange={(e) => handleChange('gln', e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="3245676600002"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">TC Kimlik No *</label>
              <input
                value={form.tc}
                maxLength={11}
                onChange={(e) => handleChange('tc', e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="10000000146"
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">Kullanıcı Adı *</label>
              <input
                value={form.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="ornek_eczane"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">E-posta</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="eczane@ornek.com"
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">Eczane Adı</label>
              <input
                value={form.pharmacy_name}
                onChange={(e) => handleChange('pharmacy_name', e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Şifa Eczanesi"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700">İlçe / İl</label>
              <input
                value={form.pharmacy_city}
                onChange={(e) => handleChange('pharmacy_city', e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Kadıköy / İstanbul"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="mb-2 block text-xs font-semibold text-gray-700">Şifre *</label>
            <div className="flex items-center rounded-lg border border-gray-300 p-3 focus-within:ring-2 focus-within:ring-orange-500">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="En az 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="ml-2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <label className="flex cursor-pointer items-start gap-2 text-xs text-gray-600">
              <input
                checked={form.consent}
                onChange={(e) => handleChange('consent', e.target.checked)}
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <span>
                Açık Rıza Metni kapsamında{' '}
                <a className="font-semibold text-purple-700 hover:text-purple-800" href="#" onClick={(e) => e.preventDefault()}>Açık Rıza Metni</a>{' '}
                kabul ediyorum. *
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-2 text-xs text-gray-600">
              <input
                checked={form.privacy}
                onChange={(e) => handleChange('privacy', e.target.checked)}
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <span>
                Kişisel verilerin işlenmesine ilişkin{' '}
                <a className="font-semibold text-purple-700 hover:text-purple-800" href="#" onClick={(e) => e.preventDefault()}>Aydınlatma Metni</a>{' '}
                okudum. *
              </span>
            </label>
          </div>

          {error ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 block w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-center text-sm font-extrabold text-white shadow-lg transition hover:from-orange-600 hover:to-orange-700 disabled:opacity-60"
          >
            {submitting ? 'Kayıt yapılıyor...' : 'Ücretsiz Üye Ol'}
          </button>

          <div className="mt-5 text-center text-xs text-gray-600">
            Zaten üye misiniz?{' '}
            <Link to="/login" className="font-extrabold text-purple-700 hover:text-purple-800">
              Giriş Yap
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
