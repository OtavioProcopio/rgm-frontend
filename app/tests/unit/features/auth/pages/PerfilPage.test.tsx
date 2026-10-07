/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { PerfilPage } from '@/features/auth/pages/PerfilPage';

vi.mock('@/features/auth/hooks/usePerfil', () => ({
  usePerfil: vi.fn().mockReturnValue({ data: undefined, isLoading: true, isError: false }),
}));
vi.mock('@/features/auth/hooks/useAlterarSenha', () => ({
  useAlterarSenha: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
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

describe('PerfilPage — troca de senha', () => {
  async function trocarSenha(alterarSenha: (dados: unknown) => Promise<unknown>) {
    const { usePerfil } = await import('@/features/auth/hooks/usePerfil');
    const { useAlterarSenha } = await import('@/features/auth/hooks/useAlterarSenha');
    vi.mocked(usePerfil).mockReturnValue({
      data: { nome: 'Otávio', email: 'o@o.com', perfil: 'OPERADOR' },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePerfil>);
    vi.mocked(useAlterarSenha).mockReturnValue({
      mutateAsync: alterarSenha,
      isPending: false,
    } as unknown as ReturnType<typeof useAlterarSenha>);
    const { AppWrapper } = createAppWrapper({ initialEntries: ['/app/perfil'] });
    render(<PerfilPage />, { wrapper: AppWrapper });

    await userEvent.type(screen.getByLabelText('Senha Atual'), 'senha-antiga');
    await userEvent.type(screen.getByLabelText('Nova Senha'), 'senha-nova-1');
    await userEvent.type(screen.getByLabelText('Confirmar Nova Senha'), 'senha-nova-1');
    await userEvent.click(screen.getByRole('button', { name: 'Atualizar Senha' }));
  }

  it('deve mostrar o sucesso quando a troca de senha dá certo', async () => {
    // Arrange
    const alterarSenha = vi.fn().mockResolvedValue({ token: 'acesso-novo', refreshToken: 'renovacao-nova' });

    // Act
    await trocarSenha(alterarSenha);

    // Assert
    expect(await screen.findByText('Senha alterada com sucesso!')).toBeDefined();
  });

  it('deve continuar na tela de perfil quando a troca de senha dá certo', async () => {
    // Arrange
    const alterarSenha = vi.fn().mockResolvedValue({ token: 'acesso-novo', refreshToken: 'renovacao-nova' });

    // Act
    await trocarSenha(alterarSenha);

    // Assert
    await screen.findByText('Senha alterada com sucesso!');
    expect(screen.getByRole('button', { name: 'Atualizar Senha' })).toBeDefined();
  });

  it('deve mostrar o sucesso quando a API responde à troca sem credenciais novas', async () => {
    // Arrange
    const alterarSenha = vi.fn().mockResolvedValue({ nome: 'Otávio' });

    // Act
    await trocarSenha(alterarSenha);

    // Assert
    expect(await screen.findByText('Senha alterada com sucesso!')).toBeDefined();
  });

  it('deve mostrar o erro, sem a mensagem de sucesso, quando a API recusa a troca', async () => {
    // Arrange
    const { ApiError } = await import('@/shared/api/apiError');
    const alterarSenha = vi
      .fn()
      .mockRejectedValue(new ApiError({ status: 400, message: 'Senha atual incorreta' }));

    // Act
    await trocarSenha(alterarSenha);

    // Assert
    expect(await screen.findByText('Senha atual incorreta.')).toBeDefined();
    expect(screen.queryByText('Senha alterada com sucesso!')).toBeNull();
  });

  it('deve enviar a senha atual e a nova uma vez quando o formulário é confirmado', async () => {
    // Arrange
    const alterarSenha = vi.fn().mockResolvedValue({});

    // Act
    await trocarSenha(alterarSenha);

    // Assert
    await screen.findByText('Senha alterada com sucesso!');
    expect(alterarSenha).toHaveBeenCalledTimes(1);
    expect(alterarSenha).toHaveBeenCalledWith({
      senhaAtual: 'senha-antiga',
      novaSenha: 'senha-nova-1',
    });
  });
});
