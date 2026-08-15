/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { ModeloDetalhePage } from './ModeloDetalhePage';

vi.mock('../api/modelosApi', () => ({
  modelosApi: {
    exportarFicha: vi.fn().mockResolvedValue(new Blob()),
  },
}));

vi.mock('../hooks/useModelo', () => ({
  useModelo: vi.fn().mockReturnValue({ data: undefined, isLoading: true, error: null }),
}));
vi.mock('../hooks/useEventosModelo', () => ({
  useEventosModelo: vi.fn().mockReturnValue({ data: [] }),
}));
vi.mock('@/features/solicitacoes/hooks/useSolicitacoes', () => ({
  useSolicitacoes: vi.fn().mockReturnValue({ data: undefined }),
}));
vi.mock('../hooks/useDesativarModelo', () => ({
  useDesativarModelo: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/useAtivarModelo', () => ({
  useAtivarModelo: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../components/EventosModeloList', () => ({
  EventosModeloList: () => <div />,
}));
vi.mock('../components/GaleriaModelo', () => ({
  GaleriaModelo: () => <div data-testid="galeria-modelo" />,
}));

afterEach(cleanup);

const modelo = {
  id: '1',
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
};

const solicitacaoConcluida = (over: Record<string, unknown>) => ({
  id: 's1',
  titulo: 'Reparo',
  descricao: '',
  tipo: 'REPARO',
  status: 'CONCLUIDA',
  prioridade: 'MEDIA',
  modeloId: '1',
  abertaPorUsuarioId: 'u1',
  comentarioFinal: null,
  atualizadaEm: '2026-01-01T00:00:00Z',
  canceladaEm: null,
  responsavelIds: [],
  ...over,
});

describe('ModeloDetalhePage (admin)', () => {
  it('shows loading state', () => {
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/modelos/1'] });
    const { container } = render(<ModeloDetalhePage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('shows error state', async () => {
    const { useModelo } = await import('../hooks/useModelo');
    vi.mocked(useModelo).mockReturnValue({
      data: undefined, isLoading: false, error: new Error('Erro'),
    } as ReturnType<typeof useModelo>);

    const { AppWrapper } = createAppWrapper({ initialEntries: ['/modelos/1'] });
    const { container } = render(<ModeloDetalhePage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/não foi possível/i)).toBeDefined();
  });

  it('computes time metrics client-side when there are 2+ concluidas', async () => {
    const { useModelo } = await import('../hooks/useModelo');
    vi.mocked(useModelo).mockReturnValue({
      data: modelo, isLoading: false, error: null,
    } as unknown as ReturnType<typeof useModelo>);

    const { useSolicitacoes } = await import('@/features/solicitacoes/hooks/useSolicitacoes');
    vi.mocked(useSolicitacoes).mockReturnValue({
      data: {
        content: [
          solicitacaoConcluida({
            id: 's1',
            criadaEm: '2026-01-01T00:00:00Z',
            concluidaEm: '2026-01-01T01:00:00Z',
          }),
          solicitacaoConcluida({
            id: 's2',
            criadaEm: '2026-01-03T00:00:00Z',
            concluidaEm: '2026-01-03T02:00:00Z',
          }),
        ],
        totalElements: 2,
      },
    } as unknown as ReturnType<typeof useSolicitacoes>);

    const { AppWrapper } = createAppWrapper({ initialEntries: ['/modelos/1'] });
    const { container } = render(<ModeloDetalhePage />, { wrapper: AppWrapper });

    expect(within(container).getByText('Tempo médio de resolução')).toBeDefined();
    expect(within(container).getByText('2h')).toBeDefined();
    expect(within(container).getByText('Intervalo médio entre solicitações')).toBeDefined();
    expect(within(container).getByText('2d 0h')).toBeDefined();
  });

  it('shows placeholder when fewer than 2 concluidas', async () => {
    const { useModelo } = await import('../hooks/useModelo');
    vi.mocked(useModelo).mockReturnValue({
      data: modelo, isLoading: false, error: null,
    } as unknown as ReturnType<typeof useModelo>);

    const { useSolicitacoes } = await import('@/features/solicitacoes/hooks/useSolicitacoes');
    vi.mocked(useSolicitacoes).mockReturnValue({
      data: {
        content: [
          solicitacaoConcluida({
            id: 's1',
            criadaEm: '2026-01-01T00:00:00Z',
            concluidaEm: '2026-01-01T01:00:00Z',
          }),
        ],
        totalElements: 1,
      },
    } as unknown as ReturnType<typeof useSolicitacoes>);

    const { AppWrapper } = createAppWrapper({ initialEntries: ['/modelos/1'] });
    const { container } = render(<ModeloDetalhePage />, { wrapper: AppWrapper });

    const kpiCards = within(container).getAllByText('—');
    expect(kpiCards.length).toBe(2);
  });
});
