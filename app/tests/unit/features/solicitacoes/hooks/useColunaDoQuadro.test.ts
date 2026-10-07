/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';
import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';
import { solicitacoesKeys } from '@/features/solicitacoes/hooks/solicitacoesKeys';
import { useColunaDoQuadro } from '@/features/solicitacoes/hooks/useColunaDoQuadro';
import type { SolicitacoesFilters } from '@/features/solicitacoes/types/solicitacaoTypes';

vi.mock('@/features/solicitacoes/api/solicitacoesApi', () => ({
  solicitacoesApi: { listar: vi.fn() },
}));

const TRINTA_DIAS_ATRAS = '2026-09-07T00:00:00.000Z';
const TOTAL = 45;

/** API simulada com `total` solicitações em andamento, paginadas como a real. */
function apiCom(total: number, idDoCard = (i: number) => `s-${i}`) {
  vi.mocked(solicitacoesApi.listar).mockImplementation((filtros: SolicitacoesFilters) => {
    const inicio = filtros.page * filtros.size;
    const quantos = Math.max(Math.min(filtros.size, total - inicio), 0);
    return Promise.resolve({
      content: Array.from({ length: quantos }, (_, i) =>
        criarSolicitacao({ id: idDoCard(inicio + i), status: 'EM_ANDAMENTO' }),
      ),
      page: filtros.page,
      size: filtros.size,
      totalElements: total,
      totalPages: Math.ceil(total / filtros.size),
    });
  });
}

async function montar() {
  const { QueryWrapper, queryClient } = createQueryWrapper();
  const { result } = renderHook(
    () => useColunaDoQuadro('EM_ANDAMENTO', {}, TRINTA_DIAS_ATRAS),
    { wrapper: QueryWrapper },
  );
  await waitFor(() => expect(result.current.carregando).toBe(false));
  return { result, queryClient };
}

async function carregarMais(result: Awaited<ReturnType<typeof montar>>['result'], esperado: number) {
  act(() => result.current.carregarMais());
  await waitFor(() => expect(result.current.cards).toHaveLength(esperado));
}

const paginasPedidas = () =>
  vi.mocked(solicitacoesApi.listar).mock.calls.map(([filtros]) => filtros.page);

beforeEach(() => {
  vi.mocked(solicitacoesApi.listar).mockReset();
});

describe('useColunaDoQuadro', () => {
  it('deve pedir um bloco só, de 20, do status da coluna quando o quadro abre', async () => {
    // Arrange
    apiCom(TOTAL);

    // Act
    await montar();

    // Assert
    expect(solicitacoesApi.listar).toHaveBeenCalledTimes(1);
    expect(solicitacoesApi.listar).toHaveBeenCalledWith({
      status: 'EM_ANDAMENTO',
      page: 0,
      size: 20,
    });
  });

  it('deve mostrar os 20 primeiros cards quando a coluna tem 45', async () => {
    // Arrange
    apiCom(TOTAL);

    // Act
    const { result } = await montar();

    // Assert
    expect(result.current.cards).toHaveLength(20);
  });

  it('deve informar o total da API, e não a quantidade carregada', async () => {
    // Arrange
    apiCom(TOTAL);

    // Act
    const { result } = await montar();

    // Assert
    expect(result.current.total).toBe(45);
  });

  it('deve dizer que há mais quando existem blocos ainda não carregados', async () => {
    // Arrange
    apiCom(TOTAL);

    // Act
    const { result } = await montar();

    // Assert
    expect(result.current.temMais).toBe(true);
  });

  it('deve mostrar 40 cards quando "carregar mais" é pedido com 20 de 45 na tela', async () => {
    // Arrange
    apiCom(TOTAL);
    const { result } = await montar();

    // Act
    await carregarMais(result, 40);

    // Assert
    expect(paginasPedidas()).toEqual([0, 1]);
  });

  it('deve dizer que não há mais quando o último bloco foi carregado', async () => {
    // Arrange
    apiCom(TOTAL);
    const { result } = await montar();
    await carregarMais(result, 40);

    // Act
    await carregarMais(result, 45);

    // Assert
    expect(result.current.temMais).toBe(false);
  });

  it('deve dizer que não há mais quando a coluna cabe em um bloco', async () => {
    // Arrange
    apiCom(7);

    // Act
    const { result } = await montar();

    // Assert
    expect(result.current.temMais).toBe(false);
  });

  it('deve buscar de novo os dois blocos carregados quando as listas são atualizadas', async () => {
    // Arrange
    apiCom(TOTAL);
    const { result, queryClient } = await montar();
    await carregarMais(result, 40);
    vi.mocked(solicitacoesApi.listar).mockClear();

    // Act
    await act(() => queryClient.invalidateQueries({ queryKey: solicitacoesKeys.lists() }));

    // Assert
    expect(paginasPedidas()).toEqual([0, 1]);
  });

  it('deve tirar da coluna o card que saiu por uma ação, mantendo os dois blocos carregados', async () => {
    // Arrange
    apiCom(TOTAL);
    const { result, queryClient } = await montar();
    await carregarMais(result, 40);
    apiCom(TOTAL - 1, (i) => `s-${i >= 5 ? i + 1 : i}`);

    // Act
    await act(() => queryClient.invalidateQueries({ queryKey: solicitacoesKeys.lists() }));

    // Assert
    await waitFor(() => expect(result.current.cards.some((card) => card.id === 's-5')).toBe(false));
    expect(result.current.cards).toHaveLength(40);
  });

  it('deve mostrar 39 cards quando um dos 40 carregados sai e não há outro para ocupar o lugar', async () => {
    // Arrange
    apiCom(40);
    const { result, queryClient } = await montar();
    await carregarMais(result, 40);
    apiCom(39, (i) => `s-${i >= 5 ? i + 1 : i}`);

    // Act
    await act(() => queryClient.invalidateQueries({ queryKey: solicitacoesKeys.lists() }));

    // Assert
    await waitFor(() => expect(result.current.cards).toHaveLength(39));
  });

  it('deve mostrar uma vez o card que veio repetido em dois blocos', async () => {
    // Arrange
    apiCom(40, (i) => (i === 20 ? 's-19' : `s-${i}`));
    const { result } = await montar();

    // Act
    await carregarMais(result, 39);

    // Assert
    expect(result.current.cards.filter((card) => card.id === 's-19')).toHaveLength(1);
  });

  it('deve repassar o erro da API quando a busca falha', async () => {
    // Arrange
    const falha = new Error('sem rede');
    vi.mocked(solicitacoesApi.listar).mockRejectedValue(falha);

    // Act
    const { result } = await montar();

    // Assert
    expect(result.current.erro).toBe(falha);
  });

  it('deve limitar aos últimos 30 dias a coluna de concluídas sem período escolhido', async () => {
    // Arrange
    apiCom(0);
    const { QueryWrapper } = createQueryWrapper();

    // Act
    const { result } = renderHook(() => useColunaDoQuadro('CONCLUIDA', {}, TRINTA_DIAS_ATRAS), {
      wrapper: QueryWrapper,
    });
    await waitFor(() => expect(result.current.carregando).toBe(false));

    // Assert
    expect(solicitacoesApi.listar).toHaveBeenCalledWith({
      status: 'CONCLUIDA',
      page: 0,
      size: 20,
      tipoData: 'CONCLUSAO',
      dataInicio: TRINTA_DIAS_ATRAS,
    });
  });
});
