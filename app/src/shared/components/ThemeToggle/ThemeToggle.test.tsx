/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('uses dark theme as the default preference', () => {
    render(<ThemeToggle />);

    expect(localStorage.getItem('rgm.theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles theme preference', () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole('button', { name: 'Ativar tema claro' }));

    expect(localStorage.getItem('rgm.theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
