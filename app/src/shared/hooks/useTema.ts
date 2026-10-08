import { useCallback, useEffect, useState } from 'react';

import {
  SYSTEM_DARK_QUERY,
  applyTheme,
  getStoredPreference,
  resolveTheme,
  setThemePreference,
  type ThemePreference,
} from '@/shared/lib/theme';

/**
 * Preferência de tema de quem usa e a troca dela. Com a opção `system`, acompanha a
 * preferência do sistema enquanto a aplicação está aberta.
 */
export function useTema() {
  const [preferencia, setPreferencia] = useState<ThemePreference>(getStoredPreference);

  const escolher = useCallback((nova: ThemePreference) => {
    setThemePreference(nova);
    setPreferencia(nova);
  }, []);

  useEffect(() => {
    if (preferencia !== 'system' || typeof window.matchMedia !== 'function') return;

    const sistema = window.matchMedia(SYSTEM_DARK_QUERY);
    const acompanhar = () => applyTheme(resolveTheme('system'));

    sistema.addEventListener('change', acompanhar);
    return () => sistema.removeEventListener('change', acompanhar);
  }, [preferencia]);

  return { preferencia, escolher };
}
