/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { ModelosTab } from './ModelosTab';

vi.mock('@/features/admin/modelos/hooks/useModelos', () => ({
  useModelos: vi.fn(),
}));

vi.mock('../hooks/useMetricasPorModelo', () => ({
  useMetricasPorModelo: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

afterEach(cleanup);

const modelo = (over: Record<string, unknown>) => ({
  id: 'm1',
  codigo: 'M01',
  versao: 1,
  descricao: 'Molde',
  observacoes: null,
  fotoCapaUrl: null,
  ativo: true,
  maquina: 'Prensa PH-200',
  temPendenciaAberta: false,
  criadoEm: '2026-01-01T00:00:00Z',
  atualizadoEm: '2026-01-01T00:00:00Z',
  ...over,
});

async function mockRanking(overrides: Record<string, unknown> = {}) {
  const { useMetricasPorModelo } = await import('../hooks/useMetricasPorModelo');
  vi.mocked(useMetricasPorModelo).mockReturnValue({
    data: { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 },
    isLoading: false,
    isError: false,
    ...overrides,
  } as unknown as ReturnType<typeof useMetricasPorModelo>);
}

describe('ModelosTab', () => {
  it('renders loading state', async () => {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useModelos>);
    await mockRanking();

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosTab />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('renders stats and machine grouping', async () => {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: {
        content: [
          modelo({ id: 'm1', ativo: true, temPendenciaAberta: true }),
          modelo({ id: 'm2', ativo: false, maquina: 'Torno T-10' }),
        ],
        totalElements: 2,
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useModelos>);
    await mockRanking();

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosTab />, { wrapper: AppWrapper });
    expect(within(container).getByText('Modelos por máquina')).toBeDefined();
    expect(within(container).getByText('Prensa PH-200')).toBeDefined();
    expect(within(container).getByText('Torno T-10')).toBeDefined();
  });

  it('navigates to filtered solicitacoes when a machine row is clicked', async () => {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: {
        content: [modelo({ id: 'm1', maquina: 'Prensa PH-200' })],
        totalElements: 1,
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useModelos>);
    await mockRanking();
    mockNavigate.mockClear();

    const { AppWrapper } = createAppWrapper();
    const { getByText } = render(<ModelosTab />, { wrapper: AppWrapper });

    fireEvent.click(getByText('Prensa PH-200'));
    expect(mockNavigate).toHaveBeenCalledWith('/app/solicitacoes?maquina=Prensa%20PH-200');
  });

  it('navigates to filtered solicitacoes when Enter is pressed on a machine row', async () => {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: {
        content: [modelo({ id: 'm1', maquina: 'Prensa PH-200' })],
        totalElements: 1,
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useModelos>);
    await mockRanking();
    mockNavigate.mockClear();

    const { AppWrapper } = createAppWrapper();
    const { getByRole } = render(<ModelosTab />, { wrapper: AppWrapper });

    fireEvent.keyDown(getByRole('button', { name: /prensa ph-200/i }), { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/app/solicitacoes?maquina=Prensa%20PH-200');
  });

  it('renders error state', async () => {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useModelos>);
    await mockRanking();

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosTab />, { wrapper: AppWrapper });
    expect(within(container).getByText(/não foi possível carregar/i)).toBeDefined();
  });

  it('renders ranking table with sortable headers', async () => {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: { content: [], totalElements: 0 },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useModelos>);
    await mockRanking({
      data: {
        content: [
          { modeloId: 'm1', codigo: 'M01', tempoMedioResolucaoSegundos: 3600, intervaloMedioSegundos: 7200 },
          { modeloId: 'm2', codigo: 'M02', tempoMedioResolucaoSegundos: 90000, intervaloMedioSegundos: null },
        ],
        page: 0,
        size: 10,
        totalElements: 2,
        totalPages: 1,
      },
    });

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosTab />, { wrapper: AppWrapper });
    expect(within(container).getByText('Ranking de modelos por tempo')).toBeDefined();
    expect(within(container).getByText('M01')).toBeDefined();
    expect(within(container).getByText('M02')).toBeDefined();
    expect(within(container).getByText('1h')).toBeDefined();
    expect(within(container).getAllByText('—').length).toBeGreaterThan(0);
  });

  it('renders empty state when ranking has no modelos with enough data', async () => {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: { content: [], totalElements: 0 },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useModelos>);
    await mockRanking();

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosTab />, { wrapper: AppWrapper });
    expect(within(container).getByText('Nenhum modelo com dados suficientes')).toBeDefined();
  });

  it('toggles sort direction when clicking the same header twice', async () => {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: { content: [], totalElements: 0 },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useModelos>);
    const { useMetricasPorModelo } = await import('../hooks/useMetricasPorModelo');
    const mockHook = vi.mocked(useMetricasPorModelo).mockReturnValue({
      data: {
        content: [
          { modeloId: 'm1', codigo: 'M01', tempoMedioResolucaoSegundos: 3600, intervaloMedioSegundos: 7200 },
        ],
        page: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useMetricasPorModelo>);

    const { container, getByText } = render(<ModelosTab />, { wrapper: createAppWrapper().AppWrapper });

    fireEvent.click(getByText(/Tempo médio de resolução/));
    expect(mockHook).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: 'TEMPO_RESOLUCAO', dir: 'asc' }),
    );

    fireEvent.click(getByText(/Intervalo médio entre solicitações/));
    expect(mockHook).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: 'INTERVALO', dir: 'desc' }),
    );
    expect(container).toBeDefined();
  });
});
