/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSemAtualizacao } from '@/features/solicitacoes/hooks/useSemAtualizacao';
import { useSolicitacaoEvents } from '@/features/solicitacoes/hooks/useSolicitacaoEvents';
import { createAppWrapper } from '@tests/support/appWrapper';

import { AppLayout } from '@/app/layouts/AppLayout';

vi.mock('@/features/solicitacoes/hooks/useSolicitacaoEvents', () => ({
  useSolicitacaoEvents: vi.fn(),
}));
vi.mock('@/features/solicitacoes/hooks/useSemAtualizacao', () => ({
  useSemAtualizacao: vi.fn().mockReturnValue(false),
}));

const USUARIO = { nome: 'Ge', perfil: 'GESTOR' } as const;
const ADMIN = { nome: 'Ad', perfil: 'ADMINISTRADOR' } as const;
const NOME_DO_LOGO = 'RGM Auto Parts';
const PLACA_DO_LOGO = 'bg-logo-plate';
const CONTROLE_DE_TEMA = /^Tema: /;

const classes = (elemento: Element) => elemento.className.split(' ');

const cabecalho = () => screen.getByRole('banner');
const barraDeAbas = () =>
  screen.getAllByRole('navigation').find((nav) => classes(nav).includes('bottom-0'))!;

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('AppLayout', () => {
  it('deve abrir a conexão de tempo real uma vez quando a área logada é montada', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Ge', perfil: 'GESTOR' } });

    // Act
    render(<AppLayout />, { wrapper: AppWrapper });

    // Assert
    expect(useSolicitacaoEvents).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar no cabeçalho o aviso quando a aplicação está sem atualização automática', () => {
    // Arrange
    vi.mocked(useSemAtualizacao).mockReturnValue(true);
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Ge', perfil: 'GESTOR' } });

    // Act
    render(<AppLayout />, { wrapper: AppWrapper });

    // Assert
    expect(cabecalho().textContent).toContain('Sem atualização automática');
  });

  it('deve mostrar o logo sobre a placa do papel logo-plate quando a barra lateral é montada', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: USUARIO });

    // Act
    render(<AppLayout />, { wrapper: AppWrapper });

    // Assert
    const logo = within(screen.getByRole('complementary')).getByRole('img', { name: NOME_DO_LOGO });
    expect(classes(logo.parentElement!)).toContain(PLACA_DO_LOGO);
  });

  it('deve alinhar o logo da barra lateral pela base para não abrir folga abaixo dele', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: USUARIO });

    // Act
    render(<AppLayout />, { wrapper: AppWrapper });

    // Assert
    const logo = within(screen.getByRole('complementary')).getByRole('img', { name: NOME_DO_LOGO });
    expect(classes(logo.parentElement!)).toContain('align-bottom');
  });

  it('deve não mostrar nome, tema e Sair soltos no cabeçalho quando o layout é montado', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: USUARIO });

    // Act
    render(<AppLayout />, { wrapper: AppWrapper });

    // Assert
    const dentro = within(cabecalho());
    expect(dentro.queryByRole('button', { name: CONTROLE_DE_TEMA })).toBeNull();
    expect(dentro.queryByRole('button', { name: 'Sair' })).toBeNull();
    expect(dentro.queryByRole('link', { name: /Ge/ })).toBeNull();
    expect(dentro.getAllByRole('button', { name: 'Menu do usuário: Ge' })).toHaveLength(1);
  });

  it('deve mostrar Sair só dentro do menu do usuário quando ele é aberto', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: USUARIO });
    render(<AppLayout />, { wrapper: AppWrapper });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Menu do usuário: Ge' }));

    // Assert
    const menu = screen.getByRole('menu', { name: 'Menu do usuário' });
    expect(within(menu).getAllByRole('menuitem', { name: 'Sair' })).toHaveLength(1);
    expect(screen.getAllByRole('menuitem', { name: 'Sair' })).toHaveLength(1);
  });

  it('deve mostrar o perfil por extenso no menu do usuário quando há usuário autenticado', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: USUARIO });
    render(<AppLayout />, { wrapper: AppWrapper });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Menu do usuário: Ge' }));

    // Assert
    const menu = screen.getByRole('menu', { name: 'Menu do usuário' });
    expect(menu.textContent).toContain('Gestor');
    expect(menu.textContent).not.toContain('GESTOR');
  });

  it('deve montar o menu do usuário sem nome quando não há usuário autenticado', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: null });

    // Act
    render(<AppLayout />, { wrapper: AppWrapper });

    // Assert
    expect(within(cabecalho()).getAllByRole('button', { name: /Menu do usuário/ })).toHaveLength(1);
  });

  it('deve mostrar a identificação do portal uma vez quando o gestor abre o layout', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: USUARIO });

    // Act
    render(<AppLayout />, { wrapper: AppWrapper });

    // Assert
    expect(screen.getAllByText('Portal de gestão')).toHaveLength(1);
    expect(screen.queryByText('Solicitações de manutenção')).toBeNull();
    expect(screen.queryByText('RGM Auto Parts')).toBeNull();
  });

  it('deve mostrar a identificação do portal uma vez quando o administrador abre o layout', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: ADMIN });

    // Act
    render(<AppLayout />, { wrapper: AppWrapper });

    // Assert
    expect(screen.getAllByText('Painel administrativo')).toHaveLength(1);
    expect(screen.queryByText('Administração RGM')).toBeNull();
    expect(screen.queryByText('Usuários, máquinas e modelos')).toBeNull();
  });

  it('deve não ter faixa de navegação que rola quando o layout é montado', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: ADMIN });

    // Act
    render(<AppLayout />, { wrapper: AppWrapper });

    // Assert
    const roladas = screen
      .getAllByRole('navigation')
      .filter((nav) => classes(nav).includes('overflow-x-auto'));
    expect(roladas).toEqual([]);
    expect(within(cabecalho()).queryAllByRole('navigation')).toEqual([]);
  });

  it('deve mostrar a barra de abas fixa na base com os cinco destinos do administrador', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: ADMIN });

    // Act
    render(<AppLayout />, { wrapper: AppWrapper });

    // Assert
    const abas = barraDeAbas();
    expect(classes(abas)).toContain('fixed');
    expect(classes(abas)).toContain('lg:hidden');
    expect(within(abas).getAllByRole('link')).toHaveLength(5);
  });

  it('deve mostrar só os destinos do gestor na barra de abas quando o perfil é gestor', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: USUARIO });

    // Act
    render(<AppLayout />, { wrapper: AppWrapper });

    // Assert
    expect(within(barraDeAbas()).getAllByRole('link')).toHaveLength(3);
    expect(within(barraDeAbas()).queryByRole('link', { name: 'Usuários' })).toBeNull();
  });

  it('deve mostrar o conteúdo sem cartão com borda e sombra quando o layout é montado', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: USUARIO });

    // Act
    render(<AppLayout />, { wrapper: AppWrapper });

    // Assert
    const marcas = classes(screen.getByRole('main')).filter((classe) =>
      /^(border|shadow|rounded|bg-surface)/.test(classe),
    );
    expect(marcas).toEqual([]);
  });

  it('deve reservar no fim do conteúdo o espaço da barra de abas quando a tela é estreita', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: USUARIO });

    // Act
    render(<AppLayout />, { wrapper: AppWrapper });

    // Assert
    const area = screen.getByRole('main').parentElement!;
    expect(area.className).toContain('env(safe-area-inset-bottom)');
    expect(classes(area)).toContain('lg:pb-5');
  });

  it('deve recolher a coluna da barra lateral quando o botão de recolher é acionado', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: USUARIO });
    render(<AppLayout />, { wrapper: AppWrapper });
    const lateral = screen.getByRole('complementary');

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Recolher menu lateral' }));

    // Assert
    expect(classes(lateral)).toContain('lg:w-[72px]');
    expect(classes(lateral)).not.toContain('lg:w-[280px]');
  });
});
