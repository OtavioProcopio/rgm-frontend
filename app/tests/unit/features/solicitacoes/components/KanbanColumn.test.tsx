/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ColumnConfig } from '@/features/solicitacoes/components/KanbanColumn';
import { KanbanColumn } from '@/features/solicitacoes/components/KanbanColumn';

vi.mock('@/features/solicitacoes/components/KanbanCard', () => ({
  KanbanCard: ({
    solicitacao,
    relacao,
  }: {
    solicitacao: { titulo: string };
    relacao?: string | null;
  }) => (
    <div data-testid="kanban-card" data-relacao={relacao ?? 'nenhuma'}>
      {solicitacao.titulo}
    </div>
  ),
}));

const config: ColumnConfig = {
  status: 'A_FAZER',
  label: 'A Fazer',
  headerClass: 'bg-slate-100',
  accentClass: 'bg-slate-50',
};

const solicitacao = {
  id: '1',
  titulo: 'Card Title',
  descricao: '',
  tipo: 'REPARO' as const,
  status: 'A_FAZER' as const,
  prioridade: null,
  criadaEm: new Date().toISOString(),
  atualizadaEm: new Date().toISOString(),
  modeloId: 'm1',
  abertaPorUsuarioId: 'u1',
  comentarioFinal: null,
  concluidaEm: null,
  canceladaEm: null,
  responsavelIds: [],
};

afterEach(cleanup);

describe('KanbanColumn', () => {
  it('renders column label in desktop view', () => {
    const { container } = render(
      <KanbanColumn
        config={config}
        cards={[]}
        isDropTarget={false}
        isInvalidDrop={false}
        canDragCard={() => true}
        canAdvanceCard={() => false}
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDrop={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(within(container).getByText('A Fazer')).toBeDefined();
  });

  it('renders empty state when no cards', () => {
    const { container } = render(
      <KanbanColumn
        config={config}
        cards={[]}
        isDropTarget={false}
        isInvalidDrop={false}
        canDragCard={() => true}
        canAdvanceCard={() => false}
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDrop={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(within(container).getByText(/nenhuma solicitação/i)).toBeDefined();
  });

  it('renders cards when present', () => {
    const { container } = render(
      <KanbanColumn
        config={config}
        cards={[solicitacao]}
        isDropTarget={false}
        isInvalidDrop={false}
        canDragCard={() => true}
        canAdvanceCard={() => false}
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDrop={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(within(container).getByTestId('kanban-card')).toBeDefined();
    expect(within(container).getByText('Card Title')).toBeDefined();
  });

  it('does not show header in mobile view', () => {
    const { container } = render(
      <KanbanColumn
        config={config}
        cards={[]}
        isDropTarget={false}
        isInvalidDrop={false}
        mobileView
        canDragCard={() => true}
        canAdvanceCard={() => false}
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDrop={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(within(container).queryByText('A Fazer')).toBeNull();
  });

  it('shows card count', () => {
    const { container } = render(
      <KanbanColumn
        config={config}
        cards={[solicitacao, { ...solicitacao, id: '2' }]}
        isDropTarget={false}
        isInvalidDrop={false}
        canDragCard={() => true}
        canAdvanceCard={() => false}
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDrop={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(within(container).getByText('2')).toBeDefined();
  });

  function coluna(relacaoDe?: Parameters<typeof KanbanColumn>[0]['relacaoDe']) {
    return (
      <KanbanColumn
        config={config}
        cards={[solicitacao]}
        isDropTarget={false}
        isInvalidDrop={false}
        canDragCard={() => true}
        canAdvanceCard={() => false}
        relacaoDe={relacaoDe}
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDrop={vi.fn()}
        onAdvance={vi.fn()}
      />
    );
  }

  it('deve repassar ao card a relação calculada para a solicitação dele', () => {
    // Arrange
    const relacaoDe = vi.fn().mockReturnValue('ATRIBUIDA');

    // Act
    const { container } = render(coluna(relacaoDe));

    // Assert
    expect(relacaoDe).toHaveBeenCalledTimes(1);
    expect(relacaoDe).toHaveBeenCalledWith(solicitacao);
    expect(within(container).getByTestId('kanban-card').dataset.relacao).toBe('ATRIBUIDA');
  });

  it('deve deixar o card sem relação quando a coluna não recebe como calculá-la', () => {
    // Act
    const { container } = render(coluna());

    // Assert
    expect(within(container).getByTestId('kanban-card').dataset.relacao).toBe('nenhuma');
  });
});
