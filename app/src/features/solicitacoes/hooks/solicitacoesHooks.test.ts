/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createQueryWrapper } from '@/test-utils/queryWrapper';

import { useAbrirSolicitacao } from './useAbrirSolicitacao';
import { useAtividades } from './useAtividades';
import { useCancelarSolicitacao } from './useCancelarSolicitacao';
import { useDashboardData } from './useDashboardData';
import { useDevolverSolicitacao } from './useDevolverSolicitacao';
import { useEditarSolicitacao } from './useEditarSolicitacao';
import { useEncerrarSolicitacao } from './useEncerrarSolicitacao';
import { useEnviarParaValidacao } from './useEnviarParaValidacao';
import { useKanbanSolicitacoes } from './useKanbanSolicitacoes';
import { useMetricas } from './useMetricas';
import { useRegistrarComentario } from './useRegistrarComentario';
import { useSolicitacao } from './useSolicitacao';
import { useSolicitacoes } from './useSolicitacoes';
import { useTriarSolicitacao } from './useTriarSolicitacao';

vi.mock('../api/solicitacoesApi', () => {
  const s = {
    id: 's1', titulo: 'Reparo', descricao: 'Desc', tipo: 'REPARO', status: 'A_FAZER',
    prioridade: null, modeloId: 'm1', abertaPorUsuarioId: 'u1', comentarioFinal: null,
    criadaEm: '2024-01-01T00:00:00Z', atualizadaEm: '2024-01-01T00:00:00Z',
    concluidaEm: null, canceladaEm: null, responsavelIds: [],
  };
  const page = { content: [s], page: 0, totalPages: 1, totalElements: 1 };
  return {
    solicitacoesApi: {
      listar: vi.fn().mockResolvedValue(page),
      buscarPorId: vi.fn().mockResolvedValue(s),
      listarAtividades: vi.fn().mockResolvedValue([]),
      obterMetricas: vi.fn().mockResolvedValue({ total: 0 }),
      abrir: vi.fn().mockResolvedValue(s),
      editar: vi.fn().mockResolvedValue(s),
      cancelar: vi.fn().mockResolvedValue(s),
      encerrar: vi.fn().mockResolvedValue(s),
      devolver: vi.fn().mockResolvedValue(s),
      enviarParaValidacao: vi.fn().mockResolvedValue(s),
      triar: vi.fn().mockResolvedValue(s),
      registrarComentario: vi.fn().mockResolvedValue({}),
    },
  };
});

const mockSolicitacao = {
  id: 's1', titulo: 'Reparo', descricao: 'Desc', tipo: 'REPARO' as const, status: 'A_FAZER' as const,
  prioridade: null, modeloId: 'm1', abertaPorUsuarioId: 'u1', comentarioFinal: null,
  criadaEm: '2024-01-01T00:00:00Z', atualizadaEm: '2024-01-01T00:00:00Z',
  concluidaEm: null, canceladaEm: null, responsavelIds: [],
};
const mockPage = { content: [mockSolicitacao], page: 0, size: 20, totalPages: 1, totalElements: 1 };

afterEach(() => vi.clearAllMocks());

describe('useSolicitacoes', () => {
  it('fetches solicitacoes list', async () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSolicitacoes({ page: 0, size: 20 }), { wrapper: QueryWrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.content).toHaveLength(1);
  });
});

describe('useSolicitacao', () => {
  it('fetches a single solicitacao', async () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSolicitacao('s1'), { wrapper: QueryWrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.titulo).toBe('Reparo');
  });
});

describe('useKanbanSolicitacoes', () => {
  it('fetches solicitacoes and selects content', async () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useKanbanSolicitacoes(), { wrapper: QueryWrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe('useAtividades', () => {
  it('fetches atividades for solicitacao', async () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useAtividades('s1'), { wrapper: QueryWrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe('useMetricas', () => {
  it('fetches metricas', async () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useMetricas(), { wrapper: QueryWrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});

describe('useDashboardData', () => {
  it('returns metrics computed from solicitacoes', async () => {
    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useDashboardData(), { wrapper: QueryWrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.metrics.total).toBe(1);
    expect(result.current.metrics.byStatus['A_FAZER']).toBe(1);
  });

  it('calculates avgLeadTimeDays for concluded solicitacoes', async () => {
    const { solicitacoesApi } = await import('../api/solicitacoesApi');
    const concluded = {
      ...mockSolicitacao,
      status: 'CONCLUIDA' as const,
      criadaEm: '2024-01-01T00:00:00Z',
      concluidaEm: '2024-01-03T00:00:00Z',
    };
    vi.mocked(solicitacoesApi.listar).mockResolvedValueOnce({ ...mockPage, content: [concluded] });

    const { QueryWrapper } = createQueryWrapper();
    const { result } = renderHook(() => useDashboardData(), { wrapper: QueryWrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.metrics.avgLeadTimeDays).toBe(2);
  });
});

describe('mutation hooks', () => {
  it.each([
    ['useAbrirSolicitacao', useAbrirSolicitacao],
    ['useEditarSolicitacao', useEditarSolicitacao],
    ['useCancelarSolicitacao', useCancelarSolicitacao],
    ['useEncerrarSolicitacao', useEncerrarSolicitacao],
    ['useDevolverSolicitacao', useDevolverSolicitacao],
    ['useEnviarParaValidacao', useEnviarParaValidacao],
    ['useTriarSolicitacao', useTriarSolicitacao],
    ['useRegistrarComentario', useRegistrarComentario],
  ] as const)('%s exposes mutateAsync', (_, hook) => {
    const { QueryWrapper } = createQueryWrapper();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { result } = renderHook(() => (hook as (id?: string) => any)('test-id'), { wrapper: QueryWrapper });
    expect(typeof result.current.mutateAsync).toBe('function');
  });
});
