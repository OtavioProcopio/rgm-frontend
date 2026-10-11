/**
 * @vitest-environment jsdom
 */
import { cleanup, render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { useAtivarUsuario } from '@/features/admin/usuarios/hooks/useAtivarUsuario';
import { useDesativarUsuario } from '@/features/admin/usuarios/hooks/useDesativarUsuario';
import { useExcluirUsuario } from '@/features/admin/usuarios/hooks/useExcluirUsuario';
import { useUsuarios } from '@/features/admin/usuarios/hooks/useUsuarios';
import { UsuariosPage } from '@/features/admin/usuarios/pages/UsuariosPage';
import { ApiError } from '@/shared/api/apiError';

vi.mock('@/features/admin/usuarios/hooks/useUsuarios', () => ({
  useUsuarios: vi.fn().mockReturnValue({ data: undefined, error: null, isLoading: true }),
}));
vi.mock('@/features/admin/usuarios/hooks/useAtivarUsuario', () => ({
  useAtivarUsuario: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/admin/usuarios/hooks/useDesativarUsuario', () => ({
  useDesativarUsuario: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/admin/usuarios/hooks/useExcluirUsuario', () => ({
  useExcluirUsuario: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/admin/usuarios/components/UsuariosTable', () => ({
  UsuariosTable: ({
    usuarios,
    onDesativar,
    onExcluir,
    onAtivar,
  }: {
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
    const { useUsuarios } = await import('@/features/admin/usuarios/hooks/useUsuarios');
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

  it('deve não mostrar Mais ações quando o cabeçalho tem só o comando Novo usuário', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper();

    // Act
    const { container } = render(<UsuariosPage />, { wrapper: AppWrapper });

    // Assert
    expect(within(container).getByRole('link', { name: 'Novo usuário' })).toBeDefined();
    expect(within(container).queryByRole('button', { name: 'Mais ações' })).toBeNull();
  });

  it('shows error state when request fails', async () => {
    const { useUsuarios } = await import('@/features/admin/usuarios/hooks/useUsuarios');
    vi.mocked(useUsuarios).mockReturnValue({
      data: undefined,
      error: new Error('fail'),
      isLoading: false,
    } as unknown as ReturnType<typeof useUsuarios>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<UsuariosPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/não foi possível carregar/i)).toBeDefined();
  });

  it('deve refazer a consulta quando Tentar novamente é acionado depois da falha', async () => {
    // Arrange
    const userEvent = (await import('@testing-library/user-event')).default;
    const { useUsuarios } = await import('@/features/admin/usuarios/hooks/useUsuarios');
    const refetch = vi.fn();
    vi.mocked(useUsuarios).mockReturnValue({
      data: undefined,
      error: new Error('fail'),
      isLoading: false,
      refetch,
    } as unknown as ReturnType<typeof useUsuarios>);
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<UsuariosPage />, { wrapper: AppWrapper });

    // Act
    await userEvent.click(within(container).getByRole('button', { name: 'Tentar novamente' }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders table when data is available', async () => {
    const { useUsuarios } = await import('@/features/admin/usuarios/hooks/useUsuarios');
    vi.mocked(useUsuarios).mockReturnValue({
      data: {
        content: [
          {
            id: '1',
            nome: 'Alice',
            email: 'a@a.com',
            perfil: 'OPERADOR',
            ativo: true,
            criadoEm: '',
            atualizadoEm: '',
          },
        ],
        page: 0,
        totalPages: 1,
        totalElements: 1,
      },
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useUsuarios>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<UsuariosPage />, { wrapper: AppWrapper });
    expect(within(container).getByTestId('usuarios-table')).toBeDefined();
  });

  it('shows confirm dialog when desativar is triggered', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const { useUsuarios } = await import('@/features/admin/usuarios/hooks/useUsuarios');
    vi.mocked(useUsuarios).mockReturnValue({
      data: {
        content: [
          {
            id: '1',
            nome: 'Alice',
            email: 'a@a.com',
            perfil: 'OPERADOR',
            ativo: true,
            criadoEm: '',
            atualizadoEm: '',
          },
        ],
        page: 0,
        totalPages: 1,
        totalElements: 1,
      },
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useUsuarios>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<UsuariosPage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByText('desativar-1'));
    const dialogo = within(container).getByRole('dialog', { name: 'Desativar usuário' });
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement).toBe(within(dialogo).getByRole('button', { name: 'Cancelar' }));
  });

  it('shows delete dialog when excluir is triggered', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const { useUsuarios } = await import('@/features/admin/usuarios/hooks/useUsuarios');
    vi.mocked(useUsuarios).mockReturnValue({
      data: {
        content: [
          {
            id: '1',
            nome: 'Alice',
            email: 'a@a.com',
            perfil: 'OPERADOR',
            ativo: true,
            criadoEm: '',
            atualizadoEm: '',
          },
        ],
        page: 0,
        totalPages: 1,
        totalElements: 1,
      },
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useUsuarios>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<UsuariosPage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByText('excluir-1'));
    const dialogo = within(container).getByRole('dialog', { name: 'Confirmar exclusão' });
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
    expect(document.activeElement).toBe(within(dialogo).getByRole('button', { name: 'Cancelar' }));
  });

  it('calls ativar mutation when ativar is triggered', async () => {
    const userEvent = (await import('@testing-library/user-event')).default;
    const { useUsuarios } = await import('@/features/admin/usuarios/hooks/useUsuarios');
    const { useAtivarUsuario } = await import('@/features/admin/usuarios/hooks/useAtivarUsuario');
    const ativarMock = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useAtivarUsuario).mockReturnValue({
      mutateAsync: ativarMock,
      isPending: false,
    } as unknown as ReturnType<typeof useAtivarUsuario>);
    vi.mocked(useUsuarios).mockReturnValue({
      data: {
        content: [
          {
            id: '1',
            nome: 'Alice',
            email: 'a@a.com',
            perfil: 'OPERADOR',
            ativo: false,
            criadoEm: '',
            atualizadoEm: '',
          },
        ],
        page: 0,
        totalPages: 1,
        totalElements: 1,
      },
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useUsuarios>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<UsuariosPage />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getByText('ativar-1'));
    expect(ativarMock).toHaveBeenCalledWith('1');
  });
});

describe('UsuariosPage — ações, filtros e paginação', () => {
  function abrir(pagina = { page: 1, totalPages: 3 }) {
    const mutacoes = {
      ativar: vi.fn().mockResolvedValue(undefined),
      desativar: vi.fn().mockResolvedValue(undefined),
      excluir: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(useAtivarUsuario).mockReturnValue({
      mutateAsync: mutacoes.ativar,
      isPending: false,
    } as unknown as ReturnType<typeof useAtivarUsuario>);
    vi.mocked(useDesativarUsuario).mockReturnValue({
      mutateAsync: mutacoes.desativar,
      isPending: false,
    } as unknown as ReturnType<typeof useDesativarUsuario>);
    vi.mocked(useExcluirUsuario).mockReturnValue({
      mutateAsync: mutacoes.excluir,
      isPending: false,
    } as unknown as ReturnType<typeof useExcluirUsuario>);
    vi.mocked(useUsuarios).mockReturnValue({
      data: {
        content: [{ id: '1', nome: 'Alice', email: 'a@a.com', perfil: 'OPERADOR', ativo: true }],
        page: pagina.page,
        totalPages: pagina.totalPages,
        totalElements: 3,
      },
      error: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useUsuarios>);
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<UsuariosPage />, { wrapper: AppWrapper });
    return { ...mutacoes, tela: within(container) };
  }

  const ultimosFiltros = () => vi.mocked(useUsuarios).mock.calls.at(-1)![0];

  it('deve desativar o usuário e fechar a confirmação quando a desativação é confirmada', async () => {
    // Arrange
    const { desativar, tela } = abrir();
    await userEvent.click(tela.getByText('desativar-1'));

    // Act
    await userEvent.click(
      within(tela.getByRole('dialog')).getByRole('button', { name: 'Desativar' }),
    );

    // Assert
    expect(desativar).toHaveBeenCalledExactlyOnceWith('1');
    await waitFor(() => expect(tela.queryByRole('dialog')).toBeNull());
  });

  it('deve mostrar o erro da operação e fechar a confirmação quando a desativação falha', async () => {
    // Arrange
    const { desativar, tela } = abrir();
    desativar.mockRejectedValueOnce(new ApiError({ status: 409, message: 'Último administrador' }));
    await userEvent.click(tela.getByText('desativar-1'));

    // Act
    await userEvent.click(
      within(tela.getByRole('dialog')).getByRole('button', { name: 'Desativar' }),
    );

    // Assert
    expect(await tela.findByText('Operação não concluída')).toBeDefined();
    expect(tela.queryByRole('dialog')).toBeNull();
  });

  it('deve excluir o usuário e fechar o diálogo quando a exclusão é confirmada', async () => {
    // Arrange
    const { excluir, tela } = abrir();
    await userEvent.click(tela.getByText('excluir-1'));

    // Act
    await userEvent.click(tela.getByRole('button', { name: 'Excluir usuário' }));

    // Assert
    expect(excluir).toHaveBeenCalledExactlyOnceWith('1');
    await waitFor(() => expect(tela.queryByRole('dialog')).toBeNull());
  });

  it('deve mostrar o erro da operação quando a exclusão falha', async () => {
    // Arrange
    const { excluir, tela } = abrir();
    excluir.mockRejectedValueOnce(new ApiError({ status: 409, message: 'Há vínculos' }));
    await userEvent.click(tela.getByText('excluir-1'));

    // Act
    await userEvent.click(tela.getByRole('button', { name: 'Excluir usuário' }));

    // Assert
    expect(await tela.findByText('Operação não concluída')).toBeDefined();
  });

  it('deve mostrar o erro da operação quando a ativação falha', async () => {
    // Arrange
    const { ativar, tela } = abrir();
    ativar.mockRejectedValueOnce(new ApiError({ status: 500, message: 'Erro interno' }));

    // Act
    await userEvent.click(tela.getByText('ativar-1'));

    // Assert
    expect(await tela.findByText('Operação não concluída')).toBeDefined();
  });

  it('deve pedir a primeira página do perfil escolhido quando o filtro de perfil muda', async () => {
    // Arrange
    const { tela } = abrir();

    // Act
    await userEvent.selectOptions(tela.getByLabelText('Perfil'), 'GESTOR');

    // Assert
    expect(ultimosFiltros()).toMatchObject({ perfil: 'GESTOR', page: 0 });
  });

  it('deve pedir só os inativos quando o filtro de status muda para Inativos', async () => {
    // Arrange
    const { tela } = abrir();

    // Act
    await userEvent.selectOptions(tela.getByLabelText('Status'), 'false');

    // Assert
    expect(ultimosFiltros()).toMatchObject({ ativo: false, page: 0 });
  });

  it('deve pedir a página seguinte quando Próxima é acionada', async () => {
    // Arrange
    const { tela } = abrir({ page: 1, totalPages: 3 });

    // Act
    await userEvent.click(tela.getByRole('button', { name: 'Próxima' }));

    // Assert
    expect(ultimosFiltros()).toMatchObject({ page: 1 });
  });

  it('deve pedir a página anterior quando Anterior é acionada', async () => {
    // Arrange
    const { tela } = abrir({ page: 1, totalPages: 3 });
    await userEvent.click(tela.getByRole('button', { name: 'Próxima' }));

    // Act
    await userEvent.click(tela.getByRole('button', { name: 'Anterior' }));

    // Assert
    expect(ultimosFiltros()).toMatchObject({ page: 0 });
  });

  it('deve fechar a confirmação sem desativar quando Cancelar é acionado', async () => {
    // Arrange
    const { desativar, tela } = abrir();
    await userEvent.click(tela.getByText('desativar-1'));

    // Act
    await userEvent.click(
      within(tela.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }),
    );

    // Assert
    expect(tela.queryByRole('dialog')).toBeNull();
    expect(desativar).not.toHaveBeenCalled();
  });

  it('deve fechar o diálogo sem excluir quando Cancelar é acionado', async () => {
    // Arrange
    const { excluir, tela } = abrir();
    await userEvent.click(tela.getByText('excluir-1'));

    // Act
    await userEvent.click(
      within(tela.getByRole('dialog')).getByRole('button', { name: 'Cancelar' }),
    );

    // Assert
    expect(tela.queryByRole('dialog')).toBeNull();
    expect(excluir).not.toHaveBeenCalled();
  });
});
