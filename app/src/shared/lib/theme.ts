export const THEME_KEY = 'rgm.theme';
export type Theme = 'light' | 'dark';

export function getStoredTheme(): Theme {
  return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem(THEME_KEY, theme);
}

export function initializeTheme() {
  applyTheme(getStoredTheme());
}
