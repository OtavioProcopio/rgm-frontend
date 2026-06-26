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
import { ThemeToggle } from '@/shared/components/ThemeToggle/ThemeToggle';
import { cn } from '@/shared/lib/cn';
import type { PerfilUsuario } from '@/features/auth/types/authTypes';
import { canAccessAdmin, canManageModelos, canViewModelos } from '@/shared/lib/permissions';

const PERFIL_LABEL: Record<PerfilUsuario, string> = {
  ADMINISTRADOR: 'Painel administrativo',
  GESTOR: 'Portal de gestão',
  OPERADOR: 'Portal operacional',
  EXTERNO: 'Portal de solicitações',
};

const adminNavigation = [
  { to: '/app/admin', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/app/admin/usuarios', label: 'Usuários', icon: Users },
  { to: '/app/admin/modelos', label: 'Modelos', icon: PackageSearch },
];

export function AppLayout() {
  const { logout, user } = useAuth();

  const navigation = canAccessAdmin(user?.perfil)
    ? adminNavigation
    : [
        { to: '/app/dashboard', label: 'Dashboard', icon: BarChart2, end: false },
        { to: '/app/solicitacoes', label: 'Solicitações', icon: Ticket, end: false },
        ...(canViewModelos(user?.perfil)
          ? [{ to: '/app/modelos', label: 'Modelos', icon: PackageSearch, end: false }]
          : []),
        ...(canManageModelos(user?.perfil) && !canAccessAdmin(user?.perfil)
          ? [{ to: '/app/admin/modelos', label: 'Gerenciar Modelos', icon: PackageSearch, end: false }]
          : []),
      ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-900 dark:text-white lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 lg:flex lg:min-h-screen lg:flex-col">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
          <img src="/logo-rgm-autoparts.png" alt="RGM Auto Parts" className="h-12 w-auto" />
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
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
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
                  isActive &&
                    'bg-sky-600 text-white hover:bg-sky-600 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-500',
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-700">
          <NavLink
            to="/app/perfil"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md bg-slate-50 p-3 dark:bg-slate-700/70 border border-transparent transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-[1.01] active:scale-[0.99]',
                isActive && 'ring-2 ring-sky-500/20 border-sky-400 dark:border-sky-500',
              )
            }
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/40">
              <User size={16} className="text-sky-700 dark:text-sky-300" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{user?.nome}</p>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                {user?.perfil}
              </p>
            </div>
          </NavLink>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src="/logo-rgm-autoparts.png"
                alt="RGM Auto Parts"
                className="h-9 w-auto lg:hidden"
              />
              <div className="hidden min-w-0 lg:block">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                  {canAccessAdmin(user?.perfil) ? 'Administração RGM' : 'RGM Auto Parts'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {canAccessAdmin(user?.perfil)
                    ? 'Usuários, máquinas e modelos'
                    : 'Solicitações de manutenção'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <NavLink
                to="/app/perfil"
                className={({ isActive }) =>
                  cn(
                    'hidden items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 sm:flex lg:hidden',
                    isActive && 'bg-slate-100 dark:bg-slate-700',
                  )
                }
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/40">
                  <User size={14} className="text-sky-700 dark:text-sky-300" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{user?.nome}</p>
                  <p className="text-xs uppercase text-slate-500 dark:text-slate-400">{user?.perfil}</p>
                </div>
              </NavLink>
              <ThemeToggle />
              <Button variant="secondary" onClick={logout} className="gap-2">
                <LogOut size={16} />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>

          {navigation.length > 0 ? (
            <nav className="flex gap-2 overflow-x-auto border-t border-slate-200 px-4 py-3 dark:border-slate-700 sm:px-6 lg:hidden">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
                      isActive &&
                        'bg-sky-600 text-white hover:bg-sky-600 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-500',
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
          <main className="min-w-0 rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
