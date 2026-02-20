import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';
import { dashboardService } from '../services/api';
import { authUtils } from '../utils/auth';
import type { DashboardDto } from '../types/dashboard';

function ProjectIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  );
}

function TaskIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = authUtils.getUser();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  // SignalR ile görev atandığında istatistikleri yenile
  useEffect(() => {
    const onTasksInvalidated = () => loadDashboardStats();
    window.addEventListener('tasksInvalidated', onTasksInvalidated);
    return () =>
      window.removeEventListener('tasksInvalidated', onTasksInvalidated);
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        'İstatistikler yüklenirken bir hata oluştu.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="İstatistikler yükleniyor..." />;
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-6 shadow-sm">
        <div className="text-sm text-red-800 font-medium">{error}</div>
        <button
          onClick={loadDashboardStats}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? 'Günaydın'
      : currentHour < 18
        ? 'İyi günler'
        : 'İyi akşamlar';

  const completedRatio = Math.min(
    Math.max(stats.completedTaskPercentage, 0),
    100
  );
  const remainingRatio = 100 - completedRatio;
  const averageTasksPerProject =
    stats.projectCount > 0 ? stats.taskCount / stats.projectCount : 0;
  const avgTasksNormalized = Math.min(
    (averageTasksPerProject / 10) * 100,
    100
  );
  const completionAngle = (completedRatio / 100) * 360;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            {greeting}{user ? `, ${user.name}` : ''}! 👋
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            İşte projelerinizin ve görevlerinizin genel görünümü
          </p>
        </div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <ProjectIcon className="w-5 h-5" />
          Projeleri Görüntüle
        </Link>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Proje Sayısı */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <ProjectIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-white/60 text-sm font-medium">
                Projeler
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-bold text-white">
                {stats.projectCount}
              </div>
              <div className="text-white/80 text-sm">
                Toplam aktif proje
              </div>
            </div>
            {/* Mini chart: ortalama görev / proje */}
            <div className="mt-4 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-white/70">
                <span>Ortalama görev / proje</span>
                <span className="font-semibold text-white">
                  {averageTasksPerProject.toFixed(1)}
                </span>
              </div>
              <div className="h-2 w-full bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full shadow-sm transition-all duration-700 ease-out"
                  style={{ width: `${avgTasksNormalized}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Görev Sayısı */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <TaskIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-white/60 text-sm font-medium">Görevler</div>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-bold text-white">
                {stats.taskCount}
              </div>
              <div className="text-white/80 text-sm">
                Toplam görev sayısı
              </div>
            </div>
            {/* Mini chart: tamamlanan vs kalan görevler */}
            <div className="mt-4 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-white/75">
                <span>Tamamlanan</span>
                <span className="font-semibold text-white">
                  {Math.round((completedRatio / 100) * stats.taskCount)}/
                  {stats.taskCount}
                </span>
              </div>
              <div className="h-2 w-full bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full shadow-sm transition-all duration-700 ease-out"
                  style={{ width: `${completedRatio}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/60">
                <span>Tamamlanan</span>
                <span>Kalan %{remainingRatio.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tamamlanan Görev Yüzdesi */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center gap-6">
              {/* Donut chart */}
              <div
                className="relative w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(#fef3c7 0deg, #fef3c7 ${completionAngle}deg, rgba(255,255,255,0.18) ${completionAngle}deg, rgba(255,255,255,0.18) 360deg)`,
                }}
              >
                <div className="w-16 h-16 rounded-full bg-amber-500 flex flex-col items-center justify-center text-white shadow-lg">
                  <span className="text-lg font-semibold">
                    {completedRatio.toFixed(0)}%
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-white/85">
                    tamamlandı
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white">
                  <ChartIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Görev İlerlemesi</span>
                </div>
                <p className="text-xs text-white/80 max-w-[220px]">
                  Görevlerinizin genel tamamlanma oranı. Yüksek oran, güçlü bir
                  ilerlemeye işaret eder.
                </p>
                <div className="flex items-center gap-3 text-[11px] text-white/75">
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-200" />
                    Tamamlanan
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-white/30" />
                    Kalan
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/projects"
          className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-emerald-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <ProjectIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                Projeleri Yönet
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Tüm projelerinizi görüntüleyin ve yönetin
              </p>
            </div>
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>

        <Link
          to="/profile"
          className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-indigo-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                Profil Ayarları
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Hesap bilgilerinizi görüntüleyin ve düzenleyin
              </p>
            </div>
            <svg
              className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
}
