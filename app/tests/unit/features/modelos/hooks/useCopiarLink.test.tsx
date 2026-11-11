/**
 * @vitest-environment jsdom
 */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useCopiarLink } from '@/features/modelos/hooks/useCopiarLink';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('useCopiarLink', () => {
  it('deve copiar o endereço atual e ficar "copiado"', async () => {
    // Arrange
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const { result } = renderHook(() => useCopiarLink());

    // Act
    await act(() => result.current.copiar());

    // Assert
    expect(writeText).toHaveBeenCalledExactlyOnceWith(window.location.href);
    expect(result.current.estado).toBe('copiado');
  });

  it('deve ficar "bloqueado" quando o navegador recusa a cópia', async () => {
    // Arrange
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('negado')) },
    });
    const { result } = renderHook(() => useCopiarLink());

    // Act
    await act(() => result.current.copiar());

    // Assert
    expect(result.current.estado).toBe('bloqueado');
  });

  it('deve ficar "bloqueado" quando o navegador não tem área de transferência', async () => {
    // Arrange
    vi.stubGlobal('navigator', {});
    const { result } = renderHook(() => useCopiarLink());

    // Act
    await act(() => result.current.copiar());

    // Assert
    expect(result.current.estado).toBe('bloqueado');
  });

  it('deve voltar a "parado" quando reiniciado', async () => {
    // Arrange
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const { result } = renderHook(() => useCopiarLink());
    await act(() => result.current.copiar());

    // Act
    act(() => result.current.reiniciar());

    // Assert
    expect(result.current.estado).toBe('parado');
  });
});
