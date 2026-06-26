/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DeleteUsuarioDialog } from './DeleteUsuarioDialog';

const usuario = {
  id: '1', nome: 'João Silva', email: 'j@j.com', perfil: 'OPERADOR' as const,
  ativo: true, criadoEm: '', atualizadoEm: '',
};

afterEach(cleanup);

describe('DeleteUsuarioDialog', () => {
  it('renders usuario nome and confirm message', () => {
    const { container } = render(
      <DeleteUsuarioDialog usuario={usuario} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(within(container).getByText(/confirmar exclusão/i)).toBeDefined();
    expect(within(container).getByText(/João Silva/)).toBeDefined();
  });

  it('renders cancelar and excluir buttons', () => {
    const { container } = render(
      <DeleteUsuarioDialog usuario={usuario} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(within(container).getByText('Cancelar')).toBeDefined();
    expect(within(container).getByText('Excluir usuário')).toBeDefined();
  });

  it('shows excluindo when deleting', () => {
    const { container } = render(
      <DeleteUsuarioDialog usuario={usuario} isDeleting onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(within(container).getByText('Excluindo...')).toBeDefined();
  });

  it('calls onConfirm when excluir is clicked', async () => {
    const onConfirm = vi.fn();
    const { container } = render(
      <DeleteUsuarioDialog usuario={usuario} onCancel={vi.fn()} onConfirm={onConfirm} />,
    );
    await userEvent.click(within(container).getByText('Excluir usuário'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancelar is clicked', async () => {
    const onCancel = vi.fn();
    const { container } = render(
      <DeleteUsuarioDialog usuario={usuario} onCancel={onCancel} onConfirm={vi.fn()} />,
    );
    await userEvent.click(within(container).getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalled();
  });
});
