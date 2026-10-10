/**
 * @vitest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';

import { OPCOES_PADRAO_DAS_CONSULTAS } from '@/app/providers/queryOptions';
import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';
import { useDistribuicaoDoTrabalho } from '@/features/solicitacoes/hooks/useDistribuicaoDoTrabalho';
import type { VisaoDaDistribuicao } from '@/features/solicitacoes/lib/distribuicaoDoTrabalho';
import type {
  MetricasResponse,
  Solicitacao,
  SolicitacoesFilters,
} from '@/features/solicitacoes/types/solicitacaoTypes';
import type { PageResponse } from '@/shared/types/page';

const METRICAS: MetricasResponse = {
  totalUsuarios: 3,
  totalModelos: 2,
  totalSolicitacoes: 50,
  solicitacoesPorStatus: {
    A_FAZER: 5,
    EM_ANDAMENTO: 3,
    EM_VALIDACAO: 2,
    CONCLUIDA: 30,
    CANCELADA: 10,
  },
  solicitacoesAbertas: 10,
  solicitacoesPendentes: 5,
  solicitacoesConcluidas: 30,
  tempoMedioResolucaoSegundos: 100,
};

const TOTAIS: Record<string, number> = {
  REPARO: 4,
  INSPECAO: 3,
  REENGENHARIA: 2,
  CRIACAO: 1,
  URGENTE: 8,
  ALTA: 6,
  MEDIA: 4,
  BAIXA: 2,
};

function pagina(totalElements: number): PageResponse<Solicitacao> {
  return { content: [], page: 0, size: 1, totalElements, totalPages: totalElements };
}

function totalDoFiltro(filtros: SolicitacoesFilters): number {
  return TOTAIS[String(filtros.tipo ?? filtros.prioridade)];
}

let listar: MockInstance<typeof solicitacoesApi.listar>;

beforeEach(() => {
  listar = vi.spyOn(solicitacoesApi, 'listar');
  listar.mockImplementation(async (filtros) => pagina(totalDoFiltro(filtros)));
});

afterEach(() => {
  vi.restoreAllMocks();
});

function montar(visaoInicial: VisaoDaDistribuicao, metricas: MetricasResponse | undefined) {
  const { QueryWrapper } = createQueryWrapper();
  return renderHook(({ visao }) => useDistribuicaoDoTrabalho(visao, metricas), {
    wrapper: QueryWrapper,
    initialProps: { visao: visaoInicial },
  });
}

const CONFIGURACAO_DO_QUERY_PROVIDER = { ...OPCOES_PADRAO_DAS_CONSULTAS, retry: false };

function montarComConfiguracaoDoProvider(
  visaoInicial: VisaoDaDistribuicao,
  metricas: MetricasResponse | undefined,
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: CONFIGURACAO_DO_QUERY_PROVIDER },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(({ visao }) => useDistribuicaoDoTrabalho(visao, metricas), {
    wrapper,
    initialProps: { visao: visaoInicial },
  });
}

function rejeitarInspecao(): void {
  listar.mockImplementation(async (filtros) => {
    if (filtros.tipo === 'INSPECAO') throw new Error('falha');
    return pagina(totalDoFiltro(filtros));
  });
}

describe('useDistribuicaoDoTrabalho', () => {
  it('deve não chamar a API quando a visão é status', () => {
    // Arrange
    // Act
    montar('status', METRICAS);

    // Assert
    expect(listar).not.toHaveBeenCalled();
  });

  it('deve devolver as três contagens abertas das métricas quando a visão é status', () => {
    // Arrange
    // Act
    const { result } = montar('status', METRICAS);

    // Assert
    expect(result.current.partes).toEqual([
      { valor: 'A_FAZER', rotulo: 'A fazer', quantidade: 5 },
      { valor: 'EM_ANDAMENTO', rotulo: 'Em andamento', quantidade: 3 },
      { valor: 'EM_VALIDACAO', rotulo: 'Em validação', quantidade: 2 },
    ]);
  });

  it('deve devolver partes indefinidas quando as métricas não existem', () => {
    // Arrange
    // Act
    const { result } = montar('status', undefined);

    // Assert
    expect(result.current.partes).toBeUndefined();
  });

  it('deve não indicar carregamento quando as métricas não existem', () => {
    // Arrange
    // Act
    const { result } = montar('status', undefined);

    // Assert
    expect(result.current.isLoading).toBe(false);
  });

  it('deve não indicar erro quando as métricas não existem', () => {
    // Arrange
    // Act
    const { result } = montar('status', undefined);

    // Assert
    expect(result.current.isError).toBe(false);
  });

  it('deve não consultar a API ao refazer quando a visão é status', () => {
    // Arrange
    const { result } = montar('status', METRICAS);

    // Act
    result.current.refetch();

    // Assert
    expect(listar).not.toHaveBeenCalled();
  });

  it('deve consultar a API uma vez por tipo em aberto quando a visão é tipo', async () => {
    // Arrange
    const { result } = montar('tipo', METRICAS);

    // Act
    await waitFor(() => expect(result.current.partes).toBeDefined());

    // Assert
    expect(listar).toHaveBeenCalledTimes(4);
  });

  it('deve consultar cada tipo em aberto com tamanho 1 quando a visão é tipo', async () => {
    // Arrange
    const { result } = montar('tipo', METRICAS);

    // Act
    await waitFor(() => expect(result.current.partes).toBeDefined());

    // Assert
    expect(listar.mock.calls.map(([filtros]) => filtros)).toEqual(
      ['REPARO', 'INSPECAO', 'REENGENHARIA', 'CRIACAO'].map((tipo) => ({
        emAberto: true,
        tipo,
        page: 0,
        size: 1,
      })),
    );
  });

  it('deve consultar cada prioridade em aberto quando a visão é prioridade', async () => {
    // Arrange
    const { result } = montar('prioridade', METRICAS);

    // Act
    await waitFor(() => expect(result.current.partes).toBeDefined());

    // Assert
    expect(listar.mock.calls.map(([filtros]) => filtros)).toEqual(
      ['URGENTE', 'ALTA', 'MEDIA', 'BAIXA'].map((prioridade) => ({
        emAberto: true,
        prioridade,
        page: 0,
        size: 1,
      })),
    );
  });

  it('deve consultar quatro prioridades quando a visão é prioridade', async () => {
    // Arrange
    const { result } = montar('prioridade', METRICAS);

    // Act
    await waitFor(() => expect(result.current.partes).toBeDefined());

    // Assert
    expect(listar).toHaveBeenCalledTimes(4);
  });

  it('deve usar totalElements como quantidade de cada parte quando a visão é tipo', async () => {
    // Arrange
    const { result } = montar('tipo', METRICAS);

    // Act
    await waitFor(() => expect(result.current.partes).toBeDefined());

    // Assert
    expect(result.current.partes?.map((parte) => parte.quantidade)).toEqual([4, 3, 2, 1]);
  });

  it('deve manter a ordem dos tipos nas partes quando a visão é tipo', async () => {
    // Arrange
    const { result } = montar('tipo', METRICAS);

    // Act
    await waitFor(() => expect(result.current.partes).toBeDefined());

    // Assert
    expect(result.current.partes?.map((parte) => parte.valor)).toEqual([
      'REPARO',
      'INSPECAO',
      'REENGENHARIA',
      'CRIACAO',
    ]);
  });

  it('deve devolver as quatro partes de prioridade quando as contagens chegam', async () => {
    // Arrange
    const { result } = montar('prioridade', METRICAS);

    // Act
    await waitFor(() => expect(result.current.partes).toBeDefined());

    // Assert
    expect(result.current.partes).toHaveLength(4);
  });

  it('deve chamar a API quatro vezes quando a visão muda de status para tipo', async () => {
    // Arrange
    const { result, rerender } = montar('status', METRICAS);

    // Act
    rerender({ visao: 'tipo' });
    await waitFor(() => expect(result.current.partes).toBeDefined());

    // Assert
    expect(listar).toHaveBeenCalledTimes(4);
  });

  it('deve indicar carregamento enquanto as consultas estão pendentes', () => {
    // Arrange
    listar.mockImplementation(() => new Promise<PageResponse<Solicitacao>>(() => undefined));

    // Act
    const { result } = montar('tipo', METRICAS);

    // Assert
    expect(result.current.isLoading).toBe(true);
  });

  it('deve deixar partes indefinidas enquanto as consultas estão pendentes', () => {
    // Arrange
    listar.mockImplementation(() => new Promise<PageResponse<Solicitacao>>(() => undefined));

    // Act
    const { result } = montar('tipo', METRICAS);

    // Assert
    expect(result.current.partes).toBeUndefined();
  });

  it('deve encerrar o carregamento quando as quatro consultas chegam', async () => {
    // Arrange
    const { result } = montar('tipo', METRICAS);

    // Act
    await waitFor(() => expect(result.current.partes).toBeDefined());

    // Assert
    expect(result.current.isLoading).toBe(false);
  });

  it('deve não indicar erro quando as quatro consultas chegam', async () => {
    // Arrange
    const { result } = montar('tipo', METRICAS);

    // Act
    await waitFor(() => expect(result.current.partes).toBeDefined());

    // Assert
    expect(result.current.isError).toBe(false);
  });

  it('deve deixar partes indefinidas quando uma consulta rejeita', async () => {
    // Arrange
    rejeitarInspecao();

    // Act
    const { result } = montar('tipo', METRICAS);
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.partes).toBeUndefined();
  });

  it('deve encerrar o carregamento quando uma consulta rejeita', async () => {
    // Arrange
    rejeitarInspecao();

    // Act
    const { result } = montar('tipo', METRICAS);
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.isLoading).toBe(false);
  });

  it('deve não refazer as consultas quando a visão volta a uma já carregada', async () => {
    // Arrange
    const { result, rerender } = montarComConfiguracaoDoProvider('tipo', METRICAS);
    await waitFor(() => expect(result.current.partes).toBeDefined());
    rerender({ visao: 'status' });

    // Act
    rerender({ visao: 'tipo' });

    // Assert
    expect(listar).toHaveBeenCalledTimes(4);
  });

  it('deve refazer as quatro consultas quando refetch é chamado', async () => {
    // Arrange
    const { result } = montar('tipo', METRICAS);
    await waitFor(() => expect(result.current.partes).toBeDefined());

    // Act
    await act(async () => {
      result.current.refetch();
    });

    // Assert
    await waitFor(() => expect(listar).toHaveBeenCalledTimes(8));
  });

  it('deve devolver undefined quando refetch é chamado na visão tipo', async () => {
    // Arrange
    const { result } = montar('tipo', METRICAS);
    await waitFor(() => expect(result.current.partes).toBeDefined());

    // Act
    let retorno: unknown = 'intacto';
    await act(async () => {
      retorno = result.current.refetch();
    });

    // Assert
    expect(retorno).toBeUndefined();
  });
});
