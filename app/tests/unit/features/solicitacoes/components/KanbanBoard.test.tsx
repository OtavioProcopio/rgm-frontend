/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usuariosApi } from '@/features/admin/usuarios/api/usuariosApi';
import { createAppWrapper } from '@tests/support/appWrapper';
import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

import { useColunasDoQuadro } from '@/features/solicitacoes/hooks/useColunaDoQuadro';
import type { Solicitacao, StatusSolicitacao } from '@/features/solicitacoes/types/solicitacaoTypes';
import { KanbanBoard } from '@/features/solicitacoes/components/KanbanBoard';

vi.mock('@/features/solicitacoes/hooks/useColunaDoQuadro', () => ({
  useColunasDoQuadro: vi.fn(),
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
    total,
    temMais,
    aviso,
    onCarregarMais,
    relacaoDe,
    onAdvance,
    onDragStart,
    onDrop,
  }: {
    config: { status: string; label: string };
    cards: { id: string; titulo: string }[];
    total: number;
    temMais?: boolean;
    aviso?: string;
    onCarregarMais?: () => void;
    relacaoDe?: (card: unknown) => string | null;
    onAdvance: (card: unknown) => void;
    onDragStart: (card: unknown) => void;
    onDrop: (status: string) => void;
  }) => (
    <div>
      {cards.map((card) => (
        <div key={card.id}>
          <span data-testid={`relacao-${card.id}`}>
            {relacaoDe ? (relacaoDe(card) ?? 'sem relação') : 'não calculada'}
          </span>
          <button type="button" onClick={() => onAdvance(card)}>
            Avançar {card.titulo}
          </button>
          <button type="button" onClick={() => onDragStart(card)}>
            Arrastar {card.titulo}
          </button>
        </div>
      ))}
      <span data-testid={`total-${config.status}`}>{total}</span>
      <span data-testid={`aviso-${config.status}`}>{aviso ?? 'sem aviso'}</span>
      {temMais ? (
        <button type="button" onClick={onCarregarMais}>
          Carregar mais em {config.label}
        </button>
      ) : null}
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

const STATUS: StatusSolicitacao[] = ['A_FAZER', 'EM_ANDAMENTO', 'EM_VALIDACAO', 'CONCLUIDA', 'CANCELADA'];

type Coluna = ReturnType<typeof useColunasDoQuadro>[StatusSolicitacao];

/** As cinco colunas como o hook as entrega, a partir de uma lista de solicitações. */
function colunasCom(
  solicitacoes: Solicitacao[],
  porStatus: Partial<Record<StatusSolicitacao, Partial<Coluna>>> = {},
) {
  return Object.fromEntries(
    STATUS.map((status) => {
      const cards = solicitacoes.filter((s) => s.status === status);
      const coluna: Coluna = {
        cards,
        total: cards.length,
        temMais: false,
        carregando: false,
        carregandoMais: false,
        erro: null,
        carregarMais: vi.fn(),
        ...porStatus[status],
      };
      return [status, coluna];
    }),
  ) as ReturnType<typeof useColunasDoQuadro>;
}

beforeEach(() => {
  vi.mocked(useColunasDoQuadro).mockReturnValue(
    colunasCom([], { A_FAZER: { carregando: true } }),
  );
});

afterEach(cleanup);

async function carregarQuadroCom(solicitacao: Solicitacao) {
  const { useColunasDoQuadro } = await import('@/features/solicitacoes/hooks/useColunaDoQuadro');
  vi.mocked(useColunasDoQuadro).mockReturnValue(colunasCom([solicitacao]));
}

describe('KanbanBoard', () => {
  it('shows loading state', () => {
    const { AppWrapper } = createAppWrapper();
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('renders kanban columns when data is loaded', async () => {
    const { useColunasDoQuadro } = await import('@/features/solicitacoes/hooks/useColunaDoQuadro');
    vi.mocked(useColunasDoQuadro).mockReturnValue(colunasCom([]));

    const { AppWrapper } = createAppWrapper();
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });
    expect(within(container).getByText('A Fazer')).toBeDefined();
    expect(within(container).getByText('Em Andamento')).toBeDefined();
  });

  it('renders normal columns for OPERADOR when there are assigned solicitacoes', async () => {
    const { useColunasDoQuadro } = await import('@/features/solicitacoes/hooks/useColunaDoQuadro');
    vi.mocked(useColunasDoQuadro).mockReturnValue(colunasCom([
        {
          id: 's1', titulo: 'T', status: 'A_FAZER', tipo: 'REPARO', prioridade: null,
          descricao: '', modeloId: 'm1', abertaPorUsuarioId: 'u1', comentarioFinal: null,
          criadaEm: new Date().toISOString(), atualizadaEm: new Date().toISOString(),
          concluidaEm: null, canceladaEm: null, responsavelIds: [],
        },
      ]));

    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });
    expect(within(container).getByText('A Fazer')).toBeDefined();
    expect(within(container).getByText('Em Andamento')).toBeDefined();
    expect(within(container).queryByText('Nenhuma solicitação atribuída a você')).toBeNull();
  });

  it('deve listar os responsáveis disponíveis no modal de triagem quando o gestor avança um card de A Fazer', async () => {
    // Arrange
    const { useColunasDoQuadro } = await import('@/features/solicitacoes/hooks/useColunaDoQuadro');
    vi.mocked(useColunasDoQuadro).mockReturnValue(colunasCom([
        {
          id: 's1', titulo: 'Trocar correia', status: 'A_FAZER', tipo: 'REPARO', prioridade: null,
          descricao: '', modeloId: 'm1', abertaPorUsuarioId: 'u1', comentarioFinal: null,
          criadaEm: new Date().toISOString(), atualizadaEm: new Date().toISOString(),
          concluidaEm: null, canceladaEm: null, responsavelIds: [],
        },
      ]));
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

  it('deve perguntar antes de descartar quando Esc é apertado com algo preenchido no diálogo da ação', async () => {
    // Arrange
    await carregarQuadroCom(criarSolicitacao({ status: 'EM_ANDAMENTO', responsavelIds: ['eu'] }));
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });
    const { container } = render(<KanbanBoard />, { wrapper: AppWrapper });
    await userEvent.click(within(container).getAllByRole('button', { name: 'Avançar Trocar correia' })[0]);
    const dialogo = within(container).getByRole('dialog');
    await userEvent.type(within(dialogo).getByRole('textbox'), 'Correia trocada');

    // Act
    await userEvent.keyboard('{Escape}');

    // Assert
    expect(within(dialogo).getByText('Descartar o que foi preenchido?')).toBeDefined();
  });
});

