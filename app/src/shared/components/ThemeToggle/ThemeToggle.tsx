import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/shared/lib/cn';
import {
  getStoredPreference,
  resolveTheme,
  setThemePreference,
  type Theme,
} from '@/shared/lib/theme';

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>(() => resolveTheme(getStoredPreference()));
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      onClick={() => setTheme(setThemePreference(isDark ? 'light' : 'dark'))}
      className={cn(
        'inline-flex h-10 w-10 items-center pointer-coarse:h-11 pointer-coarse:w-11 justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100',
        'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
        className,
      )}
    >
      {isDark ? <Sun aria-hidden="true" size={18} /> : <Moon aria-hidden="true" size={18} />}
    </button>
  );
}
