/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePreferenciaGuardada } from '@/shared/hooks/usePreferenciaGuardada';

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('usePreferenciaGuardada', () => {
  it('deve devolver o valor guardado já no primeiro render quando há valor guardado', () => {
    // Arrange
    localStorage.setItem('menu', 'recolhido');
    const valores: string[] = [];

    // Act
    renderHook(() => {
      const [valor] = usePreferenciaGuardada('menu', 'aberto');
      valores.push(valor);
    });

    // Assert
    expect(valores[0]).toBe('recolhido');
  });

  it('deve devolver o padrão quando não há valor guardado', () => {
    // Arrange
    const { result } = renderHook(() => usePreferenciaGuardada('menu', 'aberto'));

    // Act
    const [valor] = result.current;

    // Assert
    expect(valor).toBe('aberto');
  });

  it('deve gravar no armazenamento e atualizar o estado quando o valor é trocado', () => {
    // Arrange
    const { result } = renderHook(() => usePreferenciaGuardada('menu', 'aberto'));

    // Act
    act(() => result.current[1]('recolhido'));

    // Assert
    expect(result.current[0]).toBe('recolhido');
    expect(localStorage.getItem('menu')).toBe('recolhido');
  });

  it('deve devolver o padrão sem lançar quando o armazenamento está indisponível', () => {
    // Arrange
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('indisponível');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('indisponível');
    });
    const { result } = renderHook(() => usePreferenciaGuardada('menu', 'aberto'));

    // Act
    act(() => result.current[1]('recolhido'));

    // Assert
    expect(result.current[0]).toBe('recolhido');
  });

  it('deve devolver o padrão inicial sem lançar quando getItem lança', () => {
    // Arrange
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('indisponível');
    });

    // Act
    const { result } = renderHook(() => usePreferenciaGuardada('menu', 'aberto'));

    // Assert
    expect(result.current[0]).toBe('aberto');
  });

  it('deve guardar valores independentes quando as chaves são diferentes', () => {
    // Arrange
    const a = renderHook(() => usePreferenciaGuardada('a', 'x'));
    const b = renderHook(() => usePreferenciaGuardada('b', 'x'));

    // Act
    act(() => a.result.current[1]('1'));

    // Assert
    expect(localStorage.getItem('a')).toBe('1');
    expect(localStorage.getItem('b')).toBeNull();
    expect(b.result.current[0]).toBe('x');
  });
});
