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
      <section className="rounded-md border border-warning bg-warning-soft p-6 text-warning-fg">
        <h1 className="text-xl font-semibold">Acesso negado</h1>
        <p className="mt-2 text-sm">Seu perfil não possui acesso a esta área no frontend.</p>
      </section>
    );
  }

  return <Outlet />;
}
