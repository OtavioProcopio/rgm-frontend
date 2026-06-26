/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { ModelosPage } from './ModelosPage';

vi.mock('../hooks/useModelos', () => ({
  useModelos: vi.fn().mockReturnValue({ data: undefined, error: null, isLoading: true }),
}));
vi.mock('../hooks/useDesativarModelo', () => ({
  useDesativarModelo: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/useAtivarModelo', () => ({
  useAtivarModelo: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../components/ModelosTable', () => ({
  ModelosTable: ({ modelos, onDesativar, onAtivar }: {
    modelos: { id: string; codigo: string; ativo: boolean }[];
    onDesativar: (m: { id: string; codigo: string }) => void;
    onAtivar: (m: { id: string; codigo: string }) => void;
  }) => (
    <div data-testid="modelos-table">
      {modelos.map((m) => (
        <div key={m.id}>
          {m.codigo}
          <button onClick={() => onDesativar(m)}>desativar-{m.id}</button>
          <button onClick={() => onAtivar(m)}>ativar-{m.id}</button>
        </div>
      ))}
    </div>
  ),
}));
vi.mock('@/shared/components/ConfirmDialog/ConfirmDialog', () => ({
  ConfirmDialog: () => <div data-testid="confirm-dialog" />,
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
    } as ReturnType<typeof useModelos>);

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
    } as ReturnType<typeof useModelos>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/não foi possível carregar/i)).toBeDefined();
  });

  it('renders modelos table when data is available', async () => {
    const { useModelos } = await import('../hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: {
        content: [
          { id: '1', codigo: 'M01', descricao: 'D', maquinaId: 'm1', ativo: true, fotoUrl: null, criadoEm: '', atualizadoEm: '' },
        ],
        page: 0, totalPages: 1, totalElements: 1,
      },
      error: null, isLoading: false,
    } as ReturnType<typeof useModelos>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    expect(within(container).getByTestId('modelos-table')).toBeDefined();
  });

  it('shows confirm dialog when desativar is triggered', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const { useModelos } = await import('../hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: { content: [{ id: '1', codigo: 'M01', descricao: 'D', maquinaId: 'm1', ativo: true, fotoUrl: null, criadoEm: '', atualizadoEm: '' }], page: 0, totalPages: 1, totalElements: 1 },
      error: null, isLoading: false,
    } as ReturnType<typeof useModelos>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByText('desativar-1'));
    expect(within(container).getByTestId('confirm-dialog')).toBeDefined();
  });

  it('shows ativar confirm when ativar is triggered on inactive modelo', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const { useModelos } = await import('../hooks/useModelos');
    vi.mocked(useModelos).mockReturnValue({
      data: { content: [{ id: '2', codigo: 'M02', descricao: 'D', maquinaId: 'm1', ativo: false, fotoUrl: null, criadoEm: '', atualizadoEm: '' }], page: 0, totalPages: 1, totalElements: 1 },
      error: null, isLoading: false,
    } as ReturnType<typeof useModelos>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<ModelosPage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByText('ativar-2'));
    expect(within(container).getByTestId('confirm-dialog')).toBeDefined();
  });
});
