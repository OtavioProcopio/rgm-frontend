/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SolicitacaoCard } from '@/features/solicitacoes/components/SolicitacaoCard';
import { rotuloDoTipoDeSolicitacao } from '@/shared/lib/rotulos';

vi.mock('@/features/solicitacoes/components/SolicitacaoPrioridadeBadge', () => ({
  SolicitacaoPrioridadeBadge: ({ prioridade }: { prioridade: string }) => <span>{prioridade}</span>,
}));
vi.mock('@/features/solicitacoes/components/SolicitacaoStatusBadge', () => ({
  SolicitacaoStatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}));

const solicitacao = {
  id: '1',
  titulo: 'Bomba quebrada',
  descricao: 'Trocar vedações',
  tipo: 'REPARO' as const,
  status: 'A_FAZER' as const,
  prioridade: 'ALTA' as const,
  criadaEm: '2024-06-01T10:00:00Z',
  atualizadaEm: '2024-06-01T10:00:00Z',
  modeloId: 'm1',
  abertaPorUsuarioId: 'u1',
  comentarioFinal: null,
  concluidaEm: null,
  canceladaEm: null,
  responsavelIds: [],
};

const TIPOS = ['REPARO', 'INSPECAO', 'REENGENHARIA', 'CRIACAO'] as const;

afterEach(cleanup);

describe('SolicitacaoCard', () => {
  it('renders titulo and descricao', () => {
    const { container } = render(
      <MemoryRouter>
        <SolicitacaoCard solicitacao={solicitacao} />
      </MemoryRouter>,
    );
    expect(within(container).getByText('Bomba quebrada')).toBeDefined();
    expect(within(container).getByText('Trocar vedações')).toBeDefined();
  });

  it('renders status and prioridade badges', () => {
    const { container } = render(
      <MemoryRouter>
        <SolicitacaoCard solicitacao={solicitacao} />
      </MemoryRouter>,
    );
    expect(within(container).getByText('A_FAZER')).toBeDefined();
    expect(within(container).getByText('ALTA')).toBeDefined();
  });

  it.each(TIPOS)('deve dizer o tipo com o rótulo único quando o tipo é %s', (tipo) => {
    // Arrange
    const rotulo = rotuloDoTipoDeSolicitacao[tipo];

    // Act
    const { container } = render(
      <MemoryRouter>
        <SolicitacaoCard solicitacao={{ ...solicitacao, tipo }} />
      </MemoryRouter>,
    );

    // Assert
    expect(within(container).getByText(rotulo).textContent).toBe(rotulo);
  });

  it('does not render prioridade badge when null', () => {
    const { container } = render(
      <MemoryRouter>
        <SolicitacaoCard solicitacao={{ ...solicitacao, prioridade: null }} />
      </MemoryRouter>,
    );
    expect(within(container).queryByText('ALTA')).toBeNull();
  });
});
