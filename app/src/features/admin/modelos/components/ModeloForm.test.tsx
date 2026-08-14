/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ModeloForm } from './ModeloForm';

const baseMockModelo = {
  id: '1', codigo: 'M01', descricao: 'Desc', maquinaId: 'm1',
  ativo: true, fotoCapaUrl: null, criadoEm: '', atualizadoEm: '',
  maquina: 'Injetora', observacoes: null, versao: 1,
  temPendenciaAberta: false,
};

vi.mock('../hooks/useMaquinas', () => ({
  useMaquinas: vi.fn().mockReturnValue({
    data: [
      { id: 'm1', nome: 'FBOX', ativo: true, criadoEm: '', atualizadoEm: '' },
      { id: 'm2', nome: 'Injetora', ativo: true, criadoEm: '', atualizadoEm: '' },
    ],
    isLoading: false,
  }),
}));

afterEach(cleanup);

describe('ModeloForm', () => {
  it('renders create form fields', () => {
    const { container } = render(<ModeloForm mode="create" onSubmit={vi.fn()} />);
    expect(within(container).getByLabelText(/código/i)).toBeDefined();
    expect(within(container).getByRole('button', { name: /salvar modelo/i })).toBeDefined();
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
    await userEvent.selectOptions(within(container).getByLabelText(/máquina/i), 'FBOX');
    await userEvent.type(within(container).getByLabelText(/descrição/i), 'Teste desc');
    await userEvent.click(within(container).getByRole('button', { name: /salvar modelo/i }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('calls onSubmit with form data on edit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(
      <ModeloForm mode="edit" modelo={baseMockModelo} onSubmit={onSubmit} />,
    );
    await userEvent.click(within(container).getByRole('button', { name: /salvar modelo/i }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('lists machines from the catalog instead of a free text field', () => {
    const { container } = render(<ModeloForm mode="create" onSubmit={vi.fn()} />);
    const select = within(container).getByLabelText(/máquina/i);
    expect(select.tagName).toBe('SELECT');
    expect(within(select).getByRole('option', { name: 'FBOX' })).toBeDefined();
    expect(within(select).getByRole('option', { name: 'Injetora' })).toBeDefined();
  });

  it('keeps the current machine selected when editing, even if it is no longer in the active catalog', () => {
    const { container } = render(
      <ModeloForm
        mode="edit"
        modelo={{ ...baseMockModelo, maquina: 'Prensa Antiga' }}
        onSubmit={vi.fn()}
      />,
    );
    const select = within(container).getByLabelText<HTMLSelectElement>(/máquina/i);
    expect(select.value).toBe('Prensa Antiga');
    expect(
      within(select).getByRole('option', { name: /prensa antiga.*fora do catálogo/i }),
    ).toBeDefined();
  });
});