describe('KanbanBoard — quadro do operador', () => {
  const OPERADOR = { nome: 'Op', perfil: 'OPERADOR' } as const;
  const GESTOR = { nome: 'Ge', perfil: 'GESTOR' } as const;

  async function quadroCom(solicitacoes: Solicitacao[]) {
    const { useColunasDoQuadro } = await import('@/features/solicitacoes/hooks/useColunaDoQuadro');
    vi.mocked(useColunasDoQuadro).mockReturnValue(colunasCom(solicitacoes));
  }

  function montar(user: { nome: string; perfil: 'OPERADOR' | 'GESTOR' }, props: Parameters<typeof KanbanBoard>[0] = {}) {
    const { AppWrapper } = createAppWrapper({ user, initialEntries: ['/app/solicitacoes'] });
    return render(<KanbanBoard {...props} />, { wrapper: AppWrapper });
  }

  it('deve dizer que o operador ainda não abriu nem recebeu solicitações quando ele não tem nenhuma', async () => {
    // Arrange
    await quadroCom([]);

    // Act
    const { container } = montar(OPERADOR);

    // Assert
    expect(
      within(container).getByText('Você ainda não abriu nem recebeu solicitações'),
    ).toBeDefined();
  });

  it('deve não usar o texto da regra antiga quando o operador não tem nenhuma solicitação', async () => {
    // Arrange
    await quadroCom([]);

    // Act
    const { container } = montar(OPERADOR);

    // Assert
    expect(within(container).queryByText('Nenhuma solicitação atribuída a você')).toBeNull();
  });

  it('deve oferecer "Nova solicitação", levando à abertura, quando o operador não tem nenhuma solicitação', async () => {
    // Arrange
    await quadroCom([]);

    // Act
    const { container } = montar(OPERADOR);

    // Assert
    const link = within(container).getByRole('link', { name: 'Nova solicitação' });
    expect(link.getAttribute('href')).toBe('/app/solicitacoes/nova');
  });

  it.each([
    ['modelo', { modeloId: 'm-9' }],
    ['início do período', { dataInicio: '2026-10-01T00:00:00Z' }],
    ['fim do período', { dataFim: '2026-10-07T23:59:59Z' }],
  ])(
    'deve dizer que não há solicitação para o filtro quando o filtro de %s não encontra nenhuma do operador',
    async (_nome, filtro) => {
      // Arrange
      await quadroCom([]);

      // Act
      const { container } = montar(OPERADOR, filtro);

      // Assert
      expect(within(container).getByText('Nenhuma solicitação para este filtro')).toBeDefined();
    },
  );

  it('deve não usar o texto de quem não tem nenhuma solicitação quando o filtro é que não encontra', async () => {
    // Arrange
    await quadroCom([]);

    // Act
    const { container } = montar(OPERADOR, { modeloId: 'm-9' });

    // Assert
    expect(
      within(container).queryByText('Você ainda não abriu nem recebeu solicitações'),
    ).toBeNull();
  });

  it('deve pedir para limpar o filtro uma vez quando "Limpar filtro" é acionado', async () => {
    // Arrange
    await quadroCom([]);
    const onLimparFiltro = vi.fn();
    const { container } = montar(OPERADOR, { modeloId: 'm-9', onLimparFiltro });

    // Act
    await userEvent.click(within(container).getByRole('button', { name: 'Limpar filtro' }));

    // Assert
    expect(onLimparFiltro).toHaveBeenCalledTimes(1);
  });

  it('deve marcar como aberta a solicitação que o operador abriu e não recebeu', async () => {
    // Arrange
    await quadroCom([criarSolicitacao({ id: 's1', abertaPorUsuarioId: 'eu', responsavelIds: [] })]);

    // Act
    const { container } = montar(OPERADOR);

    // Assert
    expect(within(container).getAllByTestId('relacao-s1')[0].textContent).toBe('ABERTA');
  });

  it('deve marcar como atribuída a solicitação de outra pessoa que está com o operador', async () => {
    // Arrange
    await quadroCom([
      criarSolicitacao({ id: 's1', abertaPorUsuarioId: 'outro', responsavelIds: ['eu'] }),
    ]);

    // Act
    const { container } = montar(OPERADOR);

    // Assert
    expect(within(container).getAllByTestId('relacao-s1')[0].textContent).toBe('ATRIBUIDA');
  });

  it('deve marcar só como atribuída a solicitação que o operador abriu e também recebeu', async () => {
    // Arrange
    await quadroCom([criarSolicitacao({ id: 's1', abertaPorUsuarioId: 'eu', responsavelIds: ['eu'] })]);

    // Act
    const { container } = montar(OPERADOR);

    // Assert
    expect(within(container).getAllByTestId('relacao-s1')[0].textContent).toBe('ATRIBUIDA');
  });

  it('deve não calcular relação para o gestor, mesmo na solicitação que ele abriu', async () => {
    // Arrange
    await quadroCom([criarSolicitacao({ id: 's1', abertaPorUsuarioId: 'eu', responsavelIds: ['eu'] })]);

    // Act
    const { container } = montar(GESTOR);

    // Assert
    expect(within(container).getAllByTestId('relacao-s1')[0].textContent).toBe('não calculada');
  });

  it('deve mostrar as colunas quando o gestor não tem solicitações', async () => {
    // Arrange
    await quadroCom([]);

    // Act
    const { container } = montar(GESTOR);

    // Assert
    expect(within(container).getAllByText('Soltar em A Fazer').length).toBeGreaterThan(0);
  });

  it('deve não mostrar o quadro vazio do operador quando o gestor não tem solicitações', async () => {
    // Arrange
    await quadroCom([]);

    // Act
    const { container } = montar(GESTOR);

    // Assert
    expect(
      within(container).queryByText('Você ainda não abriu nem recebeu solicitações'),
    ).toBeNull();
  });
});

