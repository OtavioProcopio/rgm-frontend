/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { useAlterarPerfilUsuario } from '@/features/admin/usuarios/hooks/useAlterarPerfilUsuario';
import { useEditarUsuario } from '@/features/admin/usuarios/hooks/useEditarUsuario';
import { usePerfil } from '@/features/auth/hooks/usePerfil';
import { useRedefinirSenhaUsuario } from '@/features/admin/usuarios/hooks/useRedefinirSenhaUsuario';
import { useUsuario } from '@/features/admin/usuarios/hooks/useUsuario';
import { EditarUsuarioPage } from '@/features/admin/usuarios/pages/EditarUsuarioPage';
import { ApiError } from '@/shared/api/apiError';
import { rotuloDoPerfil } from '@/shared/lib/rotulos';
import { MENSAGEM_DA_SENHA, TAMANHO_MINIMO_DA_SENHA } from '@/shared/lib/senha';

/** O prestador externo não tem login: a tela não o oferece como nível de acesso. */
const PERFIS_COM_LOGIN = Object.entries(rotuloDoPerfil).filter(([perfil]) => perfil !== 'EXTERNO');
const TEXTO_DE_ERRO = 'text-danger-fg';

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
  usePerfil: vi
    .fn()
    .mockReturnValue({ data: { nome: 'Admin', email: 'a@a.com', perfil: 'ADMINISTRADOR' } }),
}));
vi.mock('@/features/admin/usuarios/components/UsuarioForm', () => ({
  UsuarioForm: ({ onSubmit }: { onSubmit: (data: object) => void }) => (
    <div data-testid="usuario-form">
      <button type="button" onClick={() => onSubmit({ nome: 'João Silva' })}>
        salvar-dados
      </button>
    </div>
  ),
}));

afterEach(() => {
  cleanup();
  vi.mocked(usePerfil).mockReturnValue({
    data: { id: 'admin', nome: 'Admin', email: 'a@a.com', perfil: 'ADMINISTRADOR' },
  } as unknown as ReturnType<typeof usePerfil>);
});

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

describe('EditarUsuarioPage — redefinição de senha', () => {
  const ID_DO_USUARIO = '1';

  /** Abre a página do usuário carregado e devolve a função que redefine a senha. */
  function abrirPagina() {
    const redefinir = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useUsuario).mockReturnValue({
      data: { id: ID_DO_USUARIO, nome: 'João', email: 'j@j.com', perfil: 'OPERADOR', ativo: true },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useUsuario>);
    vi.mocked(useRedefinirSenhaUsuario).mockReturnValue({
      mutateAsync: redefinir,
      isPending: false,
    } as unknown as ReturnType<typeof useRedefinirSenhaUsuario>);
    const { AppWrapper } = createAppWrapper({ initialEntries: [`/usuarios/${ID_DO_USUARIO}`] });
    render(
      <Routes>
        <Route path="/usuarios/:id" element={<EditarUsuarioPage />} />
      </Routes>,
      { wrapper: AppWrapper },
    );
    return redefinir;
  }

  it('deve recusar a redefinição com a mensagem única quando a senha tem um caractere a menos que o mínimo', async () => {
    // Arrange
    const redefinir = abrirPagina();
    const senhaCurta = 'a'.repeat(TAMANHO_MINIMO_DA_SENHA - 1);

    // Act
    await userEvent.type(screen.getByLabelText('Nova Senha'), senhaCurta);
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar Senha' }));

    // Assert
    expect(screen.getByText(MENSAGEM_DA_SENHA)).toBeDefined();
    expect(redefinir).not.toHaveBeenCalled();
  });

  it('deve redefinir a senha quando ela tem o tamanho mínimo', async () => {
    // Arrange
    const redefinir = abrirPagina();
    const novaSenha = 'a'.repeat(TAMANHO_MINIMO_DA_SENHA);

    // Act
    await userEvent.type(screen.getByLabelText('Nova Senha'), novaSenha);
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar Senha' }));

    // Assert
    expect(redefinir).toHaveBeenCalledWith({ id: ID_DO_USUARIO, novaSenha });
  });

  it('deve mostrar a recusa com o texto de erro do tema quando a senha é curta demais', async () => {
    // Arrange
    abrirPagina();
    const senhaCurta = 'a'.repeat(TAMANHO_MINIMO_DA_SENHA - 1);

    // Act
    await userEvent.type(screen.getByLabelText('Nova Senha'), senhaCurta);
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar Senha' }));

    // Assert
    const aviso = screen.getByText(MENSAGEM_DA_SENHA).closest('div')!;
    expect(aviso.className.split(' ')).toContain(TEXTO_DE_ERRO);
  });
});

