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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-900 px-4 py-10 sm:px-6">
      <div className="w-full max-w-[430px] flex flex-col gap-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl px-6 py-7 sm:px-8 sm:py-9">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-600 border border-emerald-600 shadow-md">
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
    </main>
  );
}
