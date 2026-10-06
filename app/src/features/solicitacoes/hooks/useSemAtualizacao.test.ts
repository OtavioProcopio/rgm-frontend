/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@/test-utils/queryWrapper';

import { solicitacoesKeys } from './solicitacoesKeys';
import { useSemAtualizacao } from './useSemAtualizacao';
import type { EstadoDaConexao } from './useSolicitacaoEvents';

const AGORA = Date.parse('2026-10-06T12:00:00Z');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(AGORA);
});

afterEach(() => {
  vi.useRealTimers();
});

function montar(inicial?: EstadoDaConexao) {
  const { QueryWrapper, queryClient } = createQueryWrapper();
  const publicar = (estado: EstadoDaConexao) =>
    act(() => {
      queryClient.setQueryData(solicitacoesKeys.conexao(), estado);
      vi.advanceTimersByTime(0);
    });
  const { result } = renderHook(() => useSemAtualizacao(), { wrapper: QueryWrapper });
  if (inicial) publicar(inicial);
  return { result, publicar };
}

describe('useSemAtualizacao', () => {
  it('deve dizer que há atualização quando a conexão ainda não informou estado', () => {
    // Act
    const { result } = montar();

    // Assert
    expect(result.current).toBe(false);
  });

  it('deve dizer que há atualização quando a conexão está aberta', () => {
    // Arrange
    const { result } = montar({ aberta: true, desde: AGORA });

    // Act
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    // Assert
    expect(result.current).toBe(false);
  });

  it('deve dizer que há atualização quando a conexão caiu há menos de 10 segundos', () => {
    // Arrange
    const { result } = montar({ aberta: false, desde: AGORA });

    // Act
    act(() => {
      vi.advanceTimersByTime(9_999);
    });

    // Assert
    expect(result.current).toBe(false);
  });

  it('deve dizer que está sem atualização quando a conexão está fechada há 10 segundos', () => {
    // Arrange
    const { result } = montar({ aberta: false, desde: AGORA });

    // Act
    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    // Assert
    expect(result.current).toBe(true);
  });

  it('deve dizer que está sem atualização de imediato quando a queda informada já passou de 10 segundos', () => {
    // Arrange
    const { result } = montar({ aberta: false, desde: AGORA - 15_000 });

    // Act
    act(() => {
      vi.advanceTimersByTime(0);
    });

    // Assert
    expect(result.current).toBe(true);
  });

  it('deve voltar a dizer que há atualização quando a conexão abre', () => {
    // Arrange
    const { result, publicar } = montar({ aberta: false, desde: AGORA });
    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    // Act
    publicar({ aberta: true, desde: AGORA + 10_000 });

    // Assert
    expect(result.current).toBe(false);
  });

  it('deve não avisar quando a conexão cai e volta antes de 10 segundos', () => {
    // Arrange
    const { result, publicar } = montar({ aberta: false, desde: AGORA });
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    publicar({ aberta: true, desde: AGORA + 5_000 });

    // Act
    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    // Assert
    expect(result.current).toBe(false);
  });
});
