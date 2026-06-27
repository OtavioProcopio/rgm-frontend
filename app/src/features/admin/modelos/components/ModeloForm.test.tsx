/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ModeloForm } from './ModeloForm';

const baseMockModelo = {
  id: '1', codigo: 'M01', descricao: 'Desc', maquinaId: 'm1',
  ativo: true, fotoUrl: null, criadoEm: '', atualizadoEm: '',
  maquina: 'Injetora', observacoes: null, versao: 1,
  temPendenciaAberta: false,
};

afterEach(cleanup);

describe('ModeloForm', () => {
  it('renders create form fields', () => {
    const { container } = render(<ModeloForm mode="create" onSubmit={vi.fn()} />);
    expect(within(container).getByLabelText(/código/i)).toBeDefined();
    expect(within(container).getByRole('button')).toBeDefined();
  });

  it('renders edit form with pre-filled values', () => {
    const { container } = render(
      <ModeloForm mode="edit" modelo={baseMockModelo} onSubmit={vi.fn()} />,
    );
    const codigoInput = within(container).getByDisplayValue('M01');
    expect(codigoInput).toBeDefined();
  });

  it('calls onSubmit with form data on create', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<ModeloForm mode="create" onSubmit={onSubmit} />);
    await userEvent.type(within(container).getByLabelText(/código/i), 'M99');
    await userEvent.type(within(container).getByLabelText(/máquina/i), 'Injetora X');
    await userEvent.type(within(container).getByLabelText(/descrição/i), 'Teste desc');
    await userEvent.click(within(container).getByRole('button'));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('calls onSubmit with form data on edit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <ModeloForm mode="edit" modelo={baseMockModelo} onSubmit={onSubmit} />,
    );
    await userEvent.click(within(container).getByRole('button'));
    expect(onSubmit).toHaveBeenCalled();
  });
});
