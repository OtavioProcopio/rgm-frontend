/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { THEME_KEY, applyTheme, getStoredTheme, initializeTheme } from './theme';

const THEME_DEFAULTED_KEY = 'rgm.theme.defaulted';
const THEME_DEFAULT_VERSION = '2';

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe('getStoredTheme', () => {
  it('returns dark and writes defaults when version key is absent', () => {
    const theme = getStoredTheme();
    expect(theme).toBe('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    expect(localStorage.getItem(THEME_DEFAULTED_KEY)).toBe(THEME_DEFAULT_VERSION);
  });

  it('returns stored light theme when version matches', () => {
    localStorage.setItem(THEME_DEFAULTED_KEY, THEME_DEFAULT_VERSION);
    localStorage.setItem(THEME_KEY, 'light');
    expect(getStoredTheme()).toBe('light');
  });

  it('returns dark when stored value is not "light"', () => {
    localStorage.setItem(THEME_DEFAULTED_KEY, THEME_DEFAULT_VERSION);
    localStorage.setItem(THEME_KEY, 'dark');
    expect(getStoredTheme()).toBe('dark');
  });
});

describe('applyTheme', () => {
  it('adds dark class for dark theme', () => {
    applyTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
  });

  it('removes dark class for light theme', () => {
    document.documentElement.classList.add('dark');
    applyTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem(THEME_KEY)).toBe('light');
  });
});

describe('initializeTheme', () => {
  it('applies the stored theme on initialization', () => {
    localStorage.setItem(THEME_DEFAULTED_KEY, THEME_DEFAULT_VERSION);
    localStorage.setItem(THEME_KEY, 'light');
    initializeTheme();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
