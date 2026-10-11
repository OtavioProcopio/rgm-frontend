/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { NovoUsuarioPage } from '@/features/admin/usuarios/pages/NovoUsuarioPage';

const { criar } = vi.hoisted(() => ({ criar: vi.fn() }));

vi.mock('@/features/admin/usuarios/hooks/useCriarUsuario', () => ({
  useCriarUsuario: () => ({ mutateAsync: criar, isPending: false }),
}));
vi.mock('@/features/admin/usuarios/components/UsuarioForm', () => ({
  UsuarioForm: ({ onSubmit }: { onSubmit: (data: object) => void }) => (
    <div data-testid="usuario-form">
      <button type="button" onClick={() => onSubmit({ nome: 'Ana' })}>
        Salvar
      </button>
    </div>
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('NovoUsuarioPage', () => {
  it('renders page title', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovoUsuarioPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Novo usuário')).toBeDefined();
  });

  it('renders form', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<NovoUsuarioPage />, { wrapper: AppWrapper });
    expect(container.querySelector('[data-testid="usuario-form"]')).toBeDefined();
  });

  it('deve confirmar com o aviso Usuário criado quando o cadastro dá certo', async () => {
    // Arrange
    criar.mockResolvedValue(undefined);
    const { AppWrapper } = createAppWrapper();
    render(<NovoUsuarioPage />, { wrapper: AppWrapper });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    // Assert
    await waitFor(() => expect(screen.getByText('Usuário criado')).toBeDefined());
  });

  it('deve não dar o aviso de sucesso e mostrar o erro quando o cadastro falha', async () => {
    // Arrange
    criar.mockRejectedValue(new Error('rede'));
    const { AppWrapper } = createAppWrapper();
    render(<NovoUsuarioPage />, { wrapper: AppWrapper });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    // Assert
    await waitFor(() => expect(screen.getByRole('alert')).toBeDefined());
    expect(screen.queryByText('Usuário criado')).toBeNull();
  });
});
