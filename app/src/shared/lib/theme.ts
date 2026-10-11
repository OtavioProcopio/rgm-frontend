export const THEME_KEY = 'rgm.theme';
const THEME_DEFAULTED_KEY = 'rgm.theme.defaulted';
const THEME_DEFAULT_VERSION = '3';
export const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

export type Theme = 'light' | 'dark';
export type ThemePreference = 'system' | Theme;

/** Cor da barra do navegador: o valor do papel `canvas` de cada tema em globals.css. */
export const THEME_COLOR: Record<Theme, string> = {
  light: '#f8fafc',
  dark: '#1a1d23',
};

function isPreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

function storePreference(preference: ThemePreference) {
  localStorage.setItem(THEME_KEY, preference);
  localStorage.setItem(THEME_DEFAULTED_KEY, THEME_DEFAULT_VERSION);
}

export function getStoredPreference(): ThemePreference {
  const stored = localStorage.getItem(THEME_KEY);

  if (localStorage.getItem(THEME_DEFAULTED_KEY) !== THEME_DEFAULT_VERSION) {
    // A versão anterior impôs o escuro; só o claro era escolha de quem usa.
    const preference = stored === 'light' ? 'light' : 'system';
    storePreference(preference);
    return preference;
  }

  return isPreference(stored) ? stored : 'system';
}

export function systemPrefersDark(): boolean {
  if (typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(SYSTEM_DARK_QUERY).matches;
}

export function resolveTheme(preference: ThemePreference): Theme {
  if (preference !== 'system') return preference;
  return systemPrefersDark() ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
}

export function setThemePreference(preference: ThemePreference): Theme {
  const theme = resolveTheme(preference);
  storePreference(preference);
  applyTheme(theme);
  return theme;
}

export function initializeTheme() {
  applyTheme(resolveTheme(getStoredPreference()));
}
