import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { applyTheme, getStoredTheme, type Theme } from '@/shared/lib/theme';

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());
  const isDark = theme === 'dark';

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <button
      type="button"
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-100',
        'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800',
        className,
      )}
    >
      {isDark ? <Sun aria-hidden="true" size={18} /> : <Moon aria-hidden="true" size={18} />}
    </button>
  );
}
