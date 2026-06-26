/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { KanbanBoard } from './KanbanBoard';

vi.mock('../hooks/useKanbanSolicitacoes', () => ({
  useKanbanSolicitacoes: vi.fn().mockReturnValue({ data: [], isLoading: true, error: null }),
}));
vi.mock('../hooks/useKanbanActions', () => ({
  useKanbanActions: vi.fn().mockReturnValue({
    triar: { mutateAsync: vi.fn(), isPending: false },
    enviarValidacao: { mutateAsync: vi.fn(), isPending: false },
    encerrar: { mutateAsync: vi.fn(), isPending: false },
    cancelar: { mutateAsync: vi.fn(), isPending: false },
    devolver: { mutateAsync: vi.fn(), isPending: false },
  }),
}));
vi.mock('@/features/admin/usuarios/api/usuariosApi', () => ({
  usuariosApi: { listar: vi.fn().mockResolvedValue({ content: [], page: 0, totalPages: 0, totalElements: 0 }) },
}));
vi.mock('./KanbanColumn', () => ({
  KanbanColumn: ({ label }: { label: string }) => <div data-testid={`col-${label}`}>{label}</div>,
}));
vi.mock('./TriagemModal', () => ({ TriagemModal: () => null }));
vi.mock('./EncerramentoModal', () => ({ EncerramentoModal: () => null }));
vi.mock('./DevolucaoModal', () => ({ DevolucaoModal: () => null }));

afterEach(cleanup);

describe('KanbanBoard', () => {
  it('shows loading state', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('renders kanban columns when data is loaded', async () => {
    const { useKanbanSolicitacoes } = await import('../hooks/useKanbanSolicitacoes');
    vi.mocked(useKanbanSolicitacoes).mockReturnValue({
      data: [], isLoading: false, error: null,
    } as ReturnType<typeof useKanbanSolicitacoes>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });
    expect(within(container).getByText('A Fazer')).toBeDefined();
    expect(within(container).getByText('Em Andamento')).toBeDefined();
  });
});
