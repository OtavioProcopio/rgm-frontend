/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

vi.mock('@/features/admin/modelos/hooks/useModelo', () => ({
  useModelo: vi.fn().mockReturnValue({ data: undefined, isLoading: true, error: null }),
}));
vi.mock('@/features/admin/modelos/hooks/useEventosModelo', () => ({
  useEventosModelo: vi.fn().mockReturnValue({ data: [] }),
}));
vi.mock('@/features/admin/modelos/components/ModeloFotoCapa', () => ({
  ModeloFotoCapa: () => <div data-testid="foto-capa" />,
}));
vi.mock('@/features/admin/modelos/components/EventosModeloList', () => ({
  EventosModeloList: () => <div data-testid="eventos-list" />,
}));
vi.mock('@/features/admin/modelos/components/ModeloStatusBadge', () => ({
  ModeloStatusBadge: () => <span>Status</span>,
}));
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return { ...actual, useParams: () => ({ id: 'm1' }) };
});

import { ModeloDetalhePage } from './ModeloDetalhePage';

afterEach(cleanup);

describe('ModeloDetalhePage (gestor)', () => {
  it('shows loading state', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModeloDetalhePage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando modelo/i)).toBeDefined();
  });

  it('shows error when modelo not found', async () => {
    const { useModelo } = await import('@/features/admin/modelos/hooks/useModelo');
    vi.mocked(useModelo).mockReturnValue({
      data: undefined, isLoading: false, error: new Error('not found'),
    } as ReturnType<typeof useModelo>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModeloDetalhePage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/não encontrado/i)).toBeDefined();
  });

  it('renders modelo details when loaded', async () => {
    const { useModelo } = await import('@/features/admin/modelos/hooks/useModelo');
    vi.mocked(useModelo).mockReturnValue({
      data: {
        id: 'm1', codigo: 'M01', versao: 1, descricao: 'Molde A',
        maquina: 'Injetora 01', ativo: true, fotoUrl: null,
        temPendenciaAberta: false, observacoes: null,
        criadoEm: '2024-01-01T00:00:00Z', atualizadoEm: '2024-01-01T00:00:00Z',
      },
      isLoading: false, error: null,
    } as ReturnType<typeof useModelo>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModeloDetalhePage />, { wrapper: AppWrapper });
    expect(within(container).getAllByText(/M01/).length).toBeGreaterThan(0);
    expect(within(container).getByText('Molde A')).toBeDefined();
  });
});
