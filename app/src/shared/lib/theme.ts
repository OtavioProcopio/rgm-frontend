export const THEME_KEY = 'rgm.theme';
const THEME_DEFAULTED_KEY = 'rgm.theme.defaulted';
const THEME_DEFAULT_VERSION = '2';
export type Theme = 'light' | 'dark';

export function getStoredTheme(): Theme {
  if (localStorage.getItem(THEME_DEFAULTED_KEY) !== THEME_DEFAULT_VERSION) {
    localStorage.setItem(THEME_KEY, 'dark');
    localStorage.setItem(THEME_DEFAULTED_KEY, THEME_DEFAULT_VERSION);
    return 'dark';
  }

  return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(THEME_KEY, theme);
  localStorage.setItem(THEME_DEFAULTED_KEY, THEME_DEFAULT_VERSION);
}

export function initializeTheme() {
  applyTheme(getStoredTheme());
}
