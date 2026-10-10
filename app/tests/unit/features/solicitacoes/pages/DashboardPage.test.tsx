/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { modelosApi } from '@/features/admin/modelos/api/modelosApi';
import type { Modelo } from '@/features/admin/modelos/types/modeloTypes';
import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';
import { useFilaDeAtencao } from '@/features/solicitacoes/hooks/useFilaDeAtencao';
import { useMetricas } from '@/features/solicitacoes/hooks/useMetricas';
import { DashboardPage } from '@/features/solicitacoes/pages/DashboardPage';
import type {
  HistoricoMetricas,
  MetricasResponse,
  Solicitacao,
} from '@/features/solicitacoes/types/solicitacaoTypes';
import type { PerfilUsuario } from '@/features/auth/types/authTypes';
import type { PageResponse } from '@/shared/types/page';
import { createAppWrapper } from '@tests/support/appWrapper';
import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

vi.mock('@/features/solicitacoes/hooks/useMetricas', () => ({ useMetricas: vi.fn() }));
vi.mock('@/features/solicitacoes/hooks/useFilaDeAtencao', () => ({ useFilaDeAtencao: vi.fn() }));
vi.mock('@/features/solicitacoes/pages/ModelosTab', () => ({
  ModelosTab: () => <p>Conteúdo da aba Modelos</p>,
}));
vi.mock('@/features/solicitacoes/pages/PessoalTab', () => ({
  PessoalTab: () => <p>Conteúdo da aba Pessoal</p>,
}));

const reais = {
  metricas: await vi.importActual<typeof import('@/features/solicitacoes/hooks/useMetricas')>(
    '@/features/solicitacoes/hooks/useMetricas',
  ),
  fila: await vi.importActual<typeof import('@/features/solicitacoes/hooks/useFilaDeAtencao')>(
    '@/features/solicitacoes/hooks/useFilaDeAtencao',
  ),
};

const METRICAS: MetricasResponse = {
  totalUsuarios: 5,
  totalModelos: 2,
  totalSolicitacoes: 200,
  solicitacoesPorStatus: {
    A_FAZER: 11,
    EM_ANDAMENTO: 22,
    EM_VALIDACAO: 14,
    CONCLUIDA: 100,
    CANCELADA: 53,
  },
  solicitacoesAbertas: 47,
  solicitacoesPendentes: 11,
  solicitacoesConcluidas: 100,
  tempoMedioResolucaoSegundos: 86400,
};

const HISTORICO: HistoricoMetricas = {
  series: [
    { periodo: '2026-01-01', total: 9, abertas: 7, concluidas: 1, canceladas: 1, slaMediaHoras: 5 },
  ],
  slaGlobalMediaHoras: 6,
  periodoLabel: 'Últimos 30 dias',
};

const MODELO: Modelo = {
  id: 'm1',
  codigo: 'MOD-001',
  versao: 1,
  descricao: 'Modelo',
  observacoes: null,
  fotoCapaUrl: null,
  ativo: true,
  maquina: 'Prensa',
  tipo: null,
  temPendenciaAberta: false,
  criadoEm: '2026-01-01T00:00:00Z',
  atualizadoEm: '2026-01-01T00:00:00Z',
};

const HORA_DAS_METRICAS = new Date('2026-03-10T08:00:00').getTime();
const HORA_DA_FILA = new Date('2026-03-10T15:00:00').getTime();
const ERRO_DE_REDE = new Error('falha de rede');

let listar: MockInstance<typeof solicitacoesApi.listar>;
let obterMetricas: MockInstance<typeof solicitacoesApi.obterMetricas>;
let obterHistorico: MockInstance<typeof solicitacoesApi.obterHistoricoMetricas>;

function pagina(content: Solicitacao[], totalElements: number): PageResponse<Solicitacao> {
  return { content, page: 0, size: 100, totalPages: 1, totalElements };
}

function horaEscrita(instante: number): string {
  const hora: string = new Date(instante).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `Atualizado às ${hora}`;
}

function renderizar(perfil: PerfilUsuario = 'ADMINISTRADOR'): void {
  const { AppWrapper } = createAppWrapper({ user: { nome: 'Teste', perfil } });
  render(<DashboardPage />, { wrapper: AppWrapper });
}

function forcarHorasDeAtualizacao(): void {
  vi.mocked(useMetricas).mockImplementation((opcoes) => ({
    ...reais.metricas.useMetricas(opcoes),
    dataUpdatedAt: opcoes?.enabled === undefined ? 0 : HORA_DAS_METRICAS,
  }));
  vi.mocked(useFilaDeAtencao).mockImplementation((opcoes) => ({
    ...reais.fila.useFilaDeAtencao(opcoes),
    dataUpdatedAt: opcoes?.enabled === undefined ? 0 : HORA_DA_FILA,
  }));
}

