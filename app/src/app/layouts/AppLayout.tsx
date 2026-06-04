import { Cpu, LayoutDashboard, LogOut, PackageSearch, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';

import { useAuth } from '@/app/providers/authContext';
import { Button } from '@/shared/components/Button/Button';
import { ThemeToggle } from '@/shared/components/ThemeToggle/ThemeToggle';
import { cn } from '@/shared/lib/cn';
import { canAccessAdmin } from '@/shared/lib/permissions';

const adminNavigation = [
  { to: '/app/admin', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/app/admin/usuarios', label: 'Usuários', icon: Users },
  { to: '/app/admin/maquinas', label: 'Máquinas', icon: Cpu },
  { to: '/app/admin/modelos', label: 'Modelos', icon: PackageSearch },
];

export function AppLayout() {
  const { logout, user } = useAuth();
  const navigation = canAccessAdmin(user?.perfil) ? adminNavigation : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-900 dark:text-white lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 lg:flex lg:min-h-screen lg:flex-col">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-100 px-3 py-2 shadow-sm dark:border-slate-500 dark:bg-slate-300">
            <img src="/logo-rgm-autoparts.png" alt="RGM Auto Parts" className="h-12 w-auto" />
          </div>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
            Painel administrativo
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
          <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-700/70">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">{user?.nome}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              {user?.perfil}
            </p>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="inline-flex rounded-md border border-slate-200 bg-slate-100 px-2 py-1.5 shadow-sm dark:border-slate-500 dark:bg-slate-300 lg:hidden">
                <img src="/logo-rgm-autoparts.png" alt="RGM Auto Parts" className="h-9 w-auto" />
              </div>
              <div className="hidden min-w-0 lg:block">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                  Administração RGM
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Usuários, máquinas e modelos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden text-right sm:block lg:hidden">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">{user?.nome}</p>
                <p className="text-xs uppercase text-slate-500 dark:text-slate-400">
                  {user?.perfil}
                </p>
              </div>
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
