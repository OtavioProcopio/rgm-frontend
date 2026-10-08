/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { useRedefinirSenhaUsuario } from '@/features/admin/usuarios/hooks/useRedefinirSenhaUsuario';
import { useUsuario } from '@/features/admin/usuarios/hooks/useUsuario';
import { EditarUsuarioPage } from '@/features/admin/usuarios/pages/EditarUsuarioPage';
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
