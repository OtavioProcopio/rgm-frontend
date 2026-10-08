/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MemoryRouter, Route, Routes, useLocation } from 'react-router';

import { createAppWrapper } from '@tests/support/appWrapper';
import { createQueryWrapper } from '@tests/support/queryWrapper';

import { AuthProvider } from '@/app/providers/AuthProvider';
import { perfilApi } from '@/features/auth/api/perfilApi';
import { PerfilPage } from '@/features/auth/pages/PerfilPage';
import type { PerfilUsuario } from '@/features/auth/types/authTypes';
import { ApiError } from '@/shared/api/apiError';
import { authToken } from '@/shared/api/authToken';
import { rotuloDoPerfil } from '@/shared/lib/rotulos';

vi.mock('@/features/auth/hooks/usePerfil', () => ({
  usePerfil: vi.fn().mockReturnValue({ data: undefined, isLoading: true, isError: false }),
}));
vi.mock('@/features/auth/hooks/useAlterarSenha', () => ({
  useAlterarSenha: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/auth/api/perfilApi', () => ({
  perfilApi: { obterPerfil: vi.fn(), alterarSenha: vi.fn() },
}));
vi.mock('@/features/solicitacoes/hooks/useMetricas', () => ({
  useMetricas: vi.fn().mockReturnValue({ data: undefined }),
}));

afterEach(cleanup);

describe('PerfilPage', () => {
  it('shows spinner while loading', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<PerfilPage />, { wrapper: AppWrapper });
    expect(container.querySelector('.animate-spin')).toBeDefined();
  });

  it('shows profile info when loaded', async () => {
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    vi.mocked(usePerfil).mockReturnValue({
      data: { nome: 'Otávio', email: 'o@o.com', perfil: 'ADMINISTRADOR' },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePerfil>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<PerfilPage />, { wrapper: AppWrapper });
    expect(within(container).getByText('Otávio')).toBeDefined();
  });

  it('shows error state', async () => {
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    vi.mocked(usePerfil).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof usePerfil>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<PerfilPage />, { wrapper: AppWrapper });
    expect(within(container).getByText(/não foi possível/i)).toBeDefined();
  });
});

