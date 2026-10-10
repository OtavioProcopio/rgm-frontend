/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';
import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';
import { useIndicadoresDoPeriodo } from '@/features/solicitacoes/hooks/useIndicadoresDoPeriodo';
import { intervalosDoPeriodo } from '@/features/solicitacoes/lib/periodoDoPainel';
import { LIMITE_DA_AMOSTRA } from '@/features/solicitacoes/lib/leituraDosIndicadores';
import type {
  Solicitacao,
  SolicitacoesFilters,
} from '@/features/solicitacoes/types/solicitacaoTypes';
import type { PageResponse } from '@/shared/types/page';

const AGORA = '2026-10-09T15:00:00Z';

function pagina(content: Solicitacao[], totalElements: number): PageResponse<Solicitacao> {
  return { content, page: 0, size: LIMITE_DA_AMOSTRA, totalElements, totalPages: 1 };
}

function comTempo(segundos: number | null): Solicitacao {
  return criarSolicitacao({ tempoResolucaoSegundos: segundos });
}

function filtrosEsperados(intervalo: { inicio: string; fim: string }): SolicitacoesFilters {
  return {
    status: 'CONCLUIDA',
    tipoData: 'CONCLUSAO',
    dataInicio: intervalo.inicio,
    dataFim: intervalo.fim,
    page: 0,
    size: LIMITE_DA_AMOSTRA,
  };
}

function responderPorPeriodo(
  atual: PageResponse<Solicitacao>,
  anterior: PageResponse<Solicitacao>,
): void {
  const inicioAtual: string = intervalosDoPeriodo(30, new Date()).atual.inicio;
  vi.spyOn(solicitacoesApi, 'listar').mockImplementation(async (filtros: SolicitacoesFilters) =>
    filtros.dataInicio === inicioAtual ? atual : anterior,
  );
}

function rejeitarJanelaAtual(): void {
  const inicioAtual: string = intervalosDoPeriodo(30, new Date()).atual.inicio;
  vi.spyOn(solicitacoesApi, 'listar').mockImplementation(async (filtros: SolicitacoesFilters) => {
    if (filtros.dataInicio === inicioAtual) throw new Error('falha de rede');
    return pagina([], 4);
  });
}

