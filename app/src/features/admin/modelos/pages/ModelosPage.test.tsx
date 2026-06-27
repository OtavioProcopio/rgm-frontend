/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { ModelosPage } from './ModelosPage';

vi.mock('../api/modelosApi', () => ({
  modelosApi: {
    listar: vi.fn(),
    exportarLista: vi.fn().mockResolvedValue(new Blob()),
    exportarFicha: vi.fn().mockResolvedValue(new Blob()),
  },
}));

vi.mock('../hooks/useModelos', () => ({
  useModelos: vi.fn().mockReturnValue({ data: undefined, error: null, isLoading: true }),
}));
vi.mock('../components/ModelosTable', () => ({
  ModelosTable: ({ modelos }: {
    modelos: { id: string; codigo: string; ativo: boolean }[];
  }) => (
    <div data-testid="modelos-table">
      {modelos.map((m) => (
        <div key={m.id}>
          {m.codigo}
        </div>
      ))}
    </div>
  ),
}));
vi.mock('../components/ModelosFilters', () => ({
  ModelosFilters: () => <div data-testid="modelos-filters" />,
}));

afterEach(cleanup);

describe('ModelosPage', () => {
  it('renders page title', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Modelos')).toBeDefined();
  });

  it('shows loading state', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando modelos/i)).toBeDefined();
  });

  it('shows empty state when no modelos', async () => {
    const { useModelos } = await import('../hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: { content: [], page: 0, totalPages: 0, totalElements: 0 },
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useModelos>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/nenhum modelo encontrado/i)).toBeDefined();
  });

  it('shows novo modelo link', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('link', { name: /novo modelo/i })).toBeDefined();
  });

  it('shows error state when request fails', async () => {
    const { useModelos } = await import('../hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: undefined, error: new Error('fail'), isLoading: false,
    } as unknown as ReturnType<typeof useModelos>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/não foi possível carregar/i)).toBeDefined();
  });

  it('renders modelos table when data is available', async () => {
    const { useModelos } = await import('../hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: {
        content: [
          { id: '1', codigo: 'M01', descricao: 'D', maquina: 'Injetora', versao: 1, observacoes: null, temPendenciaAberta: false, ativo: true, fotoUrl: null, criadoEm: '', atualizadoEm: '' },
        ],
        page: 0, totalPages: 1, totalElements: 1,
      },
      error: null, isLoading: false,
    } as unknown as ReturnType<typeof useModelos>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByTestId('modelos-table')).toBeDefined();
  });
});
