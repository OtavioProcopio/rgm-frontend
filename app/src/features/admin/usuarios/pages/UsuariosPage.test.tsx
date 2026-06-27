/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@/test-utils/appWrapper';

import { UsuariosPage } from './UsuariosPage';

vi.mock('../hooks/useUsuarios', () => ({
  useUsuarios: vi.fn().mockReturnValue({ data: undefined, error: null, isLoading: true }),
}));
vi.mock('../hooks/useAtivarUsuario', () => ({
  useAtivarUsuario: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/useDesativarUsuario', () => ({
  useDesativarUsuario: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/useExcluirUsuario', () => ({
  useExcluirUsuario: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('../components/UsuariosTable', () => ({
  UsuariosTable: ({ usuarios, onDesativar, onExcluir, onAtivar }: {
    usuarios: { id: string; nome: string; ativo: boolean }[];
    onDesativar: (u: { id: string; nome: string }) => void;
    onAtivar: (u: { id: string; nome: string }) => void;
    onExcluir: (u: { id: string; nome: string }) => void;
  }) => (
    <div data-testid="usuarios-table">
      {usuarios.map((u) => (
        <div key={u.id}>
          {u.nome}
          <button onClick={() => onDesativar(u)}>desativar-{u.id}</button>
          <button onClick={() => onAtivar(u)}>ativar-{u.id}</button>
          <button onClick={() => onExcluir(u)}>excluir-{u.id}</button>
        </div>
      ))}
    </div>
  ),
}));
vi.mock('../components/DeleteUsuarioDialog', () => ({
  DeleteUsuarioDialog: () => <div data-testid="delete-dialog" />,
}));
vi.mock('@/shared/components/ConfirmDialog/ConfirmDialog', () => ({
  ConfirmDialog: () => <div data-testid="confirm-dialog" />,
}));

afterEach(cleanup);

describe('UsuariosPage', () => {
  it('renders page title', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<UsuariosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Usuários')).toBeDefined();
  });

  it('shows loading state', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<UsuariosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando usuários/i)).toBeDefined();
  });

  it('shows empty state when no usuarios', async () => {
    const { useUsuarios } = await import('../hooks/useUsuarios');
    vi.mocked(useUsuarios).mockReturnValue({
      data: { content: [], page: 0, totalPages: 0, totalElements: 0 },
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useUsuarios>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<UsuariosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/nenhum usuário encontrado/i)).toBeDefined();
  });

  it('shows novo usuario link', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<UsuariosPage />, { wrapper: AppWrapper });
    expect(within(container).getByRole('link', { name: /novo usuário/i })).toBeDefined();
  });

  it('shows error state when request fails', async () => {
    const { useUsuarios } = await import('../hooks/useUsuarios');
    vi.mocked(useUsuarios).mockReturnValue({
      data: undefined, error: new Error('fail'), isLoading: false,
    } as unknown as ReturnType<typeof useUsuarios>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<UsuariosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/não foi possível carregar/i)).toBeDefined();
  });

  it('renders table when data is available', async () => {
    const { useUsuarios } = await import('../hooks/useUsuarios');
    vi.mocked(useUsuarios).mockReturnValue({
      data: {
        content: [
          { id: '1', nome: 'Alice', email: 'a@a.com', perfil: 'OPERADOR', ativo: true, criadoEm: '', atualizadoEm: '' },
        ],
        page: 0, totalPages: 1, totalElements: 1,
      },
      error: null, isLoading: false,
    } as unknown as ReturnType<typeof useUsuarios>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<UsuariosPage />, { wrapper: AppWrapper });
    expect(within(container).getByTestId('usuarios-table')).toBeDefined();
  });

  it('shows confirm dialog when desativar is triggered', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const { useUsuarios } = await import('../hooks/useUsuarios');
    vi.mocked(useUsuarios).mockReturnValue({
      data: { content: [{ id: '1', nome: 'Alice', email: 'a@a.com', perfil: 'OPERADOR', ativo: true, criadoEm: '', atualizadoEm: '' }], page: 0, totalPages: 1, totalElements: 1 },
      error: null, isLoading: false,
    } as unknown as ReturnType<typeof useUsuarios>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<UsuariosPage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByText('desativar-1'));
    expect(within(container).getByTestId('confirm-dialog')).toBeDefined();
  });

  it('shows delete dialog when excluir is triggered', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const { useUsuarios } = await import('../hooks/useUsuarios');
    vi.mocked(useUsuarios).mockReturnValue({
      data: { content: [{ id: '1', nome: 'Alice', email: 'a@a.com', perfil: 'OPERADOR', ativo: true, criadoEm: '', atualizadoEm: '' }], page: 0, totalPages: 1, totalElements: 1 },
      error: null, isLoading: false,
    } as unknown as ReturnType<typeof useUsuarios>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<UsuariosPage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByText('excluir-1'));
    expect(within(container).getByTestId('delete-dialog')).toBeDefined();
  });

  it('calls ativar mutation when ativar is triggered', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const { useUsuarios } = await import('../hooks/useUsuarios');
    const { useAtivarUsuario } = await import('../hooks/useAtivarUsuario');
    const ativarMock = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useAtivarUsuario).mockReturnValue({ mutateAsync: ativarMock, isPending: false } as unknown as ReturnType<typeof useAtivarUsuario>);
    vi.mocked(useUsuarios).mockReturnValue({
      data: { content: [{ id: '1', nome: 'Alice', email: 'a@a.com', perfil: 'OPERADOR', ativo: false, criadoEm: '', atualizadoEm: '' }], page: 0, totalPages: 1, totalElements: 1 },
      error: null, isLoading: false,
    } as unknown as ReturnType<typeof useUsuarios>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<UsuariosPage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByText('ativar-1'));
    expect(ativarMock).toHaveBeenCalledWith('1');
  });
});
