import { Outlet } from 'react-router';

import { useAuth } from '@/app/providers/authContext';
import { BarraDeAbas } from '@/app/layouts/BarraDeAbas';
import { BarraLateral } from '@/app/layouts/BarraLateral';
import { MenuDoUsuario } from '@/app/layouts/MenuDoUsuario';
import { Logo } from '@/shared/components/Logo/Logo';
import { destinosDeNavegacao } from '@/shared/lib/navegacao';
import type { PerfilUsuario } from '@/features/auth/types/authTypes';
import { AvisoSemAtualizacao } from '@/features/solicitacoes/components/AvisoSemAtualizacao';
import { useSolicitacaoEvents } from '@/features/solicitacoes/hooks/useSolicitacaoEvents';

const PERFIL_LABEL: Record<PerfilUsuario, string> = {
  ADMINISTRADOR: 'Painel administrativo',
  GESTOR: 'Portal de gestão',
  OPERADOR: 'Portal operacional',
  EXTERNO: 'Portal de solicitações',
};

export function AppLayout() {
  const { user } = useAuth();
  // Uma conexão de tempo real para toda a área logada: o aviso do cabeçalho vale em qualquer tela.
  useSolicitacaoEvents();

  const destinos = destinosDeNavegacao(user?.perfil);

  return (
    <div className="min-h-screen bg-canvas text-fg lg:flex">
      <BarraLateral
        destinos={destinos}
        identificacao={user?.perfil ? PERFIL_LABEL[user.perfil] : 'RGM Auto Parts'}
      />

      <div className="min-w-0 flex-1">
        <header className="border-b border-line bg-surface">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:justify-end lg:px-8">
            <Logo tamanho="sm" className="lg:hidden" />
            <MenuDoUsuario />
          </div>

          <AvisoSemAtualizacao />
        </header>

        <div className="px-4 py-5 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:pb-5">
          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      <BarraDeAbas destinos={destinos} />
    </div>
  );
}