beforeEach(() => {
  vi.mocked(useMetricas).mockImplementation(reais.metricas.useMetricas);
  vi.mocked(useFilaDeAtencao).mockImplementation(reais.fila.useFilaDeAtencao);
  listar = vi.spyOn(solicitacoesApi, 'listar');
  obterMetricas = vi.spyOn(solicitacoesApi, 'obterMetricas');
  obterHistorico = vi.spyOn(solicitacoesApi, 'obterHistoricoMetricas');
  const atrasada: Solicitacao = criarSolicitacao({ titulo: 'Trocar correia' });
  listar.mockImplementation(async (filtros) =>
    filtros.atrasada === true ? pagina([atrasada], 17) : pagina([], 58),
  );
  obterMetricas.mockResolvedValue(METRICAS);
  obterHistorico.mockResolvedValue(HISTORICO);
  vi.spyOn(modelosApi, 'buscarPorId').mockResolvedValue(MODELO);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('DashboardPage — topo sem repetição', () => {
  it('deve mostrar o título Dashboard quando a página abre', async () => {
    // Act
    renderizar();

    // Assert
    expect(await screen.findByRole('heading', { level: 1, name: 'Dashboard' })).toBeDefined();
  });

  it('deve não mostrar a descrição Painel de indicadores quando as métricas ainda carregam', async () => {
    // Arrange
    obterMetricas.mockReturnValue(new Promise<MetricasResponse>(() => {}));

    // Act
    renderizar();
    await screen.findByText('Trocar correia');

    // Assert
    expect(screen.queryByText('Painel de indicadores')).toBeNull();
  });

  it('deve manter a descrição Suas solicitações quando o perfil é operador', async () => {
    // Arrange
    // Act
    renderizar('OPERADOR');

    // Assert
    expect(await screen.findByText('Suas solicitações')).toBeDefined();
  });

  it('deve não mostrar a descrição Suas solicitações quando o perfil é administrador', async () => {
    // Arrange
    // Act
    renderizar('ADMINISTRADOR');
    await screen.findByText('Trocar correia');

    // Assert
    expect(screen.queryByText('Suas solicitações')).toBeNull();
  });

  it.each([/solicitações no total/, /Monitoramento em Tempo Real/])(
    'deve não mostrar o texto %s quando as métricas carregam',
    async (texto) => {
      // Act
      renderizar();
      await screen.findByText('47');

      // Assert
      expect(screen.queryByText(texto)).toBeNull();
    },
  );

  it('deve mostrar a hora da última atualização quando os dados carregam', async () => {
    // Act
    renderizar();

    // Assert
    expect(await screen.findByText(/Atualizado às/)).toBeDefined();
  });

  it('deve mostrar a hora da fila quando ela é mais recente que a das métricas', async () => {
    // Arrange
    forcarHorasDeAtualizacao();

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText(horaEscrita(HORA_DA_FILA))).toBeDefined();
  });

  it('deve mostrar a hora das métricas quando ela é mais recente que a da fila', async () => {
    // Arrange
    forcarHorasDeAtualizacao();
    vi.mocked(useFilaDeAtencao).mockImplementation((opcoes) => ({
      ...reais.fila.useFilaDeAtencao(opcoes),
      dataUpdatedAt: opcoes?.enabled === undefined ? 0 : HORA_DAS_METRICAS - 3_600_000,
    }));

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText(horaEscrita(HORA_DAS_METRICAS))).toBeDefined();
  });

  it('deve consultar as métricas com a consulta ligada quando o perfil não é operador', async () => {
    // Act
    renderizar('GESTOR');
    await screen.findByText('47');

    // Assert
    expect(vi.mocked(useMetricas)).toHaveBeenCalledWith({ enabled: true });
  });

  it('deve consultar a fila com a consulta ligada quando o perfil não é operador', async () => {
    // Act
    renderizar('GESTOR');
    await screen.findByText('47');

    // Assert
    expect(vi.mocked(useFilaDeAtencao)).toHaveBeenCalledWith({ enabled: true });
  });
});

