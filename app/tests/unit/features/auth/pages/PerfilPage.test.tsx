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
