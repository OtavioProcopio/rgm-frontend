import { NavLink, Outlet } from 'react-router';

import { useAuth } from '@/app/providers/authContext';
import { Button } from '@/shared/components/Button/Button';
import { ThemeToggle } from '@/shared/components/ThemeToggle/ThemeToggle';
import { canAccessAdmin } from '@/shared/lib/permissions';
import { cn } from '@/shared/lib/cn';

const baseNavigation = [
  { to: '/app/solicitacoes', label: 'Solicitações' },
  { to: '/app/modelos', label: 'Modelos' },
];

export function AppLayout() {
  const { logout, user } = useAuth();
  const navigation = canAccessAdmin(user?.perfil)
    ? [...baseNavigation, { to: '/app/admin', label: 'Admin' }]
    : baseNavigation;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-gray-50">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-lg font-semibold">RGM</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Gestão de solicitações</p>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="secondary" onClick={logout}>
                Sair
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex flex-wrap gap-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800',
                      isActive &&
                        'bg-gray-900 text-white hover:bg-gray-900 dark:bg-gray-100 dark:text-gray-950 dark:hover:bg-gray-100',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium text-gray-950 dark:text-gray-50">{user?.nome}</span>
              {user?.perfil ? <span className="ml-2 text-xs uppercase">{user.perfil}</span> : null}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <main className="min-w-0 rounded-md border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
