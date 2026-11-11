/**
 * @vitest-environment jsdom
 */
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';
import { criarModelos } from '@tests/support/modeloFixture';

import { modelosApi } from '@/features/admin/modelos/api/modelosApi';
import { useCatalogoDeModelos } from '@/features/modelos/hooks/useCatalogoDeModelos';

const TODOS = criarModelos(50);

/** Um servidor de mentira: 50 modelos, páginas de `size`. */
function servidor() {
  return vi.spyOn(modelosApi, 'listar').mockImplementation(async (filtros) => {
    const size = filtros.size;
    const page = filtros.page;
    return {
      content: TODOS.slice(page * size, page * size + size),
      page,
      size,
      totalElements: TODOS.length,
      totalPages: Math.ceil(TODOS.length / size),
    };
  });
}

let listar: ReturnType<typeof servidor>;

beforeEach(() => {
  listar = servidor();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('useCatalogoDeModelos', () => {
  it('deve pedir o primeiro bloco de 20 em ordem de código com os filtros e dar o total do servidor', async () => {
    // Arrange
    const { QueryWrapper } = createQueryWrapper();

    // Act
    const { result } = renderHook(
      () =>
        useCatalogoDeModelos(
          { ativo: true, tipo: 'RESINA', maquina: 'FBOX', maquinaExata: true },
          0,
        ),
      { wrapper: QueryWrapper },
    );
    await waitFor(() => expect(result.current.carregando).toBe(false));

    // Assert
    expect(listar).toHaveBeenCalledExactlyOnceWith({
      ativo: true,
      tipo: 'RESINA',
      maquina: 'FBOX',
      maquinaExata: true,
      ordem: 'CODIGO',
      page: 0,
      size: 20,
    });
    expect(result.current.modelos).toHaveLength(20);
    expect(result.current.total).toBe(50);
    expect(result.current.primeiraPagina).toBe(0);
    expect(result.current.temMaisDepois).toBe(true);
    expect(result.current.temMaisAntes).toBe(false);
  });

  it('deve carregar o bloco seguinte e devolver só o que ele trouxe', async () => {
    // Arrange
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useCatalogoDeModelos({ ativo: true }, 0), {
      wrapper: QueryWrapper,
    });
    await waitFor(() => expect(result.current.carregando).toBe(false));

    // Act
    let novos: unknown[] = [];
    await act(async () => {
      novos = await result.current.carregarDepois();
    });

    // Assert
    expect(novos).toHaveLength(20);
    expect((novos[0] as { codigo: string }).codigo).toBe('M-020');
    await waitFor(() => expect(result.current.modelos).toHaveLength(40));
    expect(result.current.temMaisDepois).toBe(true);
  });

  it('deve devolver vazio, e não o último bloco já carregado, quando o bloco seguinte falha', async () => {
    // Arrange
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useCatalogoDeModelos({ ativo: true }, 0), {
      wrapper: QueryWrapper,
    });
    await waitFor(() => expect(result.current.carregando).toBe(false));
    listar.mockRejectedValueOnce(new Error('Falha'));

    // Act
    let novos: unknown[] = [{ lixo: true }];
    await act(async () => {
      novos = await result.current.carregarDepois();
    });

    // Assert
    expect(novos).toEqual([]);
    expect(result.current.modelos).toHaveLength(20);
    expect(result.current.erro).toBe(false);
    await waitFor(() => expect(result.current.erroNoBloco).toBe(true));
  });

  it('deve devolver vazio, e não o primeiro bloco já carregado, quando o bloco anterior falha', async () => {
    // Arrange
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useCatalogoDeModelos({ ativo: true }, 1), {
      wrapper: QueryWrapper,
    });
    await waitFor(() => expect(result.current.carregando).toBe(false));
    listar.mockRejectedValueOnce(new Error('Falha'));

    // Act
    let novos: unknown[] = [{ lixo: true }];
    await act(async () => {
      novos = await result.current.carregarAntes();
    });

    // Assert
    expect(novos).toEqual([]);
    expect(result.current.modelos).toHaveLength(20);
    expect(result.current.erro).toBe(false);
    await waitFor(() => expect(result.current.erroNoBloco).toBe(true));
  });

  it('deve parar de oferecer blocos depois do último', async () => {
    // Arrange
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useCatalogoDeModelos({ ativo: true }, 2), {
      wrapper: QueryWrapper,
    });

    // Act
    await waitFor(() => expect(result.current.carregando).toBe(false));

    // Assert: o bloco 2 tem os 10 últimos
    expect(result.current.modelos).toHaveLength(10);
    expect(result.current.temMaisDepois).toBe(false);
    expect(result.current.temMaisAntes).toBe(true);
  });

  it('deve abrir num bloco do meio e carregar o bloco anterior, devolvendo o que ele trouxe', async () => {
    // Arrange
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useCatalogoDeModelos({ ativo: true }, 1), {
      wrapper: QueryWrapper,
    });
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.primeiraPagina).toBe(1);
    expect(result.current.modelos[0].codigo).toBe('M-020');

    // Act
    let novos: { codigo: string }[] = [];
    await act(async () => {
      novos = await result.current.carregarAntes();
    });

    // Assert
    expect(novos).toHaveLength(20);
    expect(novos.at(-1)?.codigo).toBe('M-019');
    await waitFor(() => expect(result.current.primeiraPagina).toBe(0));
    expect(result.current.modelos[0].codigo).toBe('M-000');
    expect(result.current.temMaisAntes).toBe(false);
  });

  it('não deve consultar nada enquanto está desabilitado', async () => {
    // Arrange
    const { QueryWrapper } = createQueryWrapper();

    // Act
    renderHook(() => useCatalogoDeModelos({ ativo: true }, 0, false), { wrapper: QueryWrapper });
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Assert
    expect(listar).not.toHaveBeenCalled();
  });

  it('deve expor o erro e tentar de novo', async () => {
    // Arrange
    listar.mockRejectedValueOnce(new Error('falhou'));
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useCatalogoDeModelos({ ativo: true }, 0), {
      wrapper: QueryWrapper,
    });
    await waitFor(() => expect(result.current.erro).toBe(true));

    // Act
    act(() => result.current.tentarDeNovo());

    // Assert
    await waitFor(() => expect(result.current.modelos).toHaveLength(20));
    expect(result.current.erro).toBe(false);
  });
});
