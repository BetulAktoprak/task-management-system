import { Navigate } from 'react-router-dom';
import { authUtils } from '../utils/auth';

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  // Zaten giriş yapılmışsa ana sayfaya yönlendir
  const isAuthenticated = authUtils.isTokenValid();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
