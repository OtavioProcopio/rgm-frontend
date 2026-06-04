import { Outlet } from 'react-router';

import { useAuth } from '@/app/providers/authContext';
import { canAccessAdmin } from '@/shared/lib/permissions';

export function AdminRoute() {
  const { user } = useAuth();

  if (!canAccessAdmin(user?.perfil)) {
    return (
      <section className="rounded-md border border-amber-200 bg-amber-50 p-6 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
        <h1 className="text-xl font-semibold">Acesso negado</h1>
        <p className="mt-2 text-sm">Seu perfil não possui permissão para acessar esta área.</p>
      </section>
    );
  }

  return <Outlet />;
}
