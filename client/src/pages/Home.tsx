import { authUtils } from '../utils/auth';

export default function Home() {
  const user = authUtils.getUser();

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Task Management System
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Proje ve görev yönetimi için güçlü bir platform
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Giriş Yap
          </a>
          <a
            href="/register"
            className="inline-block px-6 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
          >
            Kayıt Ol
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Hoş geldin, {user.name}!
      </h1>
      <p className="text-lg text-gray-600">
        Dashboard'a hoş geldiniz. Yakında burada istatistiklerinizi görebileceksiniz.
      </p>
    </div>
  );
}
