/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { ModelosTab } from '@/features/solicitacoes/pages/ModelosTab';

vi.mock('@/features/admin/modelos/hooks/useResumoDeModelos', () => ({
  useResumoDeModelos: vi.fn(),
}));

vi.mock('@/features/solicitacoes/hooks/useMetricasPorModelo', () => ({
  useMetricasPorModelo: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

afterEach(cleanup);

async function mockRanking(overrides: Record<string, unknown> = {}) {
  const { useMetricasPorModelo } = await import('@/features/solicitacoes/hooks/useMetricasPorModelo');
  vi.mocked(useMetricasPorModelo).mockReturnValue({
    data: { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 },
    isLoading: false,
    isError: false,
    ...overrides,
  } as unknown as ReturnType<typeof useMetricasPorModelo>);
}

const RESUMO = {
  total: 12,
  ativos: 9,
  inativos: 3,
  comPendenciaAberta: 4,
  porMaquina: [
    { maquina: 'Torno T-10', quantidade: 5 },
    { maquina: 'Prensa PH-200', quantidade: 7 },
  ],
};

describe('ModelosTab', () => {
  it('renders loading state', async () => {
    const { useResumoDeModelos } = await import('@/features/admin/modelos/hooks/useResumoDeModelos');
    vi.mocked(useResumoDeModelos).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useResumoDeModelos>);
    await mockRanking();

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosTab />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('renders stats and machine grouping', async () => {
    const { useResumoDeModelos } = await import('@/features/admin/modelos/hooks/useResumoDeModelos');
    vi.mocked(useResumoDeModelos).mockReturnValue({
      data: RESUMO,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useResumoDeModelos>);
    await mockRanking();

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosTab />, { wrapper: AppWrapper });
    expect(within(container).getByText('Modelos por máquina')).toBeDefined();
    expect(within(container).getByText('Prensa PH-200')).toBeDefined();
    expect(within(container).getByText('Torno T-10')).toBeDefined();
  });

  it('navigates to filtered solicitacoes when a machine row is clicked', async () => {
    const { useResumoDeModelos } = await import('@/features/admin/modelos/hooks/useResumoDeModelos');
    vi.mocked(useResumoDeModelos).mockReturnValue({
      data: RESUMO,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useResumoDeModelos>);
    await mockRanking();
    mockNavigate.mockClear();

    const { AppWrapper } = createAppWrapper();
    const { getByText } = render(<ModelosTab />, { wrapper: AppWrapper });

    fireEvent.click(getByText('Prensa PH-200'));
    expect(mockNavigate).toHaveBeenCalledWith('/app/solicitacoes?maquina=Prensa%20PH-200');
  });

  it('navigates to filtered solicitacoes when Enter is pressed on a machine row', async () => {
    const { useResumoDeModelos } = await import('@/features/admin/modelos/hooks/useResumoDeModelos');
    vi.mocked(useResumoDeModelos).mockReturnValue({
      data: RESUMO,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useResumoDeModelos>);
    await mockRanking();
    mockNavigate.mockClear();

    const { AppWrapper } = createAppWrapper();
    const { getByRole } = render(<ModelosTab />, { wrapper: AppWrapper });

    fireEvent.keyDown(getByRole('button', { name: /prensa ph-200/i }), { key: 'Enter' });
    expect(mockNavigate).toHaveBeenCalledWith('/app/solicitacoes?maquina=Prensa%20PH-200');
  });

  it('renders error state', async () => {
    const { useResumoDeModelos } = await import('@/features/admin/modelos/hooks/useResumoDeModelos');
    vi.mocked(useResumoDeModelos).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useResumoDeModelos>);
    await mockRanking();

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosTab />, { wrapper: AppWrapper });
    expect(within(container).getByText(/não foi possível carregar/i)).toBeDefined();
  });

  it('renders ranking table with sortable headers', async () => {
    const { useResumoDeModelos } = await import('@/features/admin/modelos/hooks/useResumoDeModelos');
    vi.mocked(useResumoDeModelos).mockReturnValue({
      data: RESUMO,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useResumoDeModelos>);
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
    const { useResumoDeModelos } = await import('@/features/admin/modelos/hooks/useResumoDeModelos');
    vi.mocked(useResumoDeModelos).mockReturnValue({
      data: RESUMO,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useResumoDeModelos>);
    await mockRanking();

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosTab />, { wrapper: AppWrapper });
    expect(within(container).getByText('Nenhum modelo com dados suficientes')).toBeDefined();
  });

  it('toggles sort direction when clicking the same header twice', async () => {
    const { useResumoDeModelos } = await import('@/features/admin/modelos/hooks/useResumoDeModelos');
    vi.mocked(useResumoDeModelos).mockReturnValue({
      data: RESUMO,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useResumoDeModelos>);
    const { useMetricasPorModelo } = await import('@/features/solicitacoes/hooks/useMetricasPorModelo');
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

describe('ModelosTab — contagens pelo resumo da API', () => {
  async function abrir() {
    const { useResumoDeModelos } = await import('@/features/admin/modelos/hooks/useResumoDeModelos');
    vi.mocked(useResumoDeModelos).mockReturnValue({
      data: RESUMO,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useResumoDeModelos>);
    await mockRanking();
    const { AppWrapper } = createAppWrapper();
    return render(<ModelosTab />, { wrapper: AppWrapper });
  }

  it.each([
    ['total', '12'],
    ['ativos', '9'],
    ['inativos', '3'],
    ['com pendência aberta', '4'],
  ])('deve mostrar o número de modelos %s que o resumo traz', async (_nome, valor) => {
    // Act
    const { container } = await abrir();

    // Assert
    expect(within(container).getByText(valor)).toBeDefined();
  });

  it('deve mostrar a quantidade de modelos de cada máquina, da maior para a menor', async () => {
    // Act
    const { container } = await abrir();

    // Assert
    const linhas = within(container)
      .getAllByRole('button', { name: /^Ver solicitações da máquina/ })
      .map((linha) => linha.textContent);
    expect(linhas).toEqual(['Prensa PH-2007', 'Torno T-105']);
  });
});
