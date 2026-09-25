import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../src/components/AuthContext';
import InteractiveDnaBackground from '../src/components/InteractiveDnaBackground';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname?: string } } };
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      const redirectTo = location.state?.from?.pathname ?? '/products';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Giriş başarısız.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 p-4 overflow-hidden selection:bg-orange-500 selection:text-white">
      <InteractiveDnaBackground />
      <div className="relative z-10 flex w-full max-w-4xl overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20">
        <div className="hidden w-1/2 bg-gradient-to-br from-orange-500 via-orange-400 to-purple-600 p-8 text-white md:flex md:flex-col md:justify-between">
          <div>
            <div className="mb-2 text-sm font-bold uppercase tracking-wider text-orange-100"></div>
            <h2 className="mt-2 text-3xl font-extrabold leading-tight">
              Eczaneler Arası
              <br />
              B2B Pazaryeri
            </h2>
            <p className="mt-3 text-sm text-orange-100/90 leading-relaxed">
              GLN numaranızla güvenli giriş yapın, tüm eczane tekliflerini tek ekranda karşılaştırın ve
              akıllı sepet ile en uygun alışverişi yapın.
            </p>
          </div>
          <div className="space-y-2 rounded-xl bg-white/10 backdrop-blur p-4 text-xs">
            <p className="font-bold text-orange-100">Demo Giriş Bilgileri:</p>
            <p>
              Kullanıcı: <b>demo</b> / Şifre: <b>demo123</b>
            </p>
            <p>veya Kullanıcı: <b>sifa</b> / Şifre: <b>sifa123</b></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full p-8 md:w-1/2">
          <div className="mb-6 text-4xl font-extrabold text-gray-900">
            Eczacıdan<span className="text-orange-500">.com</span>
          </div>
          <h1 className="mb-6 text-xl font-bold text-gray-900">Üye Girişi</h1>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Kullanıcı Adı veya GLN Numarası
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              placeholder="demo veya 3245676600002"
              autoComplete="username"
              required
            />
          </div>

          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">Şifre</label>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-xs font-semibold text-purple-700 hover:text-purple-800"
              >
                Şifremi Unuttum
              </a>
            </div>
            <div className="flex items-center rounded-lg border border-gray-300 p-3 transition focus-within:ring-2 focus-within:ring-orange-100 focus-within:border-orange-400">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="ml-2 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="mb-6 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-sm font-extrabold text-white shadow-lg transition hover:from-orange-600 hover:to-orange-700 disabled:opacity-60"
          >
            {submitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>

          <div className="text-center text-xs text-gray-600">
            <p className="font-medium">
              Henüz üye değil misiniz? GLN numaranızı yazarak ücretsiz üye olabilirsiniz.
            </p>
            <Link
              to="/register"
              className="mt-2 inline-block text-sm font-extrabold text-purple-700 hover:text-purple-800"
            >
              Hemen Üye Ol →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
