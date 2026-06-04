/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('toggles dark theme preference', () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole('button', { name: 'Ativar tema escuro' }));

    expect(localStorage.getItem('rgm.theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
