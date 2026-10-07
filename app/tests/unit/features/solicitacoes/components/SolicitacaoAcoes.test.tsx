/**
 * @vitest-environment jsdom
 */
import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthUser } from '@/features/auth/types/authTypes';
import { createAppWrapper } from '@tests/support/appWrapper';
import { MockEventSource } from '@tests/support/mockEventSource';
import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import { useSolicitacaoEvents } from '@/features/solicitacoes/hooks/useSolicitacaoEvents';
import type { Solicitacao } from '@/features/solicitacoes/types/solicitacaoTypes';
import { SolicitacaoAcoes } from '@/features/solicitacoes/components/SolicitacaoAcoes';

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

  it('deve abrir a ação em diálogo modal com o nome da ação e da solicitação quando o botão é acionado', async () => {
    // Arrange
    const solicitacao = criarSolicitacao({ status: 'EM_VALIDACAO' });
    montar(solicitacao, gestor);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Devolver' }));

    // Assert
    const dialogo = screen.getByRole('dialog', { name: `Devolver: ${solicitacao.titulo}` });
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
  });

  it('deve fechar o diálogo e devolver o foco ao botão da ação quando Esc é apertado', async () => {
    // Arrange
    montar(criarSolicitacao({ status: 'EM_VALIDACAO' }), gestor);
    await userEvent.click(screen.getByRole('button', { name: 'Devolver' }));

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Devolver' }));
  });

  it('deve manter a ação aberta quando a solicitação muda de status e a ação deixa de ser permitida', async () => {
    // Arrange
    const { AppWrapper } = createAppWrapper({ user: gestor });
    const { rerender } = render(<SolicitacaoAcoes solicitacao={criarSolicitacao({ status: 'EM_VALIDACAO' })} />, {
      wrapper: AppWrapper,
    });
    await userEvent.click(screen.getByRole('button', { name: 'Devolver' }));

    // Act
    rerender(<SolicitacaoAcoes solicitacao={criarSolicitacao({ status: 'CONCLUIDA' })} />);

    // Assert
    expect(screen.getByLabelText('Motivo da devolução *')).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Devolver' })).toBeNull();
  });
});

describe('SolicitacaoAcoes — tempo real', () => {
  function TelaComEventos({ solicitacao }: { solicitacao: Solicitacao }) {
    useSolicitacaoEvents();
    return <SolicitacaoAcoes solicitacao={solicitacao} />;
  }

  /** Abre o formulário de triagem de `s1` como gestor e devolve a conexão de eventos. */
  async function abrirTriagemComEventos() {
    localStorage.setItem('rgm.accessToken', 'token-abc');
    const { AppWrapper } = createAppWrapper({ user: gestor });
    render(<TelaComEventos solicitacao={criarSolicitacao({ id: 's1', status: 'A_FAZER' })} />, {
      wrapper: AppWrapper,
    });
    await userEvent.click(screen.getByRole('button', { name: 'Triar' }));
    await userEvent.selectOptions(screen.getByLabelText('Prioridade'), 'ALTA');
    return MockEventSource.instances[0];
  }

  beforeEach(() => {
    MockEventSource.reset();
    vi.stubGlobal('EventSource', MockEventSource);
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('deve avisar no formulário e manter o que foi preenchido quando outro usuário altera a solicitação', async () => {
    // Arrange
    const conexao = await abrirTriagemComEventos();

    // Act
    act(() => conexao.emit('solicitacao', { tipo: 'editada', solicitacao: criarSolicitacao({ id: 's1' }) }));

    // Assert
    expect((await screen.findByRole('status')).textContent).toContain('Atualizada por outro usuário');
    expect((screen.getByLabelText('Prioridade') as HTMLSelectElement).value).toBe('ALTA');
  });

  it('deve não avisar no formulário quando outro usuário altera uma solicitação diferente', async () => {
    // Arrange
    const conexao = await abrirTriagemComEventos();

    // Act
    act(() => conexao.emit('solicitacao', { tipo: 'editada', solicitacao: criarSolicitacao({ id: 'outra' }) }));

    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));

    // Assert
    expect(screen.queryByText(/Atualizada por outro usuário/)).toBeNull();
    expect((screen.getByLabelText('Prioridade') as HTMLSelectElement).value).toBe('ALTA');
  });

  it('deve não avisar no formulário quando outro usuário só comenta na solicitação', async () => {
    // Arrange
    const conexao = await abrirTriagemComEventos();

    // Act
    act(() => conexao.emit('solicitacao_atividade', { tipo: 'comentada', solicitacaoId: 's1' }));

    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));

    // Assert
    expect(screen.queryByText(/Atualizada por outro usuário/)).toBeNull();
  });
});
