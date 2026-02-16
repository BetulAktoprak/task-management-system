import { Navigate } from 'react-router-dom';
import { authUtils } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Token geçerliliğini kontrol et
  const isAuthenticated = authUtils.isTokenValid();

  if (!isAuthenticated) {
    // Giriş yapılmamışsa login sayfasına yönlendir
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
