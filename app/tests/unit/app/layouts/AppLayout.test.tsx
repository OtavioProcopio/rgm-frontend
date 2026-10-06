/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
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
});
