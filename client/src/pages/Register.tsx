import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/api';
import { authUtils } from '../utils/auth';
import type { RegisterDto } from '../types/auth';

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: ZapIcon,
    title: 'Hızlı Kurulum',
    description: 'Dakikalar içinde çalışmaya başlayın',
  },
  {
    icon: LockIcon,
    title: 'Güvenli Altyapı',
    description: 'Verileriniz en üst düzey güvenlikle korunur',
  },
  {
    icon: GlobeIcon,
    title: 'Her Yerden Erişim',
    description: 'Tüm cihazlarınızdan kolayca erişin',
  },
];

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterDto>({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.register(formData);

      localStorage.setItem('token', response.accessToken);
      const role = authUtils.getRoleFromToken();

      authUtils.setAuth(response.accessToken, {
        userId: response.userId,
        email: response.email,
        name: response.name,
        role: role || undefined,
      });

      toast.success('Kayıt başarılı! Hoş geldiniz!');
      navigate('/');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Kayıt olurken bir hata oluştu.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-gray-50">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-emerald-600"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(5, 150, 105, 0.95) 0%, rgba(16, 185, 129, 0.9) 50%, rgba(52, 211, 153, 0.9) 100%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <ShieldIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-serif text-xl font-semibold tracking-tight text-white">
              Task Management
            </span>
          </div>

          <div className="flex flex-col gap-8 max-w-md">
            <div className="flex flex-col gap-4">
              <h1 className="font-serif text-4xl xl:text-5xl font-bold leading-tight text-balance text-white">
                Hemen başlayın
              </h1>
              <p className="text-white/80 text-base leading-relaxed">
                Saniyeler içinde hesabınızı oluşturun ve tüm özelliklere erişim
                kazanın.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 p-4"
                >
                  <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-white/10 shrink-0">
                    <feature.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-white">
                      {feature.title}
                    </span>
                    <span className="text-xs text-white/70 leading-relaxed">
                      {feature.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-9 w-9 rounded-full border-2 border-emerald-400/70 bg-white/20 backdrop-blur-sm"
                />
              ))}
            </div>
            <p className="text-sm text-white/70">
              <span className="text-white font-medium">Güvenli</span> kayıt ile
              verileriniz korunur
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-[420px] flex flex-col gap-8">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-600 border border-emerald-600">
              <ShieldIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-serif text-xl font-semibold tracking-tight text-gray-900">
              Task Management
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-gray-900 text-balance">
              Yeni hesap oluşturun
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Bilgilerinizi girerek hemen başlayın
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Ad Soyad
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Adınız Soyadınız"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                E-posta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="En az 6 karakter"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <p className="text-sm text-gray-600 text-center">
            Zaten hesabınız var mı?{' '}
            <Link
              to="/login"
              className="font-medium text-emerald-600 hover:text-emerald-500 underline-offset-4 hover:underline transition-colors"
            >
              Giriş yapın
            </Link>
          </p>

          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Kayıt olarak{' '}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-gray-700 transition-colors"
            >
              Kullanım Koşulları
            </a>
            {' ve '}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-gray-700 transition-colors"
            >
              Gizlilik Politikası
            </a>
            'nı kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </main>
  );
}
