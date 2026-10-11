/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DeleteUsuarioDialog } from '@/features/admin/usuarios/components/DeleteUsuarioDialog';

const usuario = {
  id: '1',
  nome: 'João Silva',
  email: 'j@j.com',
  perfil: 'OPERADOR' as const,
  ativo: true,
  criadoEm: '',
  atualizadoEm: '',
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

  it('deve desabilitar os botões e avisar que aguarde quando a exclusão está em andamento', () => {
    // Act
    const { container } = render(
      <DeleteUsuarioDialog usuario={usuario} isDeleting onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );

    // Assert
    const botoes = within(container).getAllByRole('button');
    expect(botoes.every((botao) => botao.hasAttribute('disabled'))).toBe(true);
    expect(within(container).getByText('Aguarde...')).toBeDefined();
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

  it('deve abrir como diálogo modal chamado Confirmar exclusão', () => {
    // Act
    const { container } = render(
      <DeleteUsuarioDialog usuario={usuario} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );

    // Assert
    const dialogo = within(container).getByRole('dialog', { name: 'Confirmar exclusão' });
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
  });

  it('deve pôr o foco inicial em Cancelar quando abre', () => {
    // Act
    const { container } = render(
      <DeleteUsuarioDialog usuario={usuario} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );

    // Assert
    expect(document.activeElement).toBe(
      within(container).getByRole('button', { name: 'Cancelar' }),
    );
  });
});
