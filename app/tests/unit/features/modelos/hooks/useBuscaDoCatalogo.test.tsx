/**
 * @vitest-environment jsdom
 */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useBuscaDoCatalogo } from '@/features/modelos/hooks/useBuscaDoCatalogo';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('useBuscaDoCatalogo', () => {
  it('deve responder na hora no campo e só enviar depois de 300 ms sem digitar', () => {
    // Arrange
    const enviar = vi.fn();
    const { result } = renderHook(() => useBuscaDoCatalogo('', enviar));

    // Act
    act(() => result.current.setDigitado('car'));
    act(() => void vi.advanceTimersByTime(299));

    // Assert
    expect(result.current.digitado).toBe('car');
    expect(enviar).not.toHaveBeenCalled();
    act(() => void vi.advanceTimersByTime(1));
    expect(enviar).toHaveBeenCalledExactlyOnceWith('car');
  });

  it('deve enviar só o último texto quando a pessoa continua digitando', () => {
    // Arrange
    const enviar = vi.fn();
    const { result } = renderHook(() => useBuscaDoCatalogo('', enviar));

    // Act
    act(() => result.current.setDigitado('c'));
    act(() => void vi.advanceTimersByTime(200));
    act(() => result.current.setDigitado('ca'));
    act(() => void vi.advanceTimersByTime(200));
    act(() => result.current.setDigitado('car'));
    act(() => void vi.advanceTimersByTime(300));

    // Assert
    expect(enviar).toHaveBeenCalledExactlyOnceWith('car');
  });

  it('não deve apagar o que a pessoa digitou depois quando o endereço devolve o texto antigo', () => {
    // Arrange
    const enviar = vi.fn();
    const { result, rerender } = renderHook(({ q }) => useBuscaDoCatalogo(q, enviar), {
      initialProps: { q: '' },
    });
    act(() => result.current.setDigitado('ca'));
    act(() => void vi.advanceTimersByTime(300));

    // Act: o endereço volta com 'ca' enquanto a pessoa já digitou 'car'
    act(() => result.current.setDigitado('car'));
    rerender({ q: 'ca' });

    // Assert
    expect(result.current.digitado).toBe('car');
  });

  it('deve levar para o campo uma mudança vinda de fora, como "Limpar filtros"', () => {
    // Arrange
    const enviar = vi.fn();
    const { result, rerender } = renderHook(({ q }) => useBuscaDoCatalogo(q, enviar), {
      initialProps: { q: 'mancal' },
    });

    // Act
    rerender({ q: '' });

    // Assert
    expect(result.current.digitado).toBe('');
    act(() => void vi.advanceTimersByTime(400));
    expect(enviar).not.toHaveBeenCalled();
  });

  it('não deve enviar nada quando o texto inicial não muda', () => {
    const enviar = vi.fn();
    renderHook(() => useBuscaDoCatalogo('abc', enviar));

    act(() => void vi.advanceTimersByTime(500));

    expect(enviar).not.toHaveBeenCalled();
  });
});
