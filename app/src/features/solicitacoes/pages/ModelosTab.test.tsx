/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { ModelosTab } from './ModelosTab';

vi.mock('@/features/admin/modelos/hooks/useModelos', () => ({
  useModelos: vi.fn(),
}));

afterEach(cleanup);

const modelo = (over: Record<string, unknown>) => ({
  id: 'm1',
  codigo: 'M01',
  versao: 1,
  descricao: 'Molde',
  observacoes: null,
  fotoUrl: null,
  ativo: true,
  maquina: 'Prensa PH-200',
  temPendenciaAberta: false,
  criadoEm: '2026-01-01T00:00:00Z',
  atualizadoEm: '2026-01-01T00:00:00Z',
  ...over,
});

describe('ModelosTab', () => {
  it('renders loading state', async () => {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as unknown as ReturnType<typeof useModelos>);

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

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosTab />, { wrapper: AppWrapper });
    expect(within(container).getByText('Modelos por máquina')).toBeDefined();
    expect(within(container).getByText('Prensa PH-200')).toBeDefined();
    expect(within(container).getByText('Torno T-10')).toBeDefined();
  });

  it('renders error state', async () => {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useModelos>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosTab />, { wrapper: AppWrapper });
    expect(within(container).getByText(/não foi possível carregar/i)).toBeDefined();
  });
});