describe('PerfilPage — botões de mostrar senha', () => {
  async function abrirPerfil() {
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    vi.mocked(usePerfil).mockReturnValue({
      data: { nome: 'Otávio', email: 'o@o.com', perfil: 'ADMINISTRADOR' },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePerfil>);
    const { AppWrapper } = createAppWrapper();
    render(<PerfilPage />, { wrapper: AppWrapper });
  }

  it.each([
    ['Mostrar a senha atual', 'Senha Atual'],
    ['Mostrar a nova senha', 'Nova Senha'],
    ['Mostrar a confirmação da nova senha', 'Confirmar Nova Senha'],
  ])('deve ter o botão %s com área de toque de 44 px', async (nome) => {
    // Act
    await abrirPerfil();

    // Assert
    const botao = screen.getByRole('button', { name: nome });
    expect(botao.className).toContain('h-11');
    expect(botao.className).toContain('w-11');
  });

  it.each([
    ['Mostrar a senha atual', 'Ocultar a senha atual', 'Senha Atual'],
    ['Mostrar a nova senha', 'Ocultar a nova senha', 'Nova Senha'],
    [
      'Mostrar a confirmação da nova senha',
      'Ocultar a confirmação da nova senha',
      'Confirmar Nova Senha',
    ],
  ])(
    'deve revelar o campo e trocar o nome para ocultar quando %s é acionado',
    async (mostrar, ocultar, campo) => {
      // Arrange
      await abrirPerfil();

      // Act
      await userEvent.click(screen.getByRole('button', { name: mostrar }));

      // Assert
      expect(screen.getByRole('button', { name: ocultar }).getAttribute('aria-pressed')).toBe(
        'true',
      );
      expect((screen.getByLabelText(campo) as HTMLInputElement).type).toBe('text');
    },
  );

  it('deve deixar todo botão só de ícone com nome acessível', async () => {
    // Act
    await abrirPerfil();

    // Assert
    const semTexto = screen.getAllByRole('button').filter((botao) => !botao.textContent?.trim());
    expect(semTexto.length).toBeGreaterThan(0);
    expect(semTexto.every((botao) => botao.getAttribute('aria-label'))).toBe(true);
  });
});

describe('PerfilPage — molduras de cartão', () => {
  const USUARIO = { nome: 'Otávio', email: 'o@o.com', perfil: 'ADMINISTRADOR' };
  const MOLDURA_DE_CARTAO = ['border-line', 'bg-surface'];

  async function abrirPerfil() {
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    vi.mocked(usePerfil).mockReturnValue({
      data: USUARIO,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePerfil>);
    const { AppWrapper } = createAppWrapper();
    render(<PerfilPage />, { wrapper: AppWrapper });
  }

  it('deve usar a moldura de cartão na seção de dados do perfil quando o perfil é carregado', async () => {
    // Arrange
    await abrirPerfil();

    // Act
    const secao = screen.getByRole('heading', { name: USUARIO.nome }).closest('.rounded-xl');

    // Assert
    expect(secao?.className.split(' ')).toEqual(expect.arrayContaining(MOLDURA_DE_CARTAO));
  });

  it('deve usar a moldura de cartão na seção de troca de senha quando o perfil é carregado', async () => {
    // Arrange
    await abrirPerfil();

    // Act
    const secao = screen.getByRole('heading', { name: 'Alterar Senha' }).closest('.rounded-xl');

    // Assert
    expect(secao?.className.split(' ')).toEqual(expect.arrayContaining(MOLDURA_DE_CARTAO));
  });
});

describe('PerfilPage — selo de perfil', () => {
  const CLASSES_DO_SELO: Record<PerfilUsuario, string[]> = {
    ADMINISTRADOR: ['bg-accent', 'text-on-accent'],
    GESTOR: ['bg-info-soft', 'text-info-fg'],
    OPERADOR: ['bg-surface-muted', 'text-fg-muted'],
    EXTERNO: ['bg-success-soft', 'text-success-fg'],
  };
  const PERFIS = Object.keys(rotuloDoPerfil) as PerfilUsuario[];

  async function abrirPerfilDe(perfil: PerfilUsuario) {
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    vi.mocked(usePerfil).mockReturnValue({
      data: { nome: 'Otávio', email: 'o@o.com', perfil },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePerfil>);
    const { AppWrapper } = createAppWrapper();
    render(<PerfilPage />, { wrapper: AppWrapper });
  }

  it.each(PERFIS)(
    'deve mostrar o rótulo do perfil no selo quando o perfil é %s',
    async (perfil) => {
      // Act
      await abrirPerfilDe(perfil);

      // Assert
      expect(screen.getAllByText(rotuloDoPerfil[perfil])).toHaveLength(1);
    },
  );

  it.each(PERFIS)('deve não mostrar o valor cru da API quando o perfil é %s', async (perfil) => {
    // Act
    await abrirPerfilDe(perfil);

    // Assert
    expect(screen.queryByText(perfil)).toBeNull();
  });

  it.each(PERFIS)(
    'deve pintar o selo com a variação do perfil quando o perfil é %s',
    async (perfil) => {
      // Act
      await abrirPerfilDe(perfil);

      // Assert
      const selo = screen.getByText(rotuloDoPerfil[perfil]);
      expect(selo.className.split(' ')).toEqual(expect.arrayContaining(CLASSES_DO_SELO[perfil]));
    },
  );
});

describe('PerfilPage — troca de senha', () => {
  const USUARIO = { id: 'u-1', nome: 'Otávio', email: 'o@o.com', perfil: 'OPERADOR', ativo: true };

  function Local() {
    return <p>local: {useLocation().pathname}</p>;
  }

  /**
   * Página com o hook de troca e o provedor de autenticação reais; só a API é simulada.
   * A rota de entrada existe para o teste enxergar uma eventual saída da tela de perfil.
   */
  async function trocarSenha(respostaDaApi: () => Promise<unknown>) {
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    const { useAlterarSenha } = await import('@/features/auth/hooks/useAlterarSenha');
    const real = await vi.importActual<typeof import('@/features/auth/hooks/useAlterarSenha')>(
      '@/features/auth/hooks/useAlterarSenha',
    );
    vi.mocked(usePerfil).mockReturnValue({
      data: USUARIO,
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof usePerfil>);
    vi.mocked(useAlterarSenha).mockImplementation(real.useAlterarSenha);
    vi.mocked(perfilApi.alterarSenha).mockReset();
    vi.mocked(perfilApi.alterarSenha).mockImplementation(
      respostaDaApi as typeof perfilApi.alterarSenha,
    );
    localStorage.clear();
    authToken.setTokens('acesso-antigo', 'renovacao-antiga');
    authToken.setUser({ nome: 'Otávio', perfil: 'OPERADOR' });
    const { QueryWrapper } = createQueryWrapper();

    render(
      <QueryWrapper>
        <AuthProvider>
          <MemoryRouter initialEntries={['/app/perfil']}>
            <Local />
            <Routes>
              <Route path="/app/perfil" element={<PerfilPage />} />
              <Route path="/login" element={<p>tela de entrada</p>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryWrapper>,
    );

    await userEvent.type(screen.getByLabelText('Senha Atual'), 'senha-antiga');
    await userEvent.type(screen.getByLabelText('Nova Senha'), 'senha-nova-1');
    await userEvent.type(screen.getByLabelText('Confirmar Nova Senha'), 'senha-nova-1');
    await userEvent.click(screen.getByRole('button', { name: 'Atualizar Senha' }));
  }

  const comCredenciais = () =>
    Promise.resolve({ ...USUARIO, token: 'acesso-novo', refreshToken: 'renovacao-nova' });
  const semCredenciais = () => Promise.resolve(USUARIO);
  const recusada = () =>
    Promise.reject(new ApiError({ status: 400, message: 'Senha atual incorreta' }));

  it('deve mostrar o sucesso quando a troca de senha dá certo', async () => {
    // Act
    await trocarSenha(comCredenciais);

    // Assert
    expect(await screen.findByText('Senha alterada com sucesso!')).toBeDefined();
  });

  it('deve continuar na rota do perfil quando a troca de senha dá certo', async () => {
    // Act
    await trocarSenha(comCredenciais);

    // Assert
    await screen.findByText('Senha alterada com sucesso!');
    expect(screen.getByText('local: /app/perfil')).toBeDefined();
  });

  it('deve passar a usar a credencial de acesso devolvida quando a troca de senha dá certo', async () => {
    // Act
    await trocarSenha(comCredenciais);

    // Assert
    await screen.findByText('Senha alterada com sucesso!');
    expect(authToken.getAccessToken()).toBe('acesso-novo');
  });

  it('deve passar a usar a credencial de renovação devolvida quando a troca de senha dá certo', async () => {
    // Act
    await trocarSenha(comCredenciais);

    // Assert
    await screen.findByText('Senha alterada com sucesso!');
    expect(authToken.getRefreshToken()).toBe('renovacao-nova');
  });

  it('deve manter a credencial de acesso em uso quando a API responde à troca sem credenciais novas', async () => {
    // Act
    await trocarSenha(semCredenciais);

    // Assert
    await screen.findByText('Senha alterada com sucesso!');
    expect(authToken.getAccessToken()).toBe('acesso-antigo');
  });

  it('deve mostrar o erro quando a API recusa a troca', async () => {
    // Act
    await trocarSenha(recusada);

    // Assert
    expect(await screen.findByText('Senha atual incorreta.')).toBeDefined();
  });

  it('deve pintar o aviso com o papel de sucesso quando a troca de senha dá certo', async () => {
    // Arrange
    const papelDeSucesso = ['border-success', 'bg-success-soft', 'text-success-fg'];

    // Act
    await trocarSenha(comCredenciais);

    // Assert
    const aviso = (await screen.findByText('Senha alterada com sucesso!')).closest('div');
    expect(aviso?.className.split(' ')).toEqual(expect.arrayContaining(papelDeSucesso));
  });

  it('deve pintar o aviso com o papel de perigo quando a API recusa a troca', async () => {
    // Arrange
    const papelDePerigo = ['border-danger', 'bg-danger-soft', 'text-danger-fg'];

    // Act
    await trocarSenha(recusada);

    // Assert
    const aviso = (await screen.findByText('Senha atual incorreta.')).closest('div');
    expect(aviso?.className.split(' ')).toEqual(expect.arrayContaining(papelDePerigo));
  });

  it('deve não mostrar o sucesso quando a API recusa a troca', async () => {
    // Act
    await trocarSenha(recusada);

    // Assert
    await screen.findByText('Senha atual incorreta.');
    expect(screen.queryByText('Senha alterada com sucesso!')).toBeNull();
  });

  it('deve manter a credencial de acesso em uso quando a API recusa a troca', async () => {
    // Act
    await trocarSenha(recusada);

    // Assert
    await screen.findByText('Senha atual incorreta.');
    expect(authToken.getAccessToken()).toBe('acesso-antigo');
  });

  it('deve enviar à API a senha atual e a nova, uma vez, quando o formulário é confirmado', async () => {
    // Act
    await trocarSenha(comCredenciais);

    // Assert
    await screen.findByText('Senha alterada com sucesso!');
    expect(perfilApi.alterarSenha).toHaveBeenCalledTimes(1);
    expect(vi.mocked(perfilApi.alterarSenha).mock.calls[0][0]).toEqual({
      senhaAtual: 'senha-antiga',
      novaSenha: 'senha-nova-1',
    });
  });
});
