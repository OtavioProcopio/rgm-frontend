/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ModelosTable } from './ModelosTable';

vi.mock('./ModeloActionsMenu', () => ({
  ModeloActionsMenu: () => <div data-testid="actions-menu" />,
}));
vi.mock('./ModeloFotoCapa', () => ({
  ModeloFotoCapa: () => <div data-testid="foto-capa" />,
}));

const modelo = {
  id: '1', codigo: 'M01', descricao: 'Desc', maquinaId: 'm1',
  ativo: true, fotoUrl: null, criadoEm: '', atualizadoEm: '',
};

afterEach(cleanup);

describe('ModelosTable', () => {
  it('renders modelo items', () => {
    const { container } = render(
      <ModelosTable modelos={[modelo]} onDesativar={vi.fn()} onAtivar={vi.fn()} />,
    );
    expect(within(container).getAllByText('M01').length).toBeGreaterThan(0);
  });

  it('renders empty when no modelos', () => {
    const { container } = render(
      <ModelosTable modelos={[]} onDesativar={vi.fn()} onAtivar={vi.fn()} />,
    );
    expect(within(container).queryByText('M01')).toBeNull();
  });
});
