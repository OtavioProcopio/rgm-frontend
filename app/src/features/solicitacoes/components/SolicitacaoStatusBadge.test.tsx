/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SolicitacaoStatusBadge } from './SolicitacaoStatusBadge';

afterEach(cleanup);

describe('SolicitacaoStatusBadge', () => {
  it('renders A_FAZER label', () => {
    const { container } = render(<SolicitacaoStatusBadge status="A_FAZER" />);
    expect(within(container).getByText('A fazer')).toBeDefined();
  });

  it('renders EM_ANDAMENTO label', () => {
    const { container } = render(<SolicitacaoStatusBadge status="EM_ANDAMENTO" />);
    expect(within(container).getByText('Em andamento')).toBeDefined();
  });

  it('renders EM_VALIDACAO label', () => {
    const { container } = render(<SolicitacaoStatusBadge status="EM_VALIDACAO" />);
    expect(within(container).getByText('Em validação')).toBeDefined();
  });

  it('renders CONCLUIDA label', () => {
    const { container } = render(<SolicitacaoStatusBadge status="CONCLUIDA" />);
    expect(within(container).getByText('Concluída')).toBeDefined();
  });

  it('renders CANCELADA label', () => {
    const { container } = render(<SolicitacaoStatusBadge status="CANCELADA" />);
    expect(within(container).getByText('Cancelada')).toBeDefined();
  });
});
