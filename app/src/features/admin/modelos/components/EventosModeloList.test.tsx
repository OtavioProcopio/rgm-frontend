/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { EventosModeloList } from './EventosModeloList';

const evento = {
  id: 'e1',
  modeloId: 'm1',
  titulo: 'Manutenção preventiva',
  tipo: 'MANUTENCAO',
  descricao: 'Revisão geral',
  estadoModeloDescricao: null,
  defineFotoCapa: false,
  executadoPorUsuarioId: null,
  solicitacaoRelacionadaId: null,
  criadoEm: '2024-06-01T10:00:00Z',
};

afterEach(cleanup);

describe('EventosModeloList', () => {
  it('renders empty state when no eventos', () => {
    const { container } = render(
      <MemoryRouter>
        <EventosModeloList eventos={[]} />
      </MemoryRouter>
    );
    expect(within(container).getByText(/nenhum evento/i)).toBeDefined();
  });

  it('renders evento titulo and descricao', () => {
    const { container } = render(
      <MemoryRouter>
        <EventosModeloList eventos={[evento]} />
      </MemoryRouter>
    );
    expect(within(container).getByText('Manutenção preventiva')).toBeDefined();
    expect(within(container).getByText('Revisão geral')).toBeDefined();
  });

  it('shows tipo when descricao is null', () => {
    const { container } = render(
      <MemoryRouter>
        <EventosModeloList eventos={[{ ...evento, descricao: null }]} />
      </MemoryRouter>
    );
    expect(within(container).getByText('MANUTENCAO')).toBeDefined();
  });

  it('shows estadoModeloDescricao when present', () => {
    const { container } = render(
      <MemoryRouter>
        <EventosModeloList eventos={[{ ...evento, estadoModeloDescricao: 'Em uso' }]} />
      </MemoryRouter>
    );
    expect(within(container).getByText('Em uso')).toBeDefined();
  });

  it('renders clickable link when solicitacaoRelacionadaId is present', () => {
    const { container } = render(
      <MemoryRouter>
        <EventosModeloList eventos={[{ ...evento, solicitacaoRelacionadaId: 'sol-123' }]} />
      </MemoryRouter>
    );
    expect(within(container).getByText(/ver solicitação relacionada/i)).toBeDefined();
    const link = container.querySelector('a');
    expect(link).toBeDefined();
    expect(link?.getAttribute('href')).toBe('/app/solicitacoes/sol-123');
  });
});
