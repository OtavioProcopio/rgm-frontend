/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
const NOME_DO_LOGO = 'RGM Auto Parts';
const PLACA_DO_LOGO = 'bg-logo-plate';
const CONTROLE_DE_TEMA = /^Tema: /;

const classes = (elemento: Element) => elemento.className.split(' ');

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
    const cabecalho = screen.getByRole('banner');
    expect(cabecalho.textContent).toContain('Sem atualização automática');
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

  it('deve mostrar o controle de tema quando o cabeçalho é montado', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: USUARIO });

    // Act
    render(<AppLayout />, { wrapper: AppWrapper });

    // Assert
    const controles = within(screen.getByRole('banner')).getAllByRole('button', {
      name: CONTROLE_DE_TEMA,
    });
    expect(controles).toHaveLength(1);
  });

  it('deve mostrar o rótulo do perfil no cabeçalho quando há usuário autenticado', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: USUARIO });

    // Act
    render(<AppLayout />, { wrapper: AppWrapper });

    // Assert
    const atalhoDoPerfil = within(screen.getByRole('banner')).getByRole('link', { name: /Ge/ });
    expect(atalhoDoPerfil.textContent).toBe('GeGestor');
  });

  it('deve não mostrar rótulo de perfil no cabeçalho quando não há usuário autenticado', () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: null });

    // Act
    render(<AppLayout />, { wrapper: AppWrapper });

    // Assert
    const atalhoDoPerfil = screen
      .getAllByRole('link')
      .find((atalho) => atalho.getAttribute('href') === '/app/perfil');
    expect(atalhoDoPerfil?.textContent).toBe('');
  });
});
