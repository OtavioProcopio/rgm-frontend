/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SolicitacaoCard } from './SolicitacaoCard';

vi.mock('./SolicitacaoPrioridadeBadge', () => ({
  SolicitacaoPrioridadeBadge: ({ prioridade }: { prioridade: string }) => <span>{prioridade}</span>,
}));
vi.mock('./SolicitacaoStatusBadge', () => ({
  SolicitacaoStatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}));

const solicitacao = {
  id: '1', titulo: 'Bomba quebrada', descricao: 'Trocar vedações',
  tipo: 'REPARO' as const, status: 'A_FAZER' as const, prioridade: 'ALTA' as const,
  criadaEm: '2024-06-01T10:00:00Z', atualizadaEm: '2024-06-01T10:00:00Z',
  modeloId: 'm1', abertaPorUsuarioId: 'u1', comentarioFinal: null,
  concluidaEm: null, canceladaEm: null, responsavelIds: [],
};

afterEach(cleanup);

describe('SolicitacaoCard', () => {
  it('renders titulo and descricao', () => {
    const { container } = render(
      <MemoryRouter><SolicitacaoCard solicitacao={solicitacao} /></MemoryRouter>,
    );
    expect(within(container).getByText('Bomba quebrada')).toBeDefined();
    expect(within(container).getByText('Trocar vedações')).toBeDefined();
  });

  it('renders status and prioridade badges', () => {
    const { container } = render(
      <MemoryRouter><SolicitacaoCard solicitacao={solicitacao} /></MemoryRouter>,
    );
    expect(within(container).getByText('A_FAZER')).toBeDefined();
    expect(within(container).getByText('ALTA')).toBeDefined();
  });

  it('renders tipo label', () => {
    const { container } = render(
      <MemoryRouter><SolicitacaoCard solicitacao={solicitacao} /></MemoryRouter>,
    );
    expect(within(container).getByText(/reparo/i)).toBeDefined();
  });

  it('does not render prioridade badge when null', () => {
    const { container } = render(
      <MemoryRouter><SolicitacaoCard solicitacao={{ ...solicitacao, prioridade: null }} /></MemoryRouter>,
    );
    expect(within(container).queryByText('ALTA')).toBeNull();
  });
});