describe('KanbanBoard — colunas em blocos', () => {
  const GESTOR = { nome: 'Ge', perfil: 'GESTOR' } as const;
  const OPERADOR = { nome: 'Op', perfil: 'OPERADOR' } as const;

  function montar(
    colunas: ReturnType<typeof useColunasDoQuadro>,
    user: { nome: string; perfil: 'OPERADOR' | 'GESTOR' } = GESTOR,
    props: Parameters<typeof KanbanBoard>[0] = {},
  ) {
    vi.mocked(useColunasDoQuadro).mockReturnValue(colunas);
    const { AppWrapper } = createAppWrapper({ user, initialEntries: ['/app/solicitacoes'] });
    return render(<KanbanBoard {...props} />, { wrapper: AppWrapper });
  }

  const emAndamento = (quantos: number) =>
    Array.from({ length: quantos }, (_, i) =>
      criarSolicitacao({ id: `s-${i}`, titulo: `Card ${i}`, status: 'EM_ANDAMENTO' }),
    );

  it('deve mostrar no contador da coluna o total da API, e não a quantidade de cards carregados', () => {
    // Arrange
    const colunas = colunasCom(emAndamento(20), { EM_ANDAMENTO: { total: 45, temMais: true } });

    // Act
    const { container } = montar(colunas);

    // Assert
    expect(within(container).getAllByTestId('total-EM_ANDAMENTO')[0].textContent).toBe('45');
  });

  it('deve mostrar na aba do celular o total da coluna', () => {
    // Arrange
    const colunas = colunasCom(emAndamento(20), { EM_ANDAMENTO: { total: 45, temMais: true } });

    // Act
    const { container } = montar(colunas);

    // Assert
    expect(within(container).getByRole('button', { name: /^45\s*Em Andamento$/ })).toBeDefined();
  });

  it('deve pedir o próximo bloco da coluna quando "Carregar mais" é acionado nela', async () => {
    // Arrange
    const carregarMais = vi.fn();
    const colunas = colunasCom(emAndamento(20), {
      EM_ANDAMENTO: { total: 45, temMais: true, carregarMais },
    });
    const { container } = montar(colunas);

    // Act
    await userEvent.click(
      within(container).getAllByRole('button', { name: 'Carregar mais em Em Andamento' })[0],
    );

    // Assert
    expect(carregarMais).toHaveBeenCalledTimes(1);
  });

  it.each(['CONCLUIDA', 'CANCELADA'])(
    'deve avisar que a coluna %s mostra os últimos 30 dias quando não há período escolhido',
    (status) => {
      // Act
      const { container } = montar(colunasCom([]));

      // Assert
      expect(within(container).getAllByTestId(`aviso-${status}`)[0].textContent).toBe(
        'Últimos 30 dias',
      );
    },
  );

  it('deve não avisar dos últimos 30 dias quando um período foi escolhido', () => {
    // Act
    const { container } = montar(colunasCom([]), GESTOR, { dataInicio: '2026-08-01T00:00:00Z' });

    // Assert
    expect(within(container).getAllByTestId('aviso-CONCLUIDA')[0].textContent).toBe('sem aviso');
  });

  it.each(['A_FAZER', 'EM_ANDAMENTO', 'EM_VALIDACAO'])(
    'deve nunca avisar dos últimos 30 dias na coluna em aberto %s',
    (status) => {
      // Act
      const { container } = montar(colunasCom([]));

      // Assert
      expect(within(container).getAllByTestId(`aviso-${status}`)[0].textContent).toBe('sem aviso');
    },
  );

  it('deve entregar às colunas os filtros do quadro', () => {
    // Act
    montar(colunasCom([]), GESTOR, {
      modeloId: 'm-1',
      dataInicio: '2026-08-01T00:00:00Z',
      dataFim: '2026-08-31T23:59:59Z',
    });

    // Assert
    expect(vi.mocked(useColunasDoQuadro).mock.lastCall?.[0]).toEqual({
      modeloId: 'm-1',
      criadaEmInicio: '2026-08-01T00:00:00Z',
      criadaEmFim: '2026-08-31T23:59:59Z',
    });
  });

  it('deve mostrar o carregamento, e não o quadro vazio do operador, enquanto alguma coluna ainda carrega', () => {
    // Arrange
    const colunas = colunasCom([], { CANCELADA: { carregando: true } });

    // Act
    const { container } = montar(colunas, OPERADOR);

    // Assert
    expect(
      within(container).queryByText('Você ainda não abriu nem recebeu solicitações'),
    ).toBeNull();
  });

  it('deve mostrar o quadro vazio do operador quando as cinco colunas responderam e somam zero', () => {
    // Act
    const { container } = montar(colunasCom([]), OPERADOR);

    // Assert
    expect(
      within(container).getByText('Você ainda não abriu nem recebeu solicitações'),
    ).toBeDefined();
  });

  it('deve mostrar as cinco colunas ao operador que tem uma solicitação em uma coluna só', () => {
    // Arrange
    const colunas = colunasCom([criarSolicitacao({ id: 's1', status: 'A_FAZER' })]);

    // Act
    const { container } = montar(colunas, OPERADOR);

    // Assert
    expect(within(container).getAllByRole('button', { name: /^Soltar em / })).toHaveLength(6);
  });

  it('deve mostrar o erro do quadro quando uma das colunas falha', () => {
    // Arrange
    const colunas = colunasCom([], { EM_VALIDACAO: { erro: new Error('sem rede') } });

    // Act
    const { container } = montar(colunas);

    // Assert
    expect(within(container).getByText('Erro ao carregar solicitações')).toBeDefined();
  });
});
