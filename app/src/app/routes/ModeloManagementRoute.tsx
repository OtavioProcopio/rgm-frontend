import { Outlet } from 'react-router';

import { useAuth } from '@/app/providers/authContext';
import { canManageModelos } from '@/shared/lib/permissions';

export function ModeloManagementRoute() {
  const { user } = useAuth();

  if (!canManageModelos(user?.perfil)) {
    return (
      <section className="rounded-md border border-warning bg-warning-soft p-6 text-warning-fg">
        <h1 className="text-xl font-semibold">Acesso negado</h1>
        <p className="mt-2 text-sm">Seu perfil não possui permissão para gerenciar modelos.</p>
      </section>
    );
  }

  return <Outlet />;
}
