/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ModelosTable } from '@/features/admin/modelos/components/ModelosTable';

vi.mock('@/features/admin/modelos/components/ModeloActionsMenu', () => ({
  ModeloActionsMenu: () => <div data-testid="actions-menu" />,
}));
vi.mock('@/features/admin/modelos/components/ModeloFotoCapa', () => ({
  ModeloFotoCapa: () => <div data-testid="foto-capa" />,
}));

const modelo = {
  id: '1', codigo: 'M01', descricao: 'Desc', maquina: 'Injetora',
  versao: 1, observacoes: null, temPendenciaAberta: false, tipo: null,
  ativo: true, fotoCapaUrl: null, criadoEm: '', atualizadoEm: '',
};

afterEach(cleanup);

describe('ModelosTable', () => {
  it('renders modelo items', () => {
    const { container } = render(
      <ModelosTable modelos={[modelo]} />,
    );
    expect(within(container).getAllByText('M01').length).toBeGreaterThan(0);
  });

  it('renders empty when no modelos', () => {
    const { container } = render(
      <ModelosTable modelos={[]} />,
    );
    expect(within(container).queryByText('M01')).toBeNull();
  });
});
