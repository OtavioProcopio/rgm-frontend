/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { ModelosPage } from './ModelosPage';

vi.mock('@/features/admin/modelos/hooks/useModelos', () => ({
  useModelos: vi.fn().mockReturnValue({ data: undefined, error: null, isLoading: true }),
}));
vi.mock('@/features/admin/modelos/hooks/useMaquinaOptions', () => ({
  useMaquinaOptions: vi.fn().mockReturnValue({ options: [], isLoading: false }),
}));

afterEach(cleanup);

describe('ModelosPage (gestor/operador)', () => {
  it('renders page title', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Modelos')).toBeDefined();
  });

  it('shows loading state', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('shows empty state when no modelos', async () => {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: { content: [], page: 0, totalPages: 0, totalElements: 0 },
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useModelos>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getAllByText(/nenhum modelo/i).length).toBeGreaterThan(0);
  });

  it('shows error state', async () => {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: undefined,
      error: new Error('Falha'),
      isLoading: false,
    } as unknown as ReturnType<typeof useModelos>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/não foi possível carregar/i)).toBeDefined();
  });

  it('renders grid and pagination when modelos exist', async () => {
    const { useModelos } = await import('@/features/admin/modelos/hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: {
        content: [
          { id: '1', codigo: 'M001', descricao: 'Modelo A', ativo: true, versao: 1, maquina: 'Máq1', temPendenciaAberta: false, fotoUrl: null, criadoEm: '', atualizadoEm: '', observacoes: '' },
        ],
        page: 0,
        totalPages: 2,
        totalElements: 15,
      },
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useModelos>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('M001')).toBeDefined();
    expect(within(container).getByText(/modelo\(s\)/i)).toBeDefined();
  });
});
