import { ReactNode } from 'react';
import { authUtils } from '../utils/auth';

interface RequireRoleProps {
  children: ReactNode;
  roles: string[];
  fallback?: ReactNode;
}

export default function RequireRole({
  children,
  roles,
  fallback = null,
}: RequireRoleProps) {
  const userRole = authUtils.getRoleFromToken();
  const hasAccess = userRole && roles.includes(userRole);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
