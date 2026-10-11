/**
 * @vitest-environment jsdom
 */
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@tests/support/queryWrapper';

import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';
import { useHistoricoMetricas } from '@/features/solicitacoes/hooks/useHistoricoMetricas';
import type {
  HistoricoMetricas,
  PainelPorPeriodo,
  PeriodoAnteriorDoPainel,
} from '@/features/solicitacoes/types/solicitacaoTypes';
import { ApiError } from '@/shared/api/apiError';

const ANTERIOR: PeriodoAnteriorDoPainel = {
  inicio: '2026-09-10',
  fim: '2026-10-10',
  criadas: 0,
  concluidas: 0,
  canceladas: 0,
  tempoMedioResolucaoSegundos: null,
  serie: [],
};
const PAINEL: PainelPorPeriodo = {
  periodo: {
    ...ANTERIOR,
    abertasAgora: 0,
    atrasadasAgora: 0,
    serie: [
      {
        rotulo: '09/10',
        criadas: 4,
        concluidas: 2,
        canceladas: 1,
        abertasAoFimDoDia: 9,
        atrasadasAoFimDoDia: 3,
      },
    ],
  },
  anterior: ANTERIOR,
};
const HISTORICO: HistoricoMetricas = {
  series: [
    { periodo: '2026-10-09', total: 6, abertas: 5, concluidas: 1, canceladas: 0, slaMediaHoras: 2 },
  ],
  slaGlobalMediaHoras: 2,
  periodoLabel: 'Últimos 30 dias',
};

function montar(dias: number, modeloId?: string) {
  const { QueryWrapper } = createQueryWrapper();
  return renderHook(() => useHistoricoMetricas(dias, modeloId), { wrapper: QueryWrapper });
}

function painelIndisponivel(): void {
  vi.spyOn(solicitacoesApi, 'obterPainel').mockRejectedValue(
    new ApiError({ status: 404, message: 'não encontrado' }),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useHistoricoMetricas — com o painel', () => {
  it('deve devolver a série do painel com criadas e concluídas de cada dia quando ele responde', async () => {
    // Arrange
    vi.spyOn(solicitacoesApi, 'obterPainel').mockResolvedValue(PAINEL);
    vi.spyOn(solicitacoesApi, 'obterHistoricoMetricas');

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.data).toBeDefined());

    // Assert
    expect(result.current.data).toEqual({
      series: [{ periodo: '09/10', total: 4, abertas: 9, concluidas: 2, canceladas: 1 }],
      periodoLabel: 'Últimos 30 dias',
      porDataDoEvento: true,
    });
  });

  it('deve não chamar o histórico quando o painel responde', async () => {
    // Arrange
    vi.spyOn(solicitacoesApi, 'obterPainel').mockResolvedValue(PAINEL);
    const historico = vi.spyOn(solicitacoesApi, 'obterHistoricoMetricas');

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.data).toBeDefined());

    // Assert
    expect(historico).not.toHaveBeenCalled();
  });

  it('deve consultar o painel com os dias e o modelo quando monta', async () => {
    // Arrange
    const obterPainel = vi.spyOn(solicitacoesApi, 'obterPainel').mockResolvedValue(PAINEL);

    // Act
    const { result } = montar(7, 'modelo-1');
    await waitFor(() => expect(result.current.data).toBeDefined());

    // Assert
    expect(obterPainel).toHaveBeenCalledExactlyOnceWith(7, 'modelo-1');
  });

  it('deve estar pendente quando o painel ainda não respondeu', () => {
    // Arrange
    vi.spyOn(solicitacoesApi, 'obterPainel').mockReturnValue(new Promise(() => undefined));

    // Act
    const { result } = montar(30);

    // Assert
    expect(result.current.isPending).toBe(true);
  });

  it('deve sinalizar erro e não chamar o histórico quando o painel responde 500', async () => {
    // Arrange
    vi.spyOn(solicitacoesApi, 'obterPainel').mockRejectedValue(
      new ApiError({ status: 500, message: 'erro' }),
    );
    const historico = vi.spyOn(solicitacoesApi, 'obterHistoricoMetricas');

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(historico).not.toHaveBeenCalled();
  });

  it('deve refazer o painel quando refetch é chamado e o painel respondeu', async () => {
    // Arrange
    const obterPainel = vi.spyOn(solicitacoesApi, 'obterPainel').mockResolvedValue(PAINEL);
    const { result } = montar(30);
    await waitFor(() => expect(result.current.data).toBeDefined());

    // Act
    await act(async () => {
      await result.current.refetch();
    });

    // Assert
    expect(obterPainel).toHaveBeenCalledTimes(2);
  });
});

describe('useHistoricoMetricas — painel inexistente (spec 013)', () => {
  it('deve devolver a série do histórico por data de criação quando o painel responde 404', async () => {
    // Arrange
    painelIndisponivel();
    vi.spyOn(solicitacoesApi, 'obterHistoricoMetricas').mockResolvedValue(HISTORICO);

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.data).toBeDefined());

    // Assert
    expect(result.current.data).toEqual({
      series: HISTORICO.series,
      periodoLabel: 'Últimos 30 dias',
      porDataDoEvento: false,
    });
  });

  it('deve consultar o histórico com os dias e o modelo quando o painel responde 404', async () => {
    // Arrange
    painelIndisponivel();
    const historico = vi
      .spyOn(solicitacoesApi, 'obterHistoricoMetricas')
      .mockResolvedValue(HISTORICO);

    // Act
    const { result } = montar(7, 'modelo-1');
    await waitFor(() => expect(result.current.data).toBeDefined());

    // Assert
    expect(historico).toHaveBeenCalledExactlyOnceWith(7, 'modelo-1');
  });

  it('deve estar pendente quando o histórico não respondeu e o painel deu 404', async () => {
    // Arrange
    painelIndisponivel();
    const historico = vi
      .spyOn(solicitacoesApi, 'obterHistoricoMetricas')
      .mockReturnValue(new Promise(() => undefined));

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(historico).toHaveBeenCalled());

    // Assert
    expect(result.current.isPending).toBe(true);
  });

  it('deve sinalizar erro quando o histórico falha depois do 404 do painel', async () => {
    // Arrange
    painelIndisponivel();
    vi.spyOn(solicitacoesApi, 'obterHistoricoMetricas').mockRejectedValue(new Error('falha'));

    // Act
    const { result } = montar(30);
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(result.current.data).toBeUndefined();
  });

  it('deve refazer o histórico quando refetch é chamado', async () => {
    // Arrange
    painelIndisponivel();
    const historico = vi
      .spyOn(solicitacoesApi, 'obterHistoricoMetricas')
      .mockResolvedValue(HISTORICO);
    const { result } = montar(30);
    await waitFor(() => expect(result.current.data).toBeDefined());

    // Act
    await act(async () => {
      await result.current.refetch();
    });

    // Assert
    expect(historico).toHaveBeenCalledTimes(2);
  });
});
