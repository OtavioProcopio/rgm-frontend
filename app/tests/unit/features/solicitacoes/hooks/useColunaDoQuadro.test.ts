/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';
import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';
import { solicitacoesKeys } from '@/features/solicitacoes/hooks/solicitacoesKeys';
import {
  useColunaDoQuadro,
  useColunasDoQuadro,
} from '@/features/solicitacoes/hooks/useColunaDoQuadro';
import type { SolicitacoesFilters } from '@/features/solicitacoes/types/solicitacaoTypes';

vi.mock('@/features/solicitacoes/api/solicitacoesApi', () => ({
  solicitacoesApi: { listar: vi.fn() },
}));

const TRINTA_DIAS_ATRAS = '2026-09-07T00:00:00.000Z';
const TOTAL = 45;

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

  it('deve pedir a página seguinte quando "carregar mais" é pedido', async () => {
    // Arrange
    apiCom(TOTAL);
    const { result } = await montar();

    // Act
    await carregarMais(result, 40);

    // Assert
    expect(paginasPedidas()).toEqual([0, 1]);
  });

  it('deve mostrar 40 cards depois de "carregar mais" com 20 de 45 na tela', async () => {
    // Arrange
    apiCom(TOTAL);
    const { result } = await montar();

    // Act
    act(() => result.current.carregarMais());

    // Assert
    await waitFor(() => expect(result.current.cards).toHaveLength(40));
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

  async function quarentaCarregadosSemOCard5() {
    apiCom(TOTAL);
    const montado = await montar();
    await carregarMais(montado.result, 40);
    apiCom(TOTAL - 1, (i) => `s-${i >= 5 ? i + 1 : i}`);
    await act(() => montado.queryClient.invalidateQueries({ queryKey: solicitacoesKeys.lists() }));
    await waitFor(() =>
      expect(montado.result.current.cards.some((card) => card.id === 's-45')).toBe(false),
    );
    return montado.result;
  }

  it('deve tirar da coluna o card que saiu por uma ação', async () => {
    // Act
    const result = await quarentaCarregadosSemOCard5();

    // Assert
    expect(result.current.cards.some((card) => card.id === 's-5')).toBe(false);
  });

  it('deve continuar com 40 cards quando um sai e há outro além dos carregados para ocupar o lugar', async () => {
    // Act
    const result = await quarentaCarregadosSemOCard5();

    // Assert
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

  async function falharAoCarregarMais() {
    apiCom(TOTAL);
    const { result } = await montar();
    vi.mocked(solicitacoesApi.listar).mockRejectedValue(new Error('sem rede'));
    act(() => result.current.carregarMais());
    await waitFor(() => expect(result.current.falhouAoCarregarMais).toBe(true));
    return result;
  }

  it('deve manter os cards já carregados quando a busca do bloco seguinte falha', async () => {
    // Act
    const result = await falharAoCarregarMais();

    // Assert
    expect(result.current.cards).toHaveLength(20);
  });

  it('deve não tratar como erro da coluna a falha ao buscar o bloco seguinte', async () => {
    // Act
    const result = await falharAoCarregarMais();

    // Assert
    expect(result.current.erro).toBeNull();
  });

  it('deve dizer que não houve falha ao carregar mais quando a coluna só fez a primeira carga', async () => {
    // Arrange
    apiCom(TOTAL);

    // Act
    const { result } = await montar();

    // Assert
    expect(result.current.falhouAoCarregarMais).toBe(false);
  });
});

describe('useColunasDoQuadro', () => {
  async function montarAsCinco() {
    apiCom(3);
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useColunasDoQuadro({ modeloId: 'm-1' }, TRINTA_DIAS_ATRAS), {
      wrapper: QueryWrapper,
    });
    await waitFor(() =>
      expect(Object.values(result.current).every((coluna) => !coluna.carregando)).toBe(true),
    );
    return result;
  }

  it('deve abrir o quadro com uma consulta por coluna, cada uma do seu status', async () => {
    // Act
    await montarAsCinco();

    // Assert
    const status = vi.mocked(solicitacoesApi.listar).mock.calls.map(([filtros]) => filtros.status);
    expect(status.sort()).toEqual(['A_FAZER', 'CANCELADA', 'CONCLUIDA', 'EM_ANDAMENTO', 'EM_VALIDACAO']);
  });

  it('deve pedir 20 itens da primeira página em cada uma das cinco consultas', async () => {
    // Act
    await montarAsCinco();

    // Assert
    const paginas = vi.mocked(solicitacoesApi.listar).mock.calls.map(([f]) => `${f.page}/${f.size}`);
    expect(paginas).toEqual(['0/20', '0/20', '0/20', '0/20', '0/20']);
  });

  it.each(['A_FAZER', 'EM_ANDAMENTO', 'EM_VALIDACAO', 'CONCLUIDA', 'CANCELADA'] as const)(
    'deve entregar na chave %s a coluna desse status',
    async (status) => {
      // Arrange
      vi.mocked(solicitacoesApi.listar).mockImplementation((filtros: SolicitacoesFilters) =>
        Promise.resolve({
          content: [criarSolicitacao({ id: `card-${filtros.status}`, status: filtros.status })],
          page: 0,
          size: 20,
          totalElements: 1,
          totalPages: 1,
        }),
      );
      const { QueryWrapper } = createQueryWrapper();

      // Act
      const { result } = renderHook(() => useColunasDoQuadro({}, TRINTA_DIAS_ATRAS), {
        wrapper: QueryWrapper,
      });

      // Assert
      await waitFor(() => expect(result.current[status].cards[0]?.id).toBe(`card-${status}`));
    },
  );

  it('deve repassar o filtro do quadro às cinco colunas', async () => {
    // Act
    await montarAsCinco();

    // Assert
    const modelos = vi.mocked(solicitacoesApi.listar).mock.calls.map(([filtros]) => filtros.modeloId);
    expect(modelos).toEqual(['m-1', 'm-1', 'm-1', 'm-1', 'm-1']);
  });
});
