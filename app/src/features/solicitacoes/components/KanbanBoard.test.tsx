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
    } as unknown as ReturnType<typeof useKanbanSolicitacoes>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });
    expect(within(container).getByText('A Fazer')).toBeDefined();
    expect(within(container).getByText('Em Andamento')).toBeDefined();
  });

  it('shows a scoped empty state for OPERADOR with no assigned solicitacoes', async () => {
    const { useKanbanSolicitacoes } = await import('../hooks/useKanbanSolicitacoes');
    vi.mocked(useKanbanSolicitacoes).mockReturnValue({
      data: [], isLoading: false, error: null,
    } as unknown as ReturnType<typeof useKanbanSolicitacoes>);

    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });
    expect(within(container).getByText('Nenhuma solicitação atribuída a você')).toBeDefined();
    expect(within(container).queryByText('A Fazer')).toBeNull();
  });

  it('renders normal columns for OPERADOR when there are assigned solicitacoes', async () => {
    const { useKanbanSolicitacoes } = await import('../hooks/useKanbanSolicitacoes');
    vi.mocked(useKanbanSolicitacoes).mockReturnValue({
      data: [
        {
          id: 's1', titulo: 'T', status: 'A_FAZER', tipo: 'REPARO', prioridade: null,
          descricao: '', modeloId: 'm1', abertaPorUsuarioId: 'u1', comentarioFinal: null,
          criadaEm: new Date().toISOString(), atualizadaEm: new Date().toISOString(),
          concluidaEm: null, canceladaEm: null, responsavelIds: [],
        },
      ],
      isLoading: false, error: null,
    } as unknown as ReturnType<typeof useKanbanSolicitacoes>);

    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });
    expect(within(container).getByText('A Fazer')).toBeDefined();
    expect(within(container).getByText('Em Andamento')).toBeDefined();
    expect(within(container).queryByText('Nenhuma solicitação atribuída a você')).toBeNull();
  });
});
