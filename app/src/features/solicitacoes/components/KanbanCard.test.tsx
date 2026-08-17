/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { KanbanCard } from './KanbanCard';

vi.mock('./SolicitacaoPrioridadeBadge', () => ({
  SolicitacaoPrioridadeBadge: ({ prioridade }: { prioridade: string }) => <span>{prioridade}</span>,
}));

const baseSolicitacao = {
  id: '1',
  titulo: 'Manutenção da bomba',
  descricao: 'Trocar vedações',
  tipo: 'REPARO' as const,
  status: 'A_FAZER' as const,
  prioridade: 'ALTA' as const,
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

describe('KanbanCard', () => {
  it('renders titulo and tipo', () => {
    const { container } = render(
      <KanbanCard
        solicitacao={baseSolicitacao}
        isDraggable={false}
        canAdvance={false}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(within(container).getByText('Manutenção da bomba')).toBeDefined();
    expect(within(container).getByText('Reparo')).toBeDefined();
  });

  it('renders descricao when present', () => {
    const { container } = render(
      <KanbanCard
        solicitacao={baseSolicitacao}
        isDraggable={false}
        canAdvance={false}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(within(container).getByText('Trocar vedações')).toBeDefined();
  });

  it('renders sem prioridade when prioridade is null', () => {
    const { container } = render(
      <KanbanCard
        solicitacao={{ ...baseSolicitacao, prioridade: null }}
        isDraggable={false}
        canAdvance={false}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(within(container).getByText(/sem prioridade/i)).toBeDefined();
  });

  it('renders INSPECAO tipo', () => {
    const { container } = render(
      <KanbanCard
        solicitacao={{ ...baseSolicitacao, tipo: 'INSPECAO' }}
        isDraggable={false}
        canAdvance={false}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(within(container).getByText('Inspeção')).toBeDefined();
  });

  it('renders REENGENHARIA tipo', () => {
    const { container } = render(
      <KanbanCard
        solicitacao={{ ...baseSolicitacao, tipo: 'REENGENHARIA' }}
        isDraggable={false}
        canAdvance={false}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(within(container).getByText('Reengenharia')).toBeDefined();
  });

  it('renders the formatted creation date', () => {
    const criadaEm = new Date('2026-03-15T12:00:00Z').toISOString();
    const { container } = render(
      <KanbanCard
        solicitacao={{ ...baseSolicitacao, criadaEm }}
        isDraggable={false}
        canAdvance={false}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    const time = container.querySelector('time')!;
    expect(time).toBeDefined();
    expect(time.getAttribute('dateTime')).toBe(criadaEm);
  });

  it('shows age badge for old cards', () => {
    const old = new Date(Date.now() - 10 * 86_400_000).toISOString();
    const { container } = render(
      <KanbanCard
        solicitacao={{ ...baseSolicitacao, criadaEm: old }}
        isDraggable={false}
        canAdvance={false}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(within(container).getByText(/\d+d/)).toBeDefined();
  });

  it('has draggable attribute', () => {
    const { container } = render(
      <KanbanCard
        solicitacao={baseSolicitacao}
        isDraggable={true}
        canAdvance={false}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    const card = container.querySelector('[draggable="true"]')!;
    expect(card).toBeDefined();
  });

  it('does not render advance button when canAdvance is false', () => {
    const { container } = render(
      <KanbanCard
        solicitacao={baseSolicitacao}
        isDraggable={false}
        canAdvance={false}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(container.querySelector('[aria-label="Avançar para a próxima etapa"]')).toBeNull();
  });

  it('renders advance button and calls onAdvance when clicked', () => {
    const onAdvance = vi.fn();
    const { container } = render(
      <KanbanCard
        solicitacao={baseSolicitacao}
        isDraggable={true}
        canAdvance={true}
        onDragStart={vi.fn()}
        onAdvance={onAdvance}
      />,
    );
    const button = container.querySelector('[aria-label="Avançar para a próxima etapa"]')!;
    expect(button).toBeDefined();
    fireEvent.click(button);
    expect(onAdvance).toHaveBeenCalledWith(baseSolicitacao);
  });
});
