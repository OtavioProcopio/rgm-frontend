/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { DashboardPage } from './DashboardPage';

const mockMetricas = {
  totalUsuarios: 5, totalMaquinas: 3, totalModelos: 2, totalSolicitacoes: 10,
  solicitacoesPorStatus: { A_FAZER: 3, EM_ANDAMENTO: 4, EM_VALIDACAO: 2, CONCLUIDA: 1, CANCELADA: 0 },
  solicitacoesAbertas: 7, solicitacoesPendentes: 2, solicitacoesConcluidas: 1,
  tempoMedioResolucaoSegundos: 86400,
};

vi.mock('../api/solicitacoesApi', () => ({
  solicitacoesApi: {
    listar: vi.fn().mockResolvedValue({ content: [], totalElements: 0, page: 0, size: 20, totalPages: 0 }),
  },
}));

vi.mock('../hooks/useMetricas', () => ({
  useMetricas: vi.fn().mockReturnValue({ data: undefined, isLoading: true, error: null, isError: false }),
}));
vi.mock('@/features/admin/modelos/hooks/useModelos', () => ({
  useModelos: vi.fn().mockReturnValue({ data: { content: [], totalElements: 0 }, isLoading: false, error: null }),
}));
vi.mock('@/features/auth/hooks/usePerfil', () => ({
  usePerfil: vi.fn().mockReturnValue({ data: null, isLoading: false }),
}));

afterEach(async () => {
  cleanup();
  const { solicitacoesApi } = await import('../api/solicitacoesApi');
  vi.mocked(solicitacoesApi.listar).mockReset();
  vi.mocked(solicitacoesApi.listar).mockResolvedValue({
    content: [], totalElements: 0, page: 0, size: 20, totalPages: 0,
  });
});

describe('DashboardPage', () => {
  it('renders loading state', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<DashboardPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('renders with data when loaded', async () => {
    const { useMetricas } = await import('../hooks/useMetricas');
    vi.mocked(useMetricas).mockReturnValue({
      data: mockMetricas,
      isLoading: false,
      isError: false,
      error: null,
    } as unknown as ReturnType<typeof useMetricas>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<DashboardPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/dashboard/i)).toBeDefined();
    expect(within(container).getByText('10')).toBeDefined();
  });

  it('renders with sla em horas', async () => {
    const { useMetricas } = await import('../hooks/useMetricas');
    vi.mocked(useMetricas).mockReturnValue({
      data: { ...mockMetricas, tempoMedioResolucaoSegundos: 7200 },
      isLoading: false, isError: false, error: null,
    } as unknown as ReturnType<typeof useMetricas>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<DashboardPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/2h/)).toBeDefined();
  });

  it('renders with sla em minutos', async () => {
    const { useMetricas } = await import('../hooks/useMetricas');
    vi.mocked(useMetricas).mockReturnValue({
      data: { ...mockMetricas, tempoMedioResolucaoSegundos: 120 },
      isLoading: false, isError: false, error: null,
    } as unknown as ReturnType<typeof useMetricas>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<DashboardPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/2m/)).toBeDefined();
  });

  it('renders with sla em segundos', async () => {
    const { useMetricas } = await import('../hooks/useMetricas');
    vi.mocked(useMetricas).mockReturnValue({
      data: { ...mockMetricas, tempoMedioResolucaoSegundos: 30 },
      isLoading: false, isError: false, error: null,
    } as unknown as ReturnType<typeof useMetricas>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<DashboardPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/30s/)).toBeDefined();
  });

  it('renders with aging tasks from the atrasada filter', async () => {
    const { useMetricas } = await import('../hooks/useMetricas');
    const { solicitacoesApi } = await import('../api/solicitacoesApi');
    vi.mocked(useMetricas).mockReturnValue({
      data: mockMetricas, isLoading: false, isError: false, error: null,
    } as unknown as ReturnType<typeof useMetricas>);
    const old = new Date(Date.now() - 10 * 86400 * 1000).toISOString();
    vi.mocked(solicitacoesApi.listar).mockImplementation(((filters: { atrasada?: boolean }) => {
      if (filters.atrasada) {
        return Promise.resolve({
          content: [{
            id: 's1', titulo: 'Tarefa Velha', criadaEm: old, status: 'A_FAZER',
            tipo: 'REPARO', prioridade: 'ALTA', descricao: '', modeloId: 'm1',
            modeloCodigo: 'M01', solicitanteId: 'u1', solicitanteNome: 'J', atualizadaEm: old,
          }],
          totalElements: 1, page: 0, size: 5, totalPages: 1,
        });
      }
      return Promise.resolve({ content: [], totalElements: 0, page: 0, size: 20, totalPages: 0 });
    }) as unknown as typeof solicitacoesApi.listar);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<DashboardPage />, { wrapper: AppWrapper });
    expect(await within(container).findByText('Tarefa Velha')).toBeDefined();
  });

  it('renders status distribution table with percentages', async () => {
    const { useMetricas } = await import('../hooks/useMetricas');
    vi.mocked(useMetricas).mockReturnValue({
      data: mockMetricas, isLoading: false, isError: false, error: null,
    } as unknown as ReturnType<typeof useMetricas>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<DashboardPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Distribuição detalhada por status')).toBeDefined();
    expect(within(container).getAllByText(/%/).length).toBeGreaterThan(0);
  });

  it('shows only the Pessoal tab for OPERADOR and does not fetch global metricas', async () => {
    const { useMetricas } = await import('../hooks/useMetricas');
    vi.mocked(useMetricas).mockClear();

    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    const { container } = render(<DashboardPage />, { wrapper: AppWrapper });

    expect(within(container).queryByText('Solicitações', { selector: 'button' })).toBeNull();
    expect(within(container).queryByText('Modelos', { selector: 'button' })).toBeNull();
    expect(vi.mocked(useMetricas)).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });

  it('renders zero percentage when totalSolicitacoes is zero', async () => {
    const { useMetricas } = await import('../hooks/useMetricas');
    vi.mocked(useMetricas).mockReturnValue({
      data: { ...mockMetricas, totalSolicitacoes: 0, solicitacoesPorStatus: { A_FAZER: 0, EM_ANDAMENTO: 0, EM_VALIDACAO: 0, CONCLUIDA: 0, CANCELADA: 0 } },
      isLoading: false, isError: false, error: null,
    } as unknown as ReturnType<typeof useMetricas>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<DashboardPage />, { wrapper: AppWrapper });
    expect(within(container).getAllByText('0.0%').length).toBeGreaterThan(0);
  });
});
