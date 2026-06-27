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
vi.mock('../components/ModeloFotoCapa', () => ({
  ModeloFotoCapa: () => <div />,
}));

afterEach(cleanup);

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
});