function montar(dias: number) {
  const { QueryWrapper } = createQueryWrapper();
  return renderHook(({ valor }: { valor: number }) => useIndicadoresDoPeriodo(valor), {
    initialProps: { valor: dias },
    wrapper: QueryWrapper,
  });
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(AGORA);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('useIndicadoresDoPeriodo', () => {
  it('deve chamar listar exatamente duas vezes quando monta', async () => {
    // Arrange
    responderPorPeriodo(pagina([], 0), pagina([], 0));

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(solicitacoesApi.listar).toHaveBeenCalledTimes(2);
  });

  it('deve consultar a janela atual quando monta', async () => {
    // Arrange
    responderPorPeriodo(pagina([], 0), pagina([], 0));
    const intervalos = intervalosDoPeriodo(30, new Date());

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(solicitacoesApi.listar).toHaveBeenCalledWith(filtrosEsperados(intervalos.atual));
  });

  it('deve consultar a janela anterior quando monta', async () => {
    // Arrange
    responderPorPeriodo(pagina([], 0), pagina([], 0));
    const intervalos = intervalosDoPeriodo(30, new Date());

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(solicitacoesApi.listar).toHaveBeenCalledWith(filtrosEsperados(intervalos.anterior));
  });

  it('deve devolver as concluídas atual e anterior pelos totalElements', async () => {
    // Arrange
    responderPorPeriodo(pagina([], 12), pagina([], 8));

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.concluidas).toBeDefined());

    // Assert
    expect(result.current.concluidas).toEqual({ atual: 12, anterior: 8 });
  });

  it('deve devolver a média dos tempos sem amostra quando o total não passa do limite', async () => {
    // Arrange
    const atual = pagina([comTempo(100), comTempo(300), comTempo(null)], 3);
    const anterior = pagina([comTempo(50)], 1);
    responderPorPeriodo(atual, anterior);

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.tempoMedio).toBeDefined());

    // Assert
    expect(result.current.tempoMedio).toEqual({
      atual: { segundos: 200, amostra: null },
      anterior: { segundos: 50, amostra: null },
    });
  });

  it('deve preencher a amostra quando o total passa do limite', async () => {
    // Arrange
    const total: number = LIMITE_DA_AMOSTRA + 20;
    responderPorPeriodo(pagina([comTempo(60), comTempo(120)], total), pagina([], 0));

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.tempoMedio).toBeDefined());

    // Assert
    expect(result.current.tempoMedio?.atual).toEqual({
      segundos: 90,
      amostra: { usados: 2, total },
    });
  });

  it('deve devolver tempo médio nulo quando nenhum item tem tempo', async () => {
    // Arrange
    responderPorPeriodo(pagina([comTempo(null)], 1), pagina([], 0));

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.tempoMedio).toBeDefined());

    // Assert
    expect(result.current.tempoMedio).toEqual({ atual: null, anterior: null });
  });

  it('deve estar carregando e sem dados antes das respostas chegarem', () => {
    // Arrange
    responderPorPeriodo(pagina([], 1), pagina([], 1));

    // Act
    const { result } = montar(30);

    // Assert
    expect(result.current.isLoading).toBe(true);
  });

  it('deve estar sem concluídas antes das respostas chegarem', () => {
    // Arrange
    responderPorPeriodo(pagina([], 1), pagina([], 1));

    // Act
    const { result } = montar(30);

    // Assert
    expect(result.current.concluidas).toBeUndefined();
  });

  it('deve estar sem tempo médio antes das respostas chegarem', () => {
    // Arrange
    responderPorPeriodo(pagina([], 1), pagina([], 1));

    // Act
    const { result } = montar(30);

    // Assert
    expect(result.current.tempoMedio).toBeUndefined();
  });

  it('deve não sinalizar erro quando as duas respostas chegam', async () => {
    // Arrange
    responderPorPeriodo(pagina([], 1), pagina([], 1));

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(result.current.isError).toBe(false);
  });

  it('deve não devolver concluídas quando uma das duas consultas rejeita', async () => {
    // Arrange
    rejeitarJanelaAtual();

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.concluidas).toBeUndefined();
  });

  it('deve não devolver tempo médio quando uma das duas consultas rejeita', async () => {
    // Arrange
    rejeitarJanelaAtual();

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.tempoMedio).toBeUndefined();
  });

  it('deve refazer as duas consultas quando refetch é chamado', async () => {
    // Arrange
    responderPorPeriodo(pagina([], 1), pagina([], 1));
    const { result } = montar(30);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Act
    await act(async () => {
      result.current.refetch();
    });

    // Assert
    await waitFor(() => expect(solicitacoesApi.listar).toHaveBeenCalledTimes(4));
  });

  it('deve devolver undefined quando refetch é chamado', async () => {
    // Arrange
    responderPorPeriodo(pagina([], 1), pagina([], 1));
    const { result } = montar(30);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    let retorno: unknown = 'nao-chamado';

    // Act
    await act(async () => {
      retorno = result.current.refetch();
    });

    // Assert
    expect(retorno).toBeUndefined();
  });

  it('deve consultar mais duas vezes quando os dias mudam de 30 para 7', async () => {
    // Arrange
    responderPorPeriodo(pagina([], 1), pagina([], 1));
    const { result, rerender } = montar(30);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Act
    rerender({ valor: 7 });

    // Assert
    await waitFor(() => expect(solicitacoesApi.listar).toHaveBeenCalledTimes(4));
  });

  it('deve consultar a janela atual de 7 dias quando os dias mudam de 30 para 7', async () => {
    // Arrange
    responderPorPeriodo(pagina([], 1), pagina([], 1));
    const { result, rerender } = montar(30);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const novos = intervalosDoPeriodo(7, new Date());

    // Act
    rerender({ valor: 7 });

    // Assert
    await waitFor(() =>
      expect(solicitacoesApi.listar).toHaveBeenCalledWith(filtrosEsperados(novos.atual)),
    );
  });

  it('deve consultar a janela anterior de 7 dias quando os dias mudam de 30 para 7', async () => {
    // Arrange
    responderPorPeriodo(pagina([], 1), pagina([], 1));
    const { result, rerender } = montar(30);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const novos = intervalosDoPeriodo(7, new Date());

    // Act
    rerender({ valor: 7 });

    // Assert
    await waitFor(() =>
      expect(solicitacoesApi.listar).toHaveBeenCalledWith(filtrosEsperados(novos.anterior)),
    );
  });
});
