import { ReactNode, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authUtils } from '../utils/auth';
import {
  startTaskHubConnection,
  stopTaskHubConnection,
} from '../services/signalr';
import { playNotificationSound } from '../utils/notificationSound';
import type { TaskDto } from '../types/task';

interface LayoutProps {
  children: ReactNode;
}

function TaskNotificationContent({ task }: { task: TaskDto }) {
  // SignalR bazen PascalCase gönderebilir
  const title = task.title ?? (task as { Title?: string }).Title ?? '';
  const projectName = task.projectName ?? (task as { ProjectName?: string }).ProjectName;
  return (
    <div className="flex gap-3 items-start min-w-0">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
        <svg
          className="w-5 h-5 text-white"
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
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          Yeni görev atandı
        </p>
        <p className="font-semibold text-gray-900 mt-1 truncate" title={title}>
          {title}
        </p>
        {projectName && (
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400" />
            {projectName}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const user = authUtils.getUser();

  // Giriş yapmış kullanıcı için SignalR ile görev bildirimlerini dinle
  useEffect(() => {
    const token = authUtils.getToken();
    if (!token || !authUtils.getUser()) return;

    // Aynı görev için kısa sürede tekrar bildirim gösterme (çoklu bildirim engeli)
    const shownTaskIds = new Set<number>();
    const DEDUPE_MS = 5000;

    startTaskHubConnection(token, (task) => {
      const me = authUtils.getUser();
      if (!me) return;
      // Backend bazen PascalCase gönderebilir; her iki formatı kabul et
      const assignedId = task.assignedUserId ?? (task as { AssignedUserId?: number }).AssignedUserId;
      if (assignedId !== me.userId) return;

      if (shownTaskIds.has(task.id)) return;
      shownTaskIds.add(task.id);
      setTimeout(() => shownTaskIds.delete(task.id), DEDUPE_MS);

      playNotificationSound();
      toast.info(<TaskNotificationContent task={task} />, {
        autoClose: false,
        closeButton: true,
        icon: false,
        className: '!bg-white !border !border-indigo-100 !shadow-lg !rounded-xl',
      });

      // Görev listesi / dashboard'ın sayfa yenilemeden güncellenmesi için event tetikle
      window.dispatchEvent(
        new CustomEvent('tasksInvalidated', { detail: { task } })
      );
    }).catch(() => {
      // Bağlantı kurulamazsa sessizce devam et (örn. API kapalıyken)
    });

    return () => {
      stopTaskHubConnection();
    };
  }, []);

  const handleLogout = () => {
    stopTaskHubConnection();
    authUtils.clearAuth();
    toast.info('Çıkış yapıldı');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <span>Task Management</span>
              </Link>
              {user && (
                <nav className="hidden md:flex items-center space-x-1">
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/projects"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                  >
                    Projeler
                  </Link>
                  {user.role === 'Admin' && (
                    <Link
                      to="/users"
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                    >
                      Kullanıcılar
                    </Link>
                  )}
                </nav>
              )}
            </div>
            <nav className="flex items-center space-x-3">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                        <span className="text-sm font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-semibold text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span className="hidden sm:inline">Çıkış Yap</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Kayıt Ol
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
