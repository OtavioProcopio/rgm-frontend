/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AuthUser } from '@/features/auth/types/authTypes';
import { createAppWrapper } from '@/test-utils/appWrapper';
import { criarSolicitacao } from '@/test-utils/solicitacaoFixture';

import type { Solicitacao } from '../types/solicitacaoTypes';
import { SolicitacaoAcoes } from './SolicitacaoAcoes';

vi.mock('@/features/auth/hooks/usePerfil', () => ({
  usePerfil: vi.fn().mockReturnValue({ data: { id: 'eu' } }),
}));
vi.mock('@/features/admin/usuarios/hooks/useResponsaveisDisponiveis', () => ({
  useResponsaveisDisponiveis: () => ({ responsaveis: [], isLoading: false }),
}));

const gestor: AuthUser = { nome: 'Ge', perfil: 'GESTOR' };
const operador: AuthUser = { nome: 'Op', perfil: 'OPERADOR' };

function montar(solicitacao: Solicitacao, user: AuthUser) {
  const { AppWrapper } = createAppWrapper({ user });
  return render(<SolicitacaoAcoes solicitacao={solicitacao} />, { wrapper: AppWrapper });
}

function rotulosDosBotoes() {
  return screen.getAllByRole('button').map((botao) => botao.textContent);
}

afterEach(cleanup);

describe('SolicitacaoAcoes', () => {
  it('deve mostrar só Devolver e Encerrar quando a API informa as ações DEVOLVER e ENCERRAR', () => {
    // Arrange
    const informada = criarSolicitacao({ status: 'A_FAZER', acoesPermitidas: ['DEVOLVER', 'ENCERRAR'] });

    // Act
    montar(informada, gestor);

    // Assert
    expect(rotulosDosBotoes()).toEqual(['Devolver', 'Encerrar']);
  });

  it('deve mostrar Triar quando a API não informa as ações, o usuário é gestor e o status é A Fazer', () => {
    // Arrange
    const naoInformada = criarSolicitacao({ status: 'A_FAZER' });

    // Act
    montar(naoInformada, gestor);

    // Assert
    expect(screen.getByRole('button', { name: 'Triar' })).toBeDefined();
  });

  it('deve mostrar Cancelar quando o operador abriu a solicitação e ela está em A Fazer sem responsável', () => {
    // Arrange
    const propria = criarSolicitacao({ status: 'A_FAZER', abertaPorUsuarioId: 'eu' });

    // Act
    montar(propria, operador);

    // Assert
    expect(rotulosDosBotoes()).toEqual(['Cancelar']);
  });

  it('deve não mostrar a seção de ações quando nenhuma ação é permitida', () => {
    // Arrange
    const alheia = criarSolicitacao({ status: 'EM_ANDAMENTO', responsavelIds: ['outro'] });

    // Act
    const { container } = montar(alheia, operador);

    // Assert
    expect(container.textContent).toBe('');
  });

  it('deve abrir o formulário de devolução com motivo e prioridade quando o gestor clica em Devolver', async () => {
    // Arrange
    montar(criarSolicitacao({ status: 'EM_VALIDACAO' }), gestor);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Devolver' }));

    // Assert
    expect(screen.getByLabelText('Motivo da devolução *')).toBeDefined();
    expect(screen.getByLabelText('Nova prioridade (opcional)')).toBeDefined();
  });

  it('deve fechar o formulário quando a ação aberta é cancelada', async () => {
    // Arrange
    montar(criarSolicitacao({ status: 'EM_VALIDACAO' }), gestor);
    await userEvent.click(screen.getByRole('button', { name: 'Devolver' }));
    const formulario = screen.getByLabelText('Motivo da devolução *').closest('form') as HTMLElement;

    // Act
    await userEvent.click(within(formulario).getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.queryByLabelText('Motivo da devolução *')).toBeNull();
  });
});
