/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useTema } from '@/shared/hooks/useTema';
import { THEME_KEY, type ThemePreference } from '@/shared/lib/theme';

const THEME_DEFAULTED_KEY = 'rgm.theme.defaulted';
const VERSAO_ATUAL = '3';

/** Sistema simulado: guarda quem ouve a preferência e permite mudá-la. */
function simularSistema(escuro: boolean) {
  const ouvintes = new Set<() => void>();
  const consulta = {
    matches: escuro,
    addEventListener: (_evento: string, ouvinte: () => void) => ouvintes.add(ouvinte),
    removeEventListener: (_evento: string, ouvinte: () => void) => ouvintes.delete(ouvinte),
  };
  window.matchMedia = vi
    .fn<typeof window.matchMedia>()
    .mockReturnValue(consulta as unknown as MediaQueryList);

  return {
    ouvintes,
    mudarPara(novo: boolean) {
      consulta.matches = novo;
      ouvintes.forEach((ouvinte) => ouvinte());
    },
  };
}

function guardar(preferencia: ThemePreference) {
  localStorage.setItem(THEME_KEY, preferencia);
  localStorage.setItem(THEME_DEFAULTED_KEY, VERSAO_ATUAL);
}

const temaEscuroAplicado = () => document.documentElement.classList.contains('dark');

function limpar() {
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  Reflect.deleteProperty(window, 'matchMedia');
}

beforeEach(limpar);
afterEach(limpar);

describe('useTema', () => {
  it('deve devolver system quando nada foi guardado', () => {
    // Arrange
    simularSistema(false);

    // Act
    const { result } = renderHook(() => useTema());

    // Assert
    expect(result.current.preferencia).toBe('system');
  });

  it('deve devolver a preferência guardada quando há uma escolha', () => {
    // Arrange
    const guardada: ThemePreference = 'dark';
    simularSistema(false);
    guardar(guardada);

    // Act
    const { result } = renderHook(() => useTema());

    // Assert
    expect(result.current.preferencia).toBe(guardada);
  });

  it('deve devolver a nova preferência quando ela é trocada', () => {
    // Arrange
    const nova: ThemePreference = 'dark';
    simularSistema(false);
    const { result } = renderHook(() => useTema());

    // Act
    act(() => result.current.escolher(nova));

    // Assert
    expect(result.current.preferencia).toBe(nova);
  });

  it('deve aplicar o tema quando a preferência é trocada', () => {
    // Arrange
    simularSistema(false);
    const { result } = renderHook(() => useTema());

    // Act
    act(() => result.current.escolher('dark'));

    // Assert
    expect(temaEscuroAplicado()).toBe(true);
  });

  it('deve guardar a preferência quando ela é trocada', () => {
    // Arrange
    const nova: ThemePreference = 'light';
    simularSistema(true);
    const { result } = renderHook(() => useTema());

    // Act
    act(() => result.current.escolher(nova));

    // Assert
    expect(localStorage.getItem(THEME_KEY)).toBe(nova);
  });

  it('deve trocar o tema sem recarregar quando a preferência é system e o sistema muda', () => {
    // Arrange
    const sistema = simularSistema(false);
    renderHook(() => useTema());

    // Act
    act(() => sistema.mudarPara(true));

    // Assert
    expect(temaEscuroAplicado()).toBe(true);
  });

  it('deve não trocar o tema quando a preferência guardada é light e o sistema muda', () => {
    // Arrange
    const sistema = simularSistema(false);
    guardar('light');
    renderHook(() => useTema());

    // Act
    act(() => sistema.mudarPara(true));

    // Assert
    expect(temaEscuroAplicado()).toBe(false);
  });

  it('deve deixar de ouvir o sistema quando a preferência passa de system para light', () => {
    // Arrange
    const sistema = simularSistema(false);
    const { result } = renderHook(() => useTema());

    // Act
    act(() => result.current.escolher('light'));

    // Assert
    expect(sistema.ouvintes.size).toBe(0);
  });

  it('deve deixar de ouvir o sistema quando é desmontado', () => {
    // Arrange
    const sistema = simularSistema(false);
    const { unmount } = renderHook(() => useTema());

    // Act
    unmount();

    // Assert
    expect(sistema.ouvintes.size).toBe(0);
  });

  it('deve devolver system quando o navegador não informa a preferência do sistema', () => {
    // Act
    const { result } = renderHook(() => useTema());

    // Assert
    expect(result.current.preferencia).toBe('system');
  });
});
