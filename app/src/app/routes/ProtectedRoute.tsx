import { Navigate, Outlet } from 'react-router';

import { useAuth } from '@/app/providers/authContext';
import type { PerfilUsuario } from '@/features/auth/types/authTypes';

type ProtectedRouteProps = {
  allowedProfiles?: PerfilUsuario[];
};

export function ProtectedRoute({ allowedProfiles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedProfiles && !allowedProfiles.includes(user?.perfil ?? 'EXTERNO')) {
    return (
      <section className="rounded-md border border-amber-200 bg-amber-50 p-6 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
        <h1 className="text-xl font-semibold">Acesso negado</h1>
        <p className="mt-2 text-sm">Seu perfil não possui acesso a esta área no frontend.</p>
      </section>
    );
  }

  return <Outlet />;
}
