/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { EditarUsuarioPage } from '@/features/admin/usuarios/pages/EditarUsuarioPage';

vi.mock('@/features/admin/usuarios/hooks/useUsuario', () => ({
  useUsuario: vi.fn().mockReturnValue({ data: undefined, isLoading: true, error: null }),
}));
vi.mock('@/features/admin/usuarios/hooks/useEditarUsuario', () => ({
  useEditarUsuario: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/admin/usuarios/hooks/useRedefinirSenhaUsuario', () => ({
  useRedefinirSenhaUsuario: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/admin/usuarios/hooks/useAlterarPerfilUsuario', () => ({
  useAlterarPerfilUsuario: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/auth/hooks/usePerfil', () => ({
  usePerfil: vi.fn().mockReturnValue({ data: { nome: 'Admin', email: 'a@a.com', perfil: 'ADMINISTRADOR' } }),
}));
vi.mock('@/features/admin/usuarios/components/UsuarioForm', () => ({
  UsuarioForm: () => <div data-testid="usuario-form" />,
}));

afterEach(cleanup);

describe('EditarUsuarioPage', () => {
  it('shows loading state', () => {
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/usuarios/1'] });
    const { container } = render(<EditarUsuarioPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('shows form when usuario is loaded', async () => {
    const { useUsuario } = await import('@/features/admin/usuarios/hooks/useUsuario');
    vi.mocked(useUsuario).mockReturnValue({
      data: { id: '1', nome: 'João', email: 'j@j.com', perfil: 'OPERADOR', ativo: true },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useUsuario>);

    const { AppWrapper } = createAppWrapper({ initialEntries: ['/usuarios/1'] });
    const { container } = render(<EditarUsuarioPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Editar usuário')).toBeDefined();
  });
});
