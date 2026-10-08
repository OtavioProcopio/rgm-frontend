/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ThemeToggle } from '@/shared/components/ThemeToggle/ThemeToggle';

function simularSistema(escuro: boolean) {
  window.matchMedia = vi
    .fn<typeof window.matchMedia>()
    .mockReturnValue({ matches: escuro } as MediaQueryList);
}

describe('ThemeToggle', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('deve oferecer o tema claro quando nada foi guardado e o sistema está no escuro', () => {
    // Arrange
    simularSistema(true);

    // Act
    render(<ThemeToggle />);

    // Assert
    expect(screen.getByRole('button', { name: 'Ativar tema claro' })).toBeDefined();
  });

  it('deve oferecer o tema escuro quando nada foi guardado e o sistema está no claro', () => {
    // Arrange
    simularSistema(false);

    // Act
    render(<ThemeToggle />);

    // Assert
    expect(screen.getByRole('button', { name: 'Ativar tema escuro' })).toBeDefined();
  });

  it('deve manter a preferência system quando o botão só é mostrado', () => {
    // Arrange
    simularSistema(true);

    // Act
    render(<ThemeToggle />);

    // Assert
    expect(localStorage.getItem('rgm.theme')).toBe('system');
  });

  it('deve guardar light quando o tema claro é ativado', () => {
    // Arrange
    simularSistema(true);
    render(<ThemeToggle />);

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Ativar tema claro' }));

    // Assert
    expect(localStorage.getItem('rgm.theme')).toBe('light');
  });

  it('deve tirar o tema escuro do documento quando o tema claro é ativado', () => {
    // Arrange
    simularSistema(true);
    render(<ThemeToggle />);

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Ativar tema claro' }));

    // Assert
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('deve oferecer o tema escuro quando light está guardado e o sistema está no escuro', () => {
    // Arrange
    simularSistema(true);
    localStorage.setItem('rgm.theme', 'light');
    localStorage.setItem('rgm.theme.defaulted', '3');

    // Act
    render(<ThemeToggle />);

    // Assert
    expect(screen.getByRole('button', { name: 'Ativar tema escuro' })).toBeDefined();
  });

  it('deve aceitar classes extras quando className é informado', () => {
    // Act
    render(<ThemeToggle className="custom-class" />);

    // Assert
    expect(screen.getByRole('button').className).toContain('custom-class');
  });
});
