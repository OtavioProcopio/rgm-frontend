/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useBuscaDeModelos } from '@/features/admin/modelos/hooks/useBuscaDeModelos';
import { useModelos } from '@/features/admin/modelos/hooks/useModelos';

vi.mock('@/features/admin/modelos/hooks/useModelos', () => ({
  useModelos: vi.fn(),
}));

const MODELO = { id: 'm-1', codigo: 'MD-120', descricao: 'Tambor', maquina: 'DISA' };

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(useModelos).mockReturnValue({
    data: { content: [MODELO] },
    isFetching: false,
  } as unknown as ReturnType<typeof useModelos>);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

const filtrosPedidos = () => vi.mocked(useModelos).mock.calls.map(([filtros]) => filtros);

function montar(termoInicial = '') {
  return renderHook(({ termo }) => useBuscaDeModelos(termo), {
    initialProps: { termo: termoInicial },
  });
}

describe('useBuscaDeModelos', () => {
  it('deve buscar os 20 primeiros modelos ativos quando nada foi digitado', () => {
    // Act
    montar();

    // Assert
    expect(filtrosPedidos()).toEqual([{ page: 0, size: 20, ativo: true }]);
  });

  it('deve devolver os modelos encontrados', () => {
    // Act
    const { result } = montar();

    // Assert
    expect(result.current.modelos).toEqual([MODELO]);
  });

  it('deve não buscar pelo termo antes de 300 ms da última tecla', () => {
    // Arrange
    const { rerender } = montar();

    // Act
    rerender({ termo: 'MD-12' });
    act(() => {
      vi.advanceTimersByTime(299);
    });

    // Assert
    expect(filtrosPedidos().some((filtros) => filtros.codigo)).toBe(false);
  });

  it('deve buscar pelo código, só entre os ativos, 300 ms depois da última tecla', () => {
    // Arrange
    const { rerender } = montar();

    // Act
    rerender({ termo: 'MD-12' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Assert
    expect(filtrosPedidos().at(-1)).toEqual({ page: 0, size: 20, ativo: true, codigo: 'MD-12' });
  });

  it('deve buscar só pelo último termo quando o usuário digita várias teclas em menos de 300 ms', () => {
    // Arrange
    const { rerender } = montar();

    // Act
    rerender({ termo: 'M' });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ termo: 'MD' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Assert
    expect(filtrosPedidos().map((filtros) => filtros.codigo).filter(Boolean)).toEqual(['MD']);
  });

  it('deve ignorar espaços nas pontas do termo', () => {
    // Arrange
    const { rerender } = montar();

    // Act
    rerender({ termo: '  MD-12  ' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Assert
    expect(filtrosPedidos().at(-1)?.codigo).toBe('MD-12');
  });

  it('deve dizer que está buscando enquanto espera o usuário parar de digitar', () => {
    // Arrange
    const { result, rerender } = montar();

    // Act
    rerender({ termo: 'MD-12' });

    // Assert
    expect(result.current.buscando).toBe(true);
  });

  it('deve dizer que não está buscando quando a busca do termo terminou', () => {
    // Arrange
    const { result, rerender } = montar();
    rerender({ termo: 'MD-12' });

    // Act
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Assert
    expect(result.current.buscando).toBe(false);
  });

  it('deve devolver lista vazia enquanto a primeira busca não respondeu', () => {
    // Arrange
    vi.mocked(useModelos).mockReturnValue({
      data: undefined,
      isFetching: true,
    } as unknown as ReturnType<typeof useModelos>);

    // Act
    const { result } = montar();

    // Assert
    expect(result.current.modelos).toEqual([]);
  });
});
