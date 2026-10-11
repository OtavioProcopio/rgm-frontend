/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { MenuDoUsuario } from '@/app/layouts/MenuDoUsuario';

const USUARIO = { nome: 'Ana Souza', perfil: 'ADMINISTRADOR' } as const;
const NOME_DO_BOTAO = 'Menu do usuário: Ana Souza';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

async function abrirMenu(user: Parameters<typeof createAppWrapper>[0]) {
  const { AppWrapper } = createAppWrapper(user);
  const sessao = userEvent.setup();
  render(<MenuDoUsuario />, { wrapper: AppWrapper });
  const botao = screen.getByRole('button', { name: /^Menu do usuário/ });
  await sessao.click(botao);
  return { sessao, botao };
}

describe('MenuDoUsuario', () => {
  it('deve mostrar o nome e o perfil por extenso quando o menu é aberto', async () => {
    // Arrange
    // Act
    await abrirMenu({ user: USUARIO });

    // Assert
    const menu = screen.getByRole('menu', { name: 'Menu do usuário' });
    expect(within(menu).getByText('Ana Souza')).toBeTruthy();
    expect(within(menu).getByText('Administrador')).toBeTruthy();
    expect(within(menu).queryByText('ADMINISTRADOR')).toBeNull();
  });

  it('deve nomear o botão com o nome do usuário quando há usuário autenticado', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: USUARIO });

    // Act
    render(<MenuDoUsuario />, { wrapper: AppWrapper });

    // Assert
    expect(screen.getByRole('button', { name: NOME_DO_BOTAO })).toBeTruthy();
  });

  it('deve mostrar o perfil sem caixa alta quando o menu é aberto', async () => {
    // Arrange
    // Act
    await abrirMenu({ user: USUARIO });

    // Assert
    const perfil = screen.getByText('Administrador');
    expect(perfil.className).toContain('text-fg-muted');
    expect(perfil.className).not.toContain('uppercase');
  });

  it('deve apontar Meu perfil para /app/perfil quando o menu é aberto', async () => {
    // Arrange
    // Act
    await abrirMenu({ user: USUARIO });

    // Assert
    const link = screen.getByRole('menuitem', { name: 'Meu perfil' });
    expect(link.getAttribute('href')).toBe('/app/perfil');
  });

  it('deve marcar só o tema ativo quando o menu é aberto', async () => {
    // Arrange
    localStorage.setItem('rgm.theme', 'dark');
    localStorage.setItem('rgm.theme.defaulted', '3');

    // Act
    await abrirMenu({ user: USUARIO });

    // Assert
    const opcoes = screen.getAllByRole('menuitemradio');
    expect(opcoes.map((o) => o.textContent)).toEqual(['Sistema', 'Claro', 'Escuro']);
    expect(opcoes.map((o) => o.getAttribute('aria-checked'))).toEqual(['false', 'false', 'true']);
  });

  it('deve aplicar a preferência e fechar o menu quando um tema é escolhido', async () => {
    // Arrange
    const { sessao } = await abrirMenu({ user: USUARIO });

    // Act
    await sessao.click(screen.getByRole('menuitemradio', { name: 'Claro' }));

    // Assert
    expect(localStorage.getItem('rgm.theme')).toBe('light');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('deve chamar logout uma vez quando Sair é escolhido', async () => {
    // Arrange
    const logout = vi.fn();
    const { sessao } = await abrirMenu({ user: USUARIO, authOverrides: { logout } });

    // Act
    await sessao.click(screen.getByRole('menuitem', { name: 'Sair' }));

    // Assert
    expect(logout).toHaveBeenCalledTimes(1);
    expect(logout).toHaveBeenCalledWith();
  });

  it('deve fechar o menu e devolver o foco ao botão quando Esc é pressionado', async () => {
    // Arrange
    const { sessao, botao } = await abrirMenu({ user: USUARIO });

    // Act
    await sessao.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(botao);
  });

  it('deve mostrar só tema e Sair quando não há usuário', async () => {
    // Arrange
    // Act
    const { botao } = await abrirMenu({ user: null });

    // Assert
    expect(botao.getAttribute('aria-label')).toBe('Menu do usuário');
    expect(screen.queryByRole('menuitem', { name: 'Meu perfil' })).toBeNull();
    expect(screen.getAllByRole('menuitemradio')).toHaveLength(3);
    expect(screen.getByRole('menuitem', { name: 'Sair' })).toBeTruthy();
  });
});
