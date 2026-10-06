/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usuariosApi } from '@/features/admin/usuarios/api/usuariosApi';
import { createAppWrapper } from '@tests/support/appWrapper';
import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import type { Solicitacao } from '@/features/solicitacoes/types/solicitacaoTypes';
import { KanbanBoard } from '@/features/solicitacoes/components/KanbanBoard';

vi.mock('@/features/solicitacoes/hooks/useKanbanSolicitacoes', () => ({
  useKanbanSolicitacoes: vi.fn().mockReturnValue({ data: [], isLoading: true, error: null }),
}));
vi.mock('@/features/auth/hooks/usePerfil', () => ({
  usePerfil: vi.fn().mockReturnValue({ data: { id: 'eu' } }),
}));
vi.mock('@/features/admin/usuarios/api/usuariosApi', () => ({
  usuariosApi: { listar: vi.fn().mockResolvedValue({ content: [], page: 0, totalPages: 0, totalElements: 0 }) },
}));
vi.mock('@/features/solicitacoes/components/KanbanColumn', () => ({
  KanbanColumn: ({
    config,
    cards,
    onAdvance,
    onDragStart,
    onDrop,
  }: {
    config: { status: string; label: string };
    cards: { id: string; titulo: string }[];
    onAdvance: (card: unknown) => void;
    onDragStart: (card: unknown) => void;
    onDrop: (status: string) => void;
  }) => (
    <div>
      {cards.map((card) => (
        <div key={card.id}>
          <button type="button" onClick={() => onAdvance(card)}>
            Avançar {card.titulo}
          </button>
          <button type="button" onClick={() => onDragStart(card)}>
            Arrastar {card.titulo}
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onDrop(config.status)}>
        Soltar em {config.label}
      </button>
    </div>
  ),
}));
vi.mock('@/features/solicitacoes/components/TriagemModal', () => ({
  TriagemModal: ({ usuarios }: { usuarios: { id: string; nome: string }[] }) => (
    <ul aria-label="Responsáveis disponíveis">
      {usuarios.map((u) => (
        <li key={u.id}>{u.nome}</li>
      ))}
    </ul>
  ),
}));

afterEach(cleanup);

async function carregarQuadroCom(solicitacao: Solicitacao) {
  const { useKanbanSolicitacoes } = await import('@/features/solicitacoes/hooks/useKanbanSolicitacoes');
  vi.mocked(useKanbanSolicitacoes).mockReturnValue({
    data: [solicitacao], isLoading: false, error: null,
  } as unknown as ReturnType<typeof useKanbanSolicitacoes>);
}

describe('KanbanBoard', () => {
  it('shows loading state', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('renders kanban columns when data is loaded', async () => {
    const { useKanbanSolicitacoes } = await import('@/features/solicitacoes/hooks/useKanbanSolicitacoes');
    vi.mocked(useKanbanSolicitacoes).mockReturnValue({
      data: [], isLoading: false, error: null,
    } as unknown as ReturnType<typeof useKanbanSolicitacoes>);

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });
    expect(within(container).getByText('A Fazer')).toBeDefined();
    expect(within(container).getByText('Em Andamento')).toBeDefined();
  });

  it('shows a scoped empty state for OPERADOR with no assigned solicitacoes', async () => {
    const { useKanbanSolicitacoes } = await import('@/features/solicitacoes/hooks/useKanbanSolicitacoes');
    vi.mocked(useKanbanSolicitacoes).mockReturnValue({
      data: [], isLoading: false, error: null,
    } as unknown as ReturnType<typeof useKanbanSolicitacoes>);

    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });
    expect(within(container).getByText('Nenhuma solicitação atribuída a você')).toBeDefined();
    expect(within(container).queryByText('A Fazer')).toBeNull();
  });

  it('renders normal columns for OPERADOR when there are assigned solicitacoes', async () => {
    const { useKanbanSolicitacoes } = await import('@/features/solicitacoes/hooks/useKanbanSolicitacoes');
    vi.mocked(useKanbanSolicitacoes).mockReturnValue({
      data: [
        {
          id: 's1', titulo: 'T', status: 'A_FAZER', tipo: 'REPARO', prioridade: null,
          descricao: '', modeloId: 'm1', abertaPorUsuarioId: 'u1', comentarioFinal: null,
          criadaEm: new Date().toISOString(), atualizadaEm: new Date().toISOString(),
          concluidaEm: null, canceladaEm: null, responsavelIds: [],
        },
      ],
      isLoading: false, error: null,
    } as unknown as ReturnType<typeof useKanbanSolicitacoes>);

    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });
    expect(within(container).getByText('A Fazer')).toBeDefined();
    expect(within(container).getByText('Em Andamento')).toBeDefined();
    expect(within(container).queryByText('Nenhuma solicitação atribuída a você')).toBeNull();
  });

  it('deve listar os responsáveis disponíveis no modal de triagem quando o gestor avança um card de A Fazer', async () => {
    // Arrange
    const { useKanbanSolicitacoes } = await import('@/features/solicitacoes/hooks/useKanbanSolicitacoes');
    vi.mocked(useKanbanSolicitacoes).mockReturnValue({
      data: [
        {
          id: 's1', titulo: 'Trocar correia', status: 'A_FAZER', tipo: 'REPARO', prioridade: null,
          descricao: '', modeloId: 'm1', abertaPorUsuarioId: 'u1', comentarioFinal: null,
          criadaEm: new Date().toISOString(), atualizadaEm: new Date().toISOString(),
          concluidaEm: null, canceladaEm: null, responsavelIds: [],
        },
      ],
      isLoading: false, error: null,
    } as unknown as ReturnType<typeof useKanbanSolicitacoes>);
    const usuario = { email: null, ativo: true, criadoEm: '', atualizadoEm: '' };
    vi.mocked(usuariosApi.listar).mockResolvedValueOnce({
      content: [
        { ...usuario, id: 'op', nome: 'Olga Operadora', perfil: 'OPERADOR' },
        { ...usuario, id: 'ad', nome: 'Ana Administradora', perfil: 'ADMINISTRADOR' },
      ],
      page: 0, totalPages: 1, totalElements: 2,
    } as Awaited<ReturnType<typeof usuariosApi.listar>>);
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Ge', perfil: 'GESTOR' } });
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });

    // Act
    await userEvent.click(within(container).getAllByRole('button', { name: 'Avançar Trocar correia' })[0]);

    // Assert
    const lista = within(container).getByRole('list', { name: 'Responsáveis disponíveis' });
    expect(await within(lista).findByText('Olga Operadora')).toBeDefined();
    expect(within(lista).queryByText('Ana Administradora')).toBeNull();
  });

  it('deve abrir o formulário de envio para validação quando o operador responsável avança o card', async () => {
    // Arrange
    await carregarQuadroCom(criarSolicitacao({ status: 'EM_ANDAMENTO', responsavelIds: ['eu'] }));
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });

    // Act
    await userEvent.click(within(container).getAllByRole('button', { name: 'Avançar Trocar correia' })[0]);

    // Assert
    expect(within(container).getByText(/Descrição do serviço realizado/i)).toBeDefined();
  });

  it('deve não abrir ação nenhuma quando o operador não responsável tenta avançar o card', async () => {
    // Arrange
    await carregarQuadroCom(criarSolicitacao({ status: 'EM_ANDAMENTO', responsavelIds: ['outro'] }));
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });

    // Act
    await userEvent.click(within(container).getAllByRole('button', { name: 'Avançar Trocar correia' })[0]);

    // Assert
    expect(within(container).queryByText(/Descrição do serviço realizado/i)).toBeNull();
    expect(container.querySelector('form')).toBeNull();
    expect(within(container).queryByRole('list', { name: 'Responsáveis disponíveis' })).toBeNull();
  });

  it('deve abrir o mesmo formulário de devolução do detalhe quando o gestor move o card de Em Validação para Em Andamento', async () => {
    // Arrange
    await carregarQuadroCom(criarSolicitacao({ status: 'EM_VALIDACAO' }));
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Ge', perfil: 'GESTOR' } });
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getAllByRole('button', { name: 'Arrastar Trocar correia' })[0]);

    // Act
    await userEvent.click(within(container).getAllByRole('button', { name: 'Soltar em Em Andamento' })[0]);

    // Assert
    expect(within(container).getByLabelText('Motivo da devolução *')).toBeDefined();
    expect(within(container).getByLabelText('Nova prioridade (opcional)')).toBeDefined();
  });

  it('deve abrir o formulário só de cancelamento quando o gestor solta o card em Cancelada', async () => {
    // Arrange
    await carregarQuadroCom(criarSolicitacao({ status: 'EM_VALIDACAO' }));
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Ge', perfil: 'GESTOR' } });
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getAllByRole('button', { name: 'Arrastar Trocar correia' })[0]);

    // Act
    await userEvent.click(within(container).getAllByRole('button', { name: 'Soltar em Cancelada' })[0]);

    // Assert
    expect(within(container).getByLabelText('Motivo do cancelamento')).toBeDefined();
    expect(within(container).queryByLabelText('Comentário final')).toBeNull();
  });

  it('deve não abrir ação nenhuma quando o card é solto em uma coluna para onde não pode ir', async () => {
    // Arrange
    await carregarQuadroCom(criarSolicitacao({ status: 'A_FAZER' }));
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Ge', perfil: 'GESTOR' } });
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getAllByRole('button', { name: 'Arrastar Trocar correia' })[0]);

    // Act
    await userEvent.click(within(container).getAllByRole('button', { name: 'Soltar em Concluída' })[0]);

    // Assert
    expect(container.querySelector('form')).toBeNull();
    expect(within(container).queryByRole('list', { name: 'Responsáveis disponíveis' })).toBeNull();
    expect(within(container).queryByLabelText('Comentário final')).toBeNull();
  });

  it('deve abrir a ação num diálogo modal com o nome da ação e da solicitação quando o card é avançado', async () => {
    // Arrange
    await carregarQuadroCom(criarSolicitacao({ status: 'EM_ANDAMENTO', responsavelIds: ['eu'] }));
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });

    // Act
    await userEvent.click(within(container).getAllByRole('button', { name: 'Avançar Trocar correia' })[0]);

    // Assert
    const dialogo = within(container).getByRole('dialog', {
      name: 'Enviar para validação: Trocar correia',
    });
    expect(dialogo.getAttribute('aria-modal')).toBe('true');
  });

  it('deve fechar o diálogo da ação quando Esc é apertado', async () => {
    // Arrange
    await carregarQuadroCom(criarSolicitacao({ status: 'EM_ANDAMENTO', responsavelIds: ['eu'] }));
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getAllByRole('button', { name: 'Avançar Trocar correia' })[0]);

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(within(container).queryByRole('dialog')).toBeNull();
  });
});
