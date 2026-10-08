import { Outlet } from 'react-router';

import { ThemeToggle } from '@/shared/components/ThemeToggle/ThemeToggle';

export function PublicLayout() {
  return (
    <main className="min-h-screen bg-canvas px-4 py-6 text-fg">
      <div className="mx-auto flex w-full max-w-6xl justify-end">
        <ThemeToggle />
      </div>

      <div className="flex min-h-[calc(100vh-5.5rem)] items-center justify-center">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