describe('EditarUsuarioPage — nível de acesso', () => {
  /** Abre a página de um usuário com login, que é quem tem o seletor de perfil. */
  function abrirPagina() {
    vi.mocked(useUsuario).mockReturnValue({
      data: { id: '1', nome: 'João', email: 'j@j.com', perfil: 'OPERADOR', ativo: true },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useUsuario>);
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/usuarios/1'] });
    render(<EditarUsuarioPage />, { wrapper: AppWrapper });
    return screen.getByLabelText('Perfil');
  }

  it.each(PERFIS_COM_LOGIN)(
    'deve mostrar o rótulo da fonte única quando a opção de perfil é %s',
    (perfil, rotulo) => {
      // Arrange
      const seletor = abrirPagina();

      // Act
      const opcao = seletor.querySelector(`option[value="${perfil}"]`);

      // Assert
      expect(opcao?.textContent).toBe(rotulo);
    },
  );
});

describe('EditarUsuarioPage — salvar, perfil e senha', () => {
  function abrir() {
    const mutacoes = {
      editar: vi.fn().mockResolvedValue(undefined),
      redefinir: vi.fn().mockResolvedValue(undefined),
      alterarPerfil: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(useUsuario).mockReturnValue({
      data: { id: '1', nome: 'João', email: 'j@j.com', perfil: 'OPERADOR', ativo: true },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useUsuario>);
    vi.mocked(useEditarUsuario).mockReturnValue({
      mutateAsync: mutacoes.editar,
      isPending: false,
    } as unknown as ReturnType<typeof useEditarUsuario>);
    vi.mocked(useRedefinirSenhaUsuario).mockReturnValue({
      mutateAsync: mutacoes.redefinir,
      isPending: false,
    } as unknown as ReturnType<typeof useRedefinirSenhaUsuario>);
    vi.mocked(useAlterarPerfilUsuario).mockReturnValue({
      mutateAsync: mutacoes.alterarPerfil,
      isPending: false,
    } as unknown as ReturnType<typeof useAlterarPerfilUsuario>);
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/usuarios/1'] });
    render(
      <Routes>
        <Route path="/usuarios/:id" element={<EditarUsuarioPage />} />
        <Route path="/app/admin/usuarios" element={<p>Lista de usuários</p>} />
      </Routes>,
      { wrapper: AppWrapper },
    );
    return mutacoes;
  }

  it('deve salvar os dados e voltar à lista quando o formulário é enviado', async () => {
    // Arrange
    const { editar } = abrir();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'salvar-dados' }));

    // Assert
    expect(editar).toHaveBeenCalledExactlyOnceWith({ id: '1', payload: { nome: 'João Silva' } });
    expect(await screen.findByText('Lista de usuários')).toBeDefined();
  });

  it('deve mostrar o erro e ficar na tela quando salvar os dados falha', async () => {
    // Arrange
    const { editar } = abrir();
    editar.mockRejectedValueOnce(new ApiError({ status: 409, message: 'E-mail já usado' }));

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'salvar-dados' }));

    // Assert
    expect(await screen.findByText('Não foi possível editar o usuário')).toBeDefined();
    expect(screen.queryByText('Lista de usuários')).toBeNull();
  });

  it('deve confirmar a redefinição e limpar o campo quando a nova senha é aceita', async () => {
    // Arrange
    abrir();
    const campo = screen.getByLabelText('Nova Senha') as HTMLInputElement;
    await userEvent.type(campo, 'a'.repeat(TAMANHO_MINIMO_DA_SENHA));

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar Senha' }));

    // Assert
    expect(await screen.findByText('Senha redefinida com sucesso!')).toBeDefined();
    expect(campo.value).toBe('');
  });

  it('deve mostrar o erro da API quando a redefinição da senha falha', async () => {
    // Arrange
    const { redefinir } = abrir();
    redefinir.mockRejectedValueOnce(new ApiError({ status: 500, message: 'Falha ao redefinir' }));
    const esperada = 'Erro interno. Tente novamente mais tarde.';
    await userEvent.type(screen.getByLabelText('Nova Senha'), 'a'.repeat(TAMANHO_MINIMO_DA_SENHA));

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar Senha' }));

    // Assert
    expect(await screen.findByText(esperada)).toBeDefined();
  });

  it('deve alterar o perfil e confirmar quando outro perfil é escolhido', async () => {
    // Arrange
    const { alterarPerfil } = abrir();
    await userEvent.selectOptions(screen.getByLabelText('Perfil'), 'GESTOR');

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Alterar Perfil' }));

    // Assert
    expect(alterarPerfil).toHaveBeenCalledExactlyOnceWith({ id: '1', perfil: 'GESTOR' });
    expect(await screen.findByText('Perfil de usuário atualizado com sucesso!')).toBeDefined();
  });

  it('deve mostrar o erro da API quando alterar o perfil falha', async () => {
    // Arrange
    const { alterarPerfil } = abrir();
    alterarPerfil.mockRejectedValueOnce(new ApiError({ status: 403, message: 'Sem permissão' }));
    await userEvent.selectOptions(screen.getByLabelText('Perfil'), 'GESTOR');

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Alterar Perfil' }));

    // Assert
    expect(await screen.findByText('Sem permissão')).toBeDefined();
  });

  it('deve refazer a consulta do usuário quando Tentar novamente é acionado', async () => {
    // Arrange
    const refetch = vi.fn();
    vi.mocked(useUsuario).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('fail'),
      refetch,
    } as unknown as ReturnType<typeof useUsuario>);
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/usuarios/1'] });
    render(
      <Routes>
        <Route path="/usuarios/:id" element={<EditarUsuarioPage />} />
      </Routes>,
      { wrapper: AppWrapper },
    );

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    // Assert
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('deve não chamar a API quando a rota não traz o identificador do usuário', async () => {
    // Arrange
    const { editar } = abrir();
    cleanup();
    vi.mocked(useUsuario).mockReturnValue({
      data: { id: '1', nome: 'João', email: 'j@j.com', perfil: 'OPERADOR', ativo: true },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useUsuario>);
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/usuarios'] });
    render(<EditarUsuarioPage />, { wrapper: AppWrapper });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'salvar-dados' }));

    // Assert
    expect(editar).not.toHaveBeenCalled();
  });

  it('deve não redefinir a senha quando o campo está vazio', async () => {
    // Arrange
    const { redefinir } = abrir();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar Senha' }));

    // Assert
    expect(redefinir).not.toHaveBeenCalled();
  });

  it('deve não chamar a API da senha nem do perfil quando a rota não traz o identificador', async () => {
    // Arrange
    const { redefinir, alterarPerfil } = abrir();
    cleanup();
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/usuarios'] });
    render(<EditarUsuarioPage />, { wrapper: AppWrapper });
    await userEvent.type(screen.getByLabelText('Nova Senha'), 'a'.repeat(TAMANHO_MINIMO_DA_SENHA));
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar Senha' }));
    await userEvent.selectOptions(screen.getByLabelText('Perfil'), 'GESTOR');

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Alterar Perfil' }));

    // Assert
    expect(redefinir).not.toHaveBeenCalled();
    expect(alterarPerfil).not.toHaveBeenCalled();
  });

  it('deve impedir a troca do próprio perfil e explicar o motivo quando o usuário é quem está logado', () => {
    // Arrange
    vi.mocked(usePerfil).mockReturnValue({
      data: { id: '1', nome: 'João', email: 'j@j.com', perfil: 'ADMINISTRADOR' },
    } as unknown as ReturnType<typeof usePerfil>);
    abrir();

    // Assert
    expect((screen.getByLabelText('Perfil') as HTMLSelectElement).disabled).toBe(true);
    expect(screen.getByText(/Você não pode alterar seu próprio nível/)).toBeDefined();
  });

  it('deve mostrar o andamento nos botões quando perfil e senha estão sendo salvos', () => {
    // Arrange
    vi.mocked(useAlterarPerfilUsuario).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof useAlterarPerfilUsuario>);
    vi.mocked(useRedefinirSenhaUsuario).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof useRedefinirSenhaUsuario>);
    vi.mocked(useUsuario).mockReturnValue({
      data: { id: '1', nome: 'João', email: 'j@j.com', perfil: 'OPERADOR', ativo: true },
      isLoading: false,
      error: null,
    } as ReturnType<typeof useUsuario>);
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/usuarios/1'] });
    render(<EditarUsuarioPage />, { wrapper: AppWrapper });

    // Assert
    expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Redefinindo...' })).toBeDefined();
  });
});
