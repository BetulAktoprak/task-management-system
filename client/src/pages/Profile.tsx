import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';
import { userService } from '../services/api';
import { authUtils } from '../utils/auth';
import type { UserDto } from '../types/user';

export default function Profile() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userService.getCurrentUser();
      setUser(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Profil bilgileri yüklenirken bir hata oluştu.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'Admin':
        return 'from-red-500 to-pink-600';
      case 'Project Manager':
        return 'from-blue-500 to-indigo-600';
      case 'Developer':
        return 'from-emerald-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return <Loading message="Profil bilgileri yükleniyor..." />;
  }

  if (error && !user) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-red-800 font-medium mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
        <button
          onClick={loadProfile}
          className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentUser = authUtils.getUser();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Profilim
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Hesap bilgileriniz ve ayarlar
        </p>
      </div>

      {/* Profile Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-lg">
        {/* İnce gradient çizgi - sadece dekoratif */}
        <div className={`h-1.5 bg-gradient-to-r ${getRoleBadgeColor(user.roleName)}`} />

        <div className="px-6 pt-6 pb-8">
          {/* Avatar ve isim alanı tamamen beyaz zemin üzerinde */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg border-2 border-gray-100">
                <span className="text-3xl font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div className="mt-4 sm:mt-0 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600 mt-1 break-all">{user.email}</p>
              <span
                className={`inline-flex items-center gap-1.5 mt-2 px-4 py-1.5 text-sm font-semibold rounded-xl bg-gradient-to-r ${getRoleBadgeColor(user.roleName)} text-white shadow-md`}
              >
                {user.roleName}
              </span>
            </div>
          </div>

          {/* Detail Grid */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Hesap Detayları
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ad Soyad</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900">{user.name}</dd>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 sm:col-span-2">
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900">{user.email}</dd>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 sm:col-span-2">
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r ${getRoleBadgeColor(user.roleName)} text-white shadow-sm`}
                  >
                    {user.roleName}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Hesap Durumu</p>
              <p className="text-xl font-bold text-white">Aktif</p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Doğrulama</p>
              <p className="text-xl font-bold text-white">Doğrulandı</p>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Üyelik</p>
              <p className="text-xl font-bold text-white">{currentUser ? 'Aktif' : '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/60 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-indigo-900">Profil güncellemesi</h4>
            <p className="mt-1 text-sm text-indigo-800">
              Profil bilgilerinizi güncellemek için lütfen sistem yöneticinizle iletişime geçin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
