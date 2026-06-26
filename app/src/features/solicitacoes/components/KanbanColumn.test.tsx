/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ColumnConfig } from './KanbanColumn';
import { KanbanColumn } from './KanbanColumn';

vi.mock('./KanbanCard', () => ({
  KanbanCard: ({ solicitacao }: { solicitacao: { titulo: string } }) => (
    <div data-testid="kanban-card">{solicitacao.titulo}</div>
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
  solicitanteId: 'u1',
  solicitanteNome: 'João',
  modeloId: 'm1',
  modeloCodigo: 'M01',
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
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDrop={vi.fn()}
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
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDrop={vi.fn()}
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
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDrop={vi.fn()}
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
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDrop={vi.fn()}
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
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDrop={vi.fn()}
      />,
    );
    expect(within(container).getByText('2')).toBeDefined();
  });
});
