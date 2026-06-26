/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
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
  solicitanteId: 'u1',
  solicitanteNome: 'João',
  modeloId: 'm1',
  modeloCodigo: 'M01',
};

afterEach(cleanup);

describe('KanbanCard', () => {
  it('renders titulo and tipo', () => {
    const { container } = render(
      <KanbanCard solicitacao={baseSolicitacao} onDragStart={vi.fn()} />,
    );
    expect(within(container).getByText('Manutenção da bomba')).toBeDefined();
    expect(within(container).getByText('Reparo')).toBeDefined();
  });

  it('renders descricao when present', () => {
    const { container } = render(
      <KanbanCard solicitacao={baseSolicitacao} onDragStart={vi.fn()} />,
    );
    expect(within(container).getByText('Trocar vedações')).toBeDefined();
  });

  it('renders sem prioridade when prioridade is null', () => {
    const { container } = render(
      <KanbanCard
        solicitacao={{ ...baseSolicitacao, prioridade: null }}
        onDragStart={vi.fn()}
      />,
    );
    expect(within(container).getByText(/sem prioridade/i)).toBeDefined();
  });

  it('renders INSPECAO tipo', () => {
    const { container } = render(
      <KanbanCard
        solicitacao={{ ...baseSolicitacao, tipo: 'INSPECAO' }}
        onDragStart={vi.fn()}
      />,
    );
    expect(within(container).getByText('Inspeção')).toBeDefined();
  });

  it('renders REENGENHARIA tipo', () => {
    const { container } = render(
      <KanbanCard
        solicitacao={{ ...baseSolicitacao, tipo: 'REENGENHARIA' }}
        onDragStart={vi.fn()}
      />,
    );
    expect(within(container).getByText('Reengenharia')).toBeDefined();
  });

  it('shows age badge for old cards', () => {
    const old = new Date(Date.now() - 10 * 86_400_000).toISOString();
    const { container } = render(
      <KanbanCard solicitacao={{ ...baseSolicitacao, criadaEm: old }} onDragStart={vi.fn()} />,
    );
    expect(within(container).getByText(/\d+d/)).toBeDefined();
  });

  it('has draggable attribute', () => {
    const { container } = render(
      <KanbanCard solicitacao={baseSolicitacao} onDragStart={vi.fn()} />,
    );
    const card = container.querySelector('[draggable]')!;
    expect(card).toBeDefined();
  });
});
