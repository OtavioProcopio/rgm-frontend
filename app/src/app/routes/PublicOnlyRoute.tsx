import { Navigate, Outlet } from 'react-router';

import { useAuth } from '@/app/providers/authContext';

export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/app/admin" replace />;
  }

  return <Outlet />;
}