describe('DashboardPage — operador não vê o agregado', () => {
  it('deve mostrar o conteúdo da aba Pessoal quando o perfil é operador', async () => {
    // Act
    renderizar('OPERADOR');

    // Assert
    expect(await screen.findByText('Conteúdo da aba Pessoal')).toBeDefined();
  });

  it.each(['Solicitações', 'Modelos', 'Pessoal'])(
    'deve não mostrar o botão da aba %s quando o perfil é operador',
    (aba) => {
      // Act
      renderizar('OPERADOR');

      // Assert
      expect(screen.queryByRole('button', { name: aba })).toBeNull();
    },
  );

  it('deve não mostrar a fila de atenção quando o perfil é operador', () => {
    // Act
    renderizar('OPERADOR');

    // Assert
    expect(screen.queryByRole('region', { name: 'Precisa de atenção' })).toBeNull();
  });

  it('deve não mostrar a hora de atualização quando o perfil é operador e as consultas trariam uma hora', async () => {
    // Arrange
    forcarHorasDeAtualizacao();

    // Act
    renderizar('OPERADOR');
    await screen.findByText('Conteúdo da aba Pessoal');

    // Assert
    expect(screen.queryByText(/Atualizado às/)).toBeNull();
  });

  it('deve não listar solicitações quando o perfil é operador', async () => {
    // Act
    renderizar('OPERADOR');
    await screen.findByText('Conteúdo da aba Pessoal');

    // Assert
    expect(listar).not.toHaveBeenCalled();
  });

  it('deve não buscar as métricas quando o perfil é operador', async () => {
    // Act
    renderizar('OPERADOR');
    await screen.findByText('Conteúdo da aba Pessoal');

    // Assert
    expect(obterMetricas).not.toHaveBeenCalled();
  });

  it('deve não buscar o histórico das métricas quando o perfil é operador', async () => {
    // Act
    renderizar('OPERADOR');
    await screen.findByText('Conteúdo da aba Pessoal');

    // Assert
    expect(obterHistorico).not.toHaveBeenCalled();
  });

  it('deve desligar as consultas de métricas e fila quando o perfil é operador', () => {
    // Act
    renderizar('OPERADOR');

    // Assert
    expect(vi.mocked(useMetricas)).toHaveBeenCalledWith({ enabled: false });
    expect(vi.mocked(useFilaDeAtencao)).toHaveBeenCalledWith({ enabled: false });
  });
});

describe('DashboardPage — abas por perfil', () => {
  it.each(['GESTOR', 'ADMINISTRADOR'] as const)(
    'deve mostrar as abas Solicitações, Modelos e Pessoal quando o perfil é %s',
    async (perfil) => {
      // Act
      renderizar(perfil);

      // Assert
      const abas: string[] = (await screen.findAllByRole('button')).map(
        (botao) => botao.textContent ?? '',
      );
      expect(abas).toEqual(['Solicitações', 'Modelos', 'Pessoal']);
    },
  );

  it.each(['Modelos', 'Pessoal'])(
    'deve mostrar o conteúdo da aba %s quando o usuário a escolhe',
    async (nome) => {
      // Arrange
      renderizar();

      // Act
      await userEvent.click(screen.getByRole('button', { name: nome }));

      // Assert
      expect(await screen.findByText(`Conteúdo da aba ${nome}`)).toBeDefined();
    },
  );

  it('deve esconder a fila de atenção quando o usuário muda para a aba Modelos', async () => {
    // Arrange
    renderizar();
    await screen.findByRole('region', { name: 'Precisa de atenção' });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Modelos' }));

    // Assert
    expect(screen.queryByRole('region', { name: 'Precisa de atenção' })).toBeNull();
  });
});

describe('DashboardPage — erro de um bloco não derruba os outros', () => {
  it('deve não trocar a aba por um erro quando as métricas falham', async () => {
    // Arrange
    obterMetricas.mockRejectedValue(ERRO_DE_REDE);

    // Act
    renderizar();
    await screen.findByText('Não foi possível carregar as abertas');

    // Assert
    expect(screen.queryByText('Não foi possível carregar o dashboard')).toBeNull();
  });

  it('deve manter a fila visível quando as métricas falham', async () => {
    // Arrange
    obterMetricas.mockRejectedValue(ERRO_DE_REDE);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Trocar correia')).toBeDefined();
  });

  it('deve mostrar a fila enquanto as métricas ainda carregam', async () => {
    // Arrange
    obterMetricas.mockReturnValue(new Promise<MetricasResponse>(() => {}));

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Trocar correia')).toBeDefined();
  });

  it('deve não mostrar o carregamento do painel inteiro quando as métricas ainda carregam', async () => {
    // Arrange
    obterMetricas.mockReturnValue(new Promise<MetricasResponse>(() => {}));

    // Act
    renderizar();
    await screen.findByText('Trocar correia');

    // Assert
    expect(screen.queryByText('Carregando painel de indicadores...')).toBeNull();
  });

  it('deve mostrar a mensagem de erro da fila quando a fila falha', async () => {
    // Arrange
    listar.mockRejectedValue(ERRO_DE_REDE);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Não foi possível carregar a fila de atenção')).toBeDefined();
  });

  it('deve mostrar a região Tendência quando a fila falha', async () => {
    // Arrange
    listar.mockRejectedValue(ERRO_DE_REDE);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByRole('region', { name: 'Tendência' })).toBeDefined();
  });

  it('deve não mostrar a mensagem de erro do painel quando a fila falha', async () => {
    // Arrange
    listar.mockRejectedValue(ERRO_DE_REDE);

    // Act
    renderizar();
    await screen.findByText('Não foi possível carregar a fila de atenção');

    // Assert
    expect(screen.queryByText('Não foi possível carregar o dashboard')).toBeNull();
  });
});
