import {
  BarChart2,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  Ticket,
  User,
  Users,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router';

import { useAuth } from '@/app/providers/authContext';
import { Button } from '@/shared/components/Button/Button';
import { Logo } from '@/shared/components/Logo/Logo';
import { ThemeToggle } from '@/shared/components/ThemeToggle/ThemeToggle';
import { cn } from '@/shared/lib/cn';
import { rotuloDoPerfil } from '@/shared/lib/rotulos';
import type { PerfilUsuario } from '@/features/auth/types/authTypes';
import { AvisoSemAtualizacao } from '@/features/solicitacoes/components/AvisoSemAtualizacao';
import { useSolicitacaoEvents } from '@/features/solicitacoes/hooks/useSolicitacaoEvents';
import { canAccessAdmin, canManageModelos } from '@/shared/lib/permissions';

const PERFIL_LABEL: Record<PerfilUsuario, string> = {
  ADMINISTRADOR: 'Painel administrativo',
  GESTOR: 'Portal de gestão',
  OPERADOR: 'Portal operacional',
  EXTERNO: 'Portal de solicitações',
};

export function AppLayout() {
  const { logout, user } = useAuth();
  // Uma conexão de tempo real para toda a área logada: o aviso do cabeçalho vale em qualquer tela.
  useSolicitacaoEvents();

  const isAdmin = canAccessAdmin(user?.perfil);
  const isGestorOrAdmin = canManageModelos(user?.perfil);

  const navigation = [
    { to: '/app/dashboard', label: 'Dashboard', icon: BarChart2, end: false },
    { to: '/app/solicitacoes', label: 'Solicitações', icon: Ticket, end: false },
    {
      to: isGestorOrAdmin ? '/app/admin/modelos' : '/app/modelos',
      label: 'Modelos',
      icon: PackageSearch,
      end: false,
    },
    ...(isAdmin
      ? [
          { to: '/app/admin', label: 'Painel Admin', icon: LayoutDashboard, end: true },
          { to: '/app/admin/usuarios', label: 'Usuários', icon: Users, end: false },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-canvas text-fg lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-line bg-surface lg:flex lg:min-h-screen lg:flex-col">
        <div className="border-b border-line px-6 py-5">
          <Logo />
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-accent">
            {user?.perfil ? PERFIL_LABEL[user.perfil] : 'RGM Auto Parts'}
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-2 px-4 py-5">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-muted',
                  isActive && 'bg-accent text-on-accent hover:bg-accent',
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-line bg-surface">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Logo tamanho="sm" className="lg:hidden" />
              <div className="hidden min-w-0 lg:block">
                <p className="text-sm font-semibold text-fg">
                  {isAdmin ? 'Administração RGM' : 'RGM Auto Parts'}
                </p>
                <p className="text-xs text-fg-muted">
                  {isAdmin ? 'Usuários, máquinas e modelos' : 'Solicitações de manutenção'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <NavLink
                to="/app/perfil"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors pointer-coarse:min-h-11 hover:bg-surface-muted',
                    isActive && 'bg-surface-muted',
                  )
                }
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-info-soft">
                  <User size={14} className="text-info-fg" />
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-fg">{user?.nome}</p>
                  <p className="text-xs uppercase text-fg-muted">
                    {user?.perfil ? rotuloDoPerfil[user.perfil] : null}
                  </p>
                </div>
              </NavLink>
              <ThemeToggle />
              <Button variant="secondary" onClick={logout} className="gap-2">
                <LogOut size={16} />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>

          <AvisoSemAtualizacao />

          {navigation.length > 0 ? (
            <nav className="flex gap-2 overflow-x-auto border-t border-line px-4 py-3 sm:px-6 lg:hidden">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-fg-muted pointer-coarse:min-h-11 transition-colors hover:bg-surface-muted',
                      isActive && 'bg-accent text-on-accent hover:bg-accent',
                    )
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          ) : null}
        </header>

        <div className="px-4 py-5 sm:px-6 lg:px-8">
          <main className="min-w-0 rounded-md border border-line bg-surface p-5 shadow-sm sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
