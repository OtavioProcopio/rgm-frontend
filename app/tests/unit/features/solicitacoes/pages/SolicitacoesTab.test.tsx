/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';
import { SolicitacoesTab } from '@/features/solicitacoes/pages/SolicitacoesTab';
import type {
  MetricasResponse,
  SolicitacoesFilters,
} from '@/features/solicitacoes/types/solicitacaoTypes';

vi.mock('@/features/solicitacoes/api/solicitacoesApi', () => ({
  solicitacoesApi: { listar: vi.fn() },
}));

const METRICAS = {
  totalUsuarios: 5,
  totalModelos: 2,
  totalSolicitacoes: 200,
  solicitacoesPorStatus: { A_FAZER: 3, EM_ANDAMENTO: 4, EM_VALIDACAO: 2, CONCLUIDA: 1, CANCELADA: 0 },
  solicitacoesAbertas: 9,
  solicitacoesPendentes: 3,
  solicitacoesConcluidas: 1,
  tempoMedioResolucaoSegundos: 86400,
} as unknown as MetricasResponse;

const EM_ABERTO_POR_PRIORIDADE: Record<string, number> = {
  URGENTE: 41,
  ALTA: 32,
  MEDIA: 23,
  BAIXA: 14,
};

beforeEach(() => {
  vi.mocked(solicitacoesApi.listar).mockReset();
  vi.mocked(solicitacoesApi.listar).mockImplementation((filtros: SolicitacoesFilters) =>
    Promise.resolve({
      content: [],
      page: 0,
      size: filtros.size,
      totalPages: 0,
      totalElements:
        filtros.emAberto && filtros.prioridade ? EM_ABERTO_POR_PRIORIDADE[filtros.prioridade] : 0,
    }),
  );
});

afterEach(cleanup);

async function abrirPainel() {
  const { AppWrapper } = createAppWrapper({ user: { nome: 'Ge', perfil: 'GESTOR' } });
  render(<SolicitacoesTab metricas={METRICAS} isAdmin={false} isGestor />, { wrapper: AppWrapper });
  await screen.findByText('41');
  return vi.mocked(solicitacoesApi.listar).mock.calls.map(([filtros]) => filtros);
}

describe('SolicitacoesTab — distribuição por prioridade', () => {
  it.each(['URGENTE', 'ALTA', 'MEDIA', 'BAIXA'])(
    'deve pedir à API a contagem das solicitações em aberto de prioridade %s, sem trazer a lista',
    async (prioridade) => {
      // Act
      const consultas = await abrirPainel();

      // Assert
      expect(consultas).toContainEqual({ emAberto: true, prioridade, page: 0, size: 1 });
    },
  );

  it.each(Object.entries(EM_ABERTO_POR_PRIORIDADE))(
    'deve mostrar na prioridade %s o total %i contado pela API',
    async (_prioridade, total) => {
      // Act
      await abrirPainel();

      // Assert
      expect(screen.getByText(String(total))).toBeDefined();
    },
  );

  it('deve pedir no máximo 5 itens em qualquer consulta do painel', async () => {
    // Act
    const consultas = await abrirPainel();

    // Assert
    expect(Math.max(...consultas.map((filtros) => filtros.size))).toBe(5);
  });

  it('deve não pedir lista de solicitações por status para contar prioridades', async () => {
    // Act
    const consultas = await abrirPainel();

    // Assert
    expect(consultas.filter((filtros) => filtros.status)).toEqual([]);
  });
});
