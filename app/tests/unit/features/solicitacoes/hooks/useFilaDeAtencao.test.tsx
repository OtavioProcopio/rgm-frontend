/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';
import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';
import { solicitacoesKeys } from '@/features/solicitacoes/hooks/solicitacoesKeys';
import { useFilaDeAtencao } from '@/features/solicitacoes/hooks/useFilaDeAtencao';
import type {
  Solicitacao,
  SolicitacoesFilters,
} from '@/features/solicitacoes/types/solicitacaoTypes';
import type { PageResponse } from '@/shared/types/page';

const FILTROS: SolicitacoesFilters = { atrasada: true, emAberto: true, page: 0, size: 100 };

function criarPagina(content: Solicitacao[], totalElements: number): PageResponse<Solicitacao> {
  return { content, page: 0, size: 100, totalElements, totalPages: 2 };
}

function criarAtrasada(id: string, prazoLimite: string): Solicitacao {
  return criarSolicitacao({ id, titulo: `Titulo ${id}`, prazoLimite });
}

function criarOitoForaDeOrdem(): Solicitacao[] {
  return [6, 2, 8, 1, 5, 3, 7, 4].map((dia) =>
    criarAtrasada(`s${dia}`, `2026-01-0${dia}T00:00:00Z`),
  );
}

function montar(options: { enabled?: boolean } = {}) {
  const { QueryWrapper, queryClient } = createQueryWrapper();
  const hook = renderHook(() => useFilaDeAtencao(options), { wrapper: QueryWrapper });
  return { ...hook, queryClient };
}

let listarSpy: MockInstance<typeof solicitacoesApi.listar>;

beforeEach(() => {
  listarSpy = vi.spyOn(solicitacoesApi, 'listar');
  listarSpy.mockResolvedValue(criarPagina(criarOitoForaDeOrdem(), 8));
});

afterEach(() => {
  listarSpy.mockRestore();
});

describe('useFilaDeAtencao', () => {
  it('deve chamar listar uma vez com o filtro de atrasadas em aberto quando monta', async () => {
    // Arrange
    const { result } = montar();

    // Act
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(listarSpy).toHaveBeenCalledTimes(1);
  });

  it('deve consultar com o filtro de atrasadas em aberto quando monta', async () => {
    // Arrange
    const { result } = montar();

    // Act
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(listarSpy).toHaveBeenCalledWith(FILTROS);
  });

  it('deve devolver no máximo 5 itens do mais atrasado ao menos quando há 8 fora de ordem', async () => {
    // Arrange
    const { result } = montar();

    // Act
    await waitFor(() => expect(result.current.itens).toHaveLength(5));

    // Assert
    expect(result.current.itens.map((item) => item.id)).toEqual(['s1', 's2', 's3', 's4', 's5']);
  });

  it('deve devolver o totalElements real quando o conteúdo traz só 100 de 130', async () => {
    // Arrange
    const conteudo = Array.from({ length: 100 }, (_, indice) =>
      criarAtrasada(`s${indice}`, '2026-01-01T00:00:00Z'),
    );
    listarSpy.mockResolvedValue(criarPagina(conteudo, 130));
    const { result } = montar();

    // Act
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(result.current.total).toBe(130);
  });

  it('deve limitar a 5 itens quando o conteúdo traz só 100 de 130', async () => {
    // Arrange
    const conteudo = Array.from({ length: 100 }, (_, indice) =>
      criarAtrasada(`s${indice}`, '2026-01-01T00:00:00Z'),
    );
    listarSpy.mockResolvedValue(criarPagina(conteudo, 130));
    const { result } = montar();

    // Act
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(result.current.itens).toHaveLength(5);
  });

  it('deve estar carregando quando a consulta ainda não resolveu', () => {
    // Arrange
    listarSpy.mockReturnValue(new Promise(() => undefined));

    // Act
    const { result } = montar();

    // Assert
    expect(result.current.isLoading).toBe(true);
  });

  it('deve não indicar erro quando a consulta resolve', async () => {
    // Arrange
    const { result } = montar();

    // Act
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(result.current.isError).toBe(false);
  });

  it('deve devolver fila vazia quando ainda não há dado', () => {
    // Arrange
    listarSpy.mockReturnValue(new Promise(() => undefined));

    // Act
    const { result } = montar();

    // Assert
    expect(result.current.itens).toEqual([]);
  });

  it('deve devolver total zero quando ainda não há dado', () => {
    // Arrange
    listarSpy.mockReturnValue(new Promise(() => undefined));

    // Act
    const { result } = montar();

    // Assert
    expect(result.current.total).toBe(0);
  });

  it('deve devolver fila vazia quando listar rejeita', async () => {
    // Arrange
    listarSpy.mockRejectedValue(new Error('falha'));
    const { result } = montar();

    // Act
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.itens).toEqual([]);
  });

  it('deve devolver total zero quando listar rejeita', async () => {
    // Arrange
    listarSpy.mockRejectedValue(new Error('falha'));
    const { result } = montar();

    // Act
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.total).toBe(0);
  });

  it('deve consultar de novo quando refetch é chamado', async () => {
    // Arrange
    const { result } = montar();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Act
    await act(async () => {
      result.current.refetch();
    });

    // Assert
    await waitFor(() => expect(listarSpy).toHaveBeenCalledTimes(2));
  });

  it('deve repetir o filtro de atrasadas quando refetch é chamado', async () => {
    // Arrange
    const { result } = montar();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Act
    await act(async () => {
      result.current.refetch();
    });

    // Assert
    await waitFor(() => expect(listarSpy).toHaveBeenLastCalledWith(FILTROS));
  });

  it('deve não chamar listar quando enabled é false', () => {
    // Arrange
    // Act
    montar({ enabled: false });

    // Assert
    expect(listarSpy).not.toHaveBeenCalled();
  });

  it('deve repassar o dataUpdatedAt da consulta em cache quando ela resolve', async () => {
    // Arrange
    const { result, queryClient } = montar();

    // Act
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    const estado = queryClient.getQueryState(solicitacoesKeys.list(FILTROS));
    expect(result.current.dataUpdatedAt).toBe(estado?.dataUpdatedAt);
  });

  it('deve usar solicitacoesKeys.list como chave quando consulta', async () => {
    // Arrange
    const { result, queryClient } = montar();

    // Act
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    const consulta = queryClient.getQueryCache().find({ queryKey: solicitacoesKeys.list(FILTROS) });
    expect(consulta).not.toBeUndefined();
  });
});
