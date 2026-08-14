/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MaquinasTable } from './MaquinasTable';

const maquinas = [
  { id: '1', nome: 'FBOX', ativo: true, criadoEm: '', atualizadoEm: '' },
  { id: '2', nome: 'VICK', ativo: false, criadoEm: '', atualizadoEm: '' },
];

afterEach(cleanup);

describe('MaquinasTable', () => {
  it('renders machine names', () => {
    const { container } = render(
      <MemoryRouter>
        <MaquinasTable maquinas={maquinas} onAtivar={vi.fn()} onDesativar={vi.fn()} />
      </MemoryRouter>,
    );
    expect(within(container).getAllByText('FBOX').length).toBeGreaterThan(0);
    expect(within(container).getAllByText('VICK').length).toBeGreaterThan(0);
  });

  it('renders empty table body when no maquinas', () => {
    const { container } = render(
      <MemoryRouter>
        <MaquinasTable maquinas={[]} onAtivar={vi.fn()} onDesativar={vi.fn()} />
      </MemoryRouter>,
    );
    expect(within(container).queryByText('FBOX')).toBeNull();
  });
});
