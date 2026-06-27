/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
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
    const { container } = render(<EventosModeloList eventos={[]} />);
    expect(within(container).getByText(/nenhum evento/i)).toBeDefined();
  });

  it('renders evento titulo and descricao', () => {
    const { container } = render(<EventosModeloList eventos={[evento]} />);
    expect(within(container).getByText('Manutenção preventiva')).toBeDefined();
    expect(within(container).getByText('Revisão geral')).toBeDefined();
  });

  it('shows tipo when descricao is null', () => {
    const { container } = render(
      <EventosModeloList eventos={[{ ...evento, descricao: null }]} />,
    );
    expect(within(container).getByText('MANUTENCAO')).toBeDefined();
  });

  it('shows estadoModeloDescricao when present', () => {
    const { container } = render(
      <EventosModeloList eventos={[{ ...evento, estadoModeloDescricao: 'Em uso' }]} />,
    );
    expect(within(container).getByText('Em uso')).toBeDefined();
  });
});
