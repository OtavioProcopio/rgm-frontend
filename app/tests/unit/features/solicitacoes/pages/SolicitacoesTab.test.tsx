/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { modelosApi } from '@/features/admin/modelos/api/modelosApi';
import type { Modelo } from '@/features/admin/modelos/types/modeloTypes';
import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';
import { intervalosDoPeriodo } from '@/features/solicitacoes/lib/periodoDoPainel';
import { SolicitacoesTab } from '@/features/solicitacoes/pages/SolicitacoesTab';
import type {
  HistoricoMetricas,
  MetricasResponse,
  Solicitacao,
} from '@/features/solicitacoes/types/solicitacaoTypes';
import type { PageResponse } from '@/shared/types/page';
import { createAppWrapper } from '@tests/support/appWrapper';
import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

const ABERTAS = 47;
const ATRASADAS = 17;
const CONCLUIDAS = 58;
const TENTAR_NOVAMENTE = 'Tentar novamente';
const ERRO_DE_REDE = new Error('falha de rede');

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
  solicitacoesAbertas: ABERTAS,
  solicitacoesPendentes: 11,
  solicitacoesConcluidas: 100,
  tempoMedioResolucaoSegundos: 86400,
};

const HISTORICO: HistoricoMetricas = {
  series: [
    { periodo: '2026-01-01', total: 9, abertas: 7, concluidas: 1, canceladas: 1, slaMediaHoras: 5 },
    { periodo: '2026-01-02', total: 5, abertas: 2, concluidas: 3, canceladas: 0, slaMediaHoras: 6 },
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

let listar: MockInstance<typeof solicitacoesApi.listar>;
let obterMetricas: MockInstance<typeof solicitacoesApi.obterMetricas>;
let obterHistorico: MockInstance<typeof solicitacoesApi.obterHistoricoMetricas>;
let buscarPorId: MockInstance<typeof modelosApi.buscarPorId>;

function pagina(content: Solicitacao[], totalElements: number): PageResponse<Solicitacao> {
  return { content, page: 0, size: 100, totalPages: 1, totalElements };
}

function responderListagem(): void {
  const atrasada: Solicitacao = criarSolicitacao({ titulo: 'Trocar correia' });
  listar.mockImplementation(async (filtros) =>
    filtros.atrasada === true ? pagina([atrasada], ATRASADAS) : pagina([], CONCLUIDAS),
  );
}

function atrasadasConsultadas(): number {
  return listar.mock.calls.filter(([filtros]) => filtros.atrasada === true).length;
}

/** Conta o número como palavra inteira em cada texto, em qualquer redação ("17", "17 atrasadas"). */
function ocorrenciasDoNumero(raiz: HTMLElement, numero: number): number {
  const padrao = new RegExp(`(?<!\\d)${numero}(?!\\d)`, 'g');
  const percurso: TreeWalker = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  let total = 0;
  for (let no = percurso.nextNode(); no !== null; no = percurso.nextNode()) {
    total += (no.textContent ?? '').match(padrao)?.length ?? 0;
  }
  return total;
}

function renderizar(): void {
  const { AppWrapper } = createAppWrapper({ user: { nome: 'Ge', perfil: 'GESTOR' } });
  render(<SolicitacoesTab />, { wrapper: AppWrapper });
}

async function renderizarCarregado(): Promise<void> {
  renderizar();
  await screen.findByText('Trocar correia');
  await screen.findByRole('region', { name: 'Tendência' });
  const distribuicao = screen.getByRole('region', { name: 'Trabalho em aberto' });
  await within(distribuicao).findByRole('link', { name: /A fazer/ });
}

beforeEach(() => {
  listar = vi.spyOn(solicitacoesApi, 'listar');
  obterMetricas = vi.spyOn(solicitacoesApi, 'obterMetricas');
  obterHistorico = vi.spyOn(solicitacoesApi, 'obterHistoricoMetricas');
  buscarPorId = vi.spyOn(modelosApi, 'buscarPorId');
  responderListagem();
  obterMetricas.mockResolvedValue(METRICAS);
  obterHistorico.mockResolvedValue(HISTORICO);
  buscarPorId.mockResolvedValue(MODELO);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SolicitacoesTab — ordem dos blocos', () => {
  it('deve mostrar a fila, os indicadores, a tendência e a distribuição nessa ordem quando o painel carrega', async () => {
    // Arrange
    await renderizarCarregado();

    // Act
    const regioes: HTMLElement[] = [
      screen.getByRole('region', { name: 'Precisa de atenção' }),
      screen.getByRole('region', { name: 'Indicadores' }),
      screen.getByRole('region', { name: 'Tendência' }),
      screen.getByRole('region', { name: 'Trabalho em aberto' }),
    ];

    // Assert
    const seguintes: boolean[] = regioes
      .slice(1)
      .map(
        (regiao, indice) =>
          (regioes[indice].compareDocumentPosition(regiao) & Node.DOCUMENT_POSITION_FOLLOWING) !==
          0,
      );
    expect(seguintes).toEqual([true, true, true]);
  });
});

describe('SolicitacoesTab — um período só para a tela', () => {
  it('deve ter um único controle de período quando o painel abre', async () => {
    // Arrange
    const esperados = 1;

    // Act
    await renderizarCarregado();

    // Assert
    expect(screen.getAllByRole('radiogroup', { name: 'Período' })).toHaveLength(esperados);
  });

  it('deve oferecer 7, 30 e 90 dias quando o painel abre', async () => {
    // Arrange
    const esperadas: string[] = ['7 dias', '30 dias (selecionada)', '90 dias'];

    // Act
    await renderizarCarregado();

    // Assert
    const opcoes: string[] = screen
      .getAllByRole('radio')
      .map((opcao) => opcao.textContent ?? '')
      .filter((texto) => texto.includes('dias'));
    expect(opcoes).toEqual(esperadas);
  });

  it('deve abrir com 30 dias escolhidos quando o painel abre', async () => {
    // Arrange
    const escolhida = 'true';

    // Act
    await renderizarCarregado();

    // Assert
    expect(screen.getByRole('radio', { name: /30 dias/ }).getAttribute('aria-checked')).toBe(
      escolhida,
    );
  });

  it('deve pedir a tendência de 30 dias quando o painel abre', async () => {
    // Arrange
    const periodoEmDias = 30;

    // Act
    await renderizarCarregado();

    // Assert
    expect(obterHistorico).toHaveBeenCalledWith(periodoEmDias, undefined);
  });

  it('deve pedir a tendência com o novo período quando o usuário escolhe 7 dias', async () => {
    // Arrange
    await renderizarCarregado();
    obterHistorico.mockClear();

    // Act
    await userEvent.click(screen.getByRole('radio', { name: '7 dias' }));

    // Assert
    await waitFor(() => expect(obterHistorico).toHaveBeenCalledWith(7, undefined));
  });

  it('deve pedir as concluídas do novo período quando o usuário escolhe 90 dias', async () => {
    // Arrange
    await renderizarCarregado();
    listar.mockClear();
    const { atual } = intervalosDoPeriodo(90, new Date());

    // Act
    await userEvent.click(screen.getByRole('radio', { name: '90 dias' }));

    // Assert
    await waitFor(() =>
      expect(listar).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'CONCLUIDA', dataInicio: atual.inicio }),
      ),
    );
  });

  it('deve escrever o novo período no indicador de concluídas quando o usuário escolhe 7 dias', async () => {
    // Arrange
    await renderizarCarregado();

    // Act
    await userEvent.click(screen.getByRole('radio', { name: '7 dias' }));

    // Assert
    expect(await screen.findByText('nos últimos 7 dias')).toBeDefined();
  });

  it('deve não consultar a fila de novo quando o usuário troca o período', async () => {
    // Arrange
    await renderizarCarregado();
    const antes: number = atrasadasConsultadas();
    obterHistorico.mockClear();

    // Act
    await userEvent.click(screen.getByRole('radio', { name: '7 dias' }));
    await waitFor(() => expect(obterHistorico).toHaveBeenCalledTimes(1));

    // Assert
    expect(atrasadasConsultadas()).toBe(antes);
  });
});

describe('SolicitacoesTab — conteúdo do painel', () => {
  it.each([
    'Usuários',
    'Modelos',
    'Distribuição detalhada por status',
    'Acompanhamento Crítico',
    'Operação Saudável',
  ])('deve não mostrar %s quando o painel carrega', async (texto) => {
    // Arrange
    const ausente: string = texto;

    // Act
    await renderizarCarregado();

    // Assert
    expect(screen.queryByText(ausente)).toBeNull();
  });

  it('deve mostrar o total de abertas uma única vez na tela quando o painel carrega', async () => {
    // Arrange
    await renderizarCarregado();

    // Act
    const ocorrencias: number = ocorrenciasDoNumero(document.body, ABERTAS);

    // Assert
    expect(ocorrencias).toBe(1);
  });

  it('deve mostrar o total de abertas dentro do indicador quando o painel carrega', async () => {
    // Arrange
    await renderizarCarregado();

    // Act
    const indicadores: HTMLElement = screen.getByRole('region', { name: 'Indicadores' });

    // Assert
    expect(ocorrenciasDoNumero(indicadores, ABERTAS)).toBe(1);
  });

  it('deve mostrar o total de atrasadas uma única vez na tela quando o painel carrega', async () => {
    // Arrange
    await renderizarCarregado();

    // Act
    const ocorrencias: number = ocorrenciasDoNumero(document.body, ATRASADAS);

    // Assert
    expect(ocorrencias).toBe(1);
  });

  it('deve mostrar o total de atrasadas dentro do indicador quando o painel carrega', async () => {
    // Arrange
    await renderizarCarregado();

    // Act
    const indicadores: HTMLElement = screen.getByRole('region', { name: 'Indicadores' });

    // Assert
    expect(ocorrenciasDoNumero(indicadores, ATRASADAS)).toBe(1);
  });

  it('deve não escrever nenhum total de abertas ou atrasadas na fila quando o painel carrega', async () => {
    // Arrange
    await renderizarCarregado();
    const fila: HTMLElement = screen.getByRole('region', { name: 'Precisa de atenção' });

    // Act
    const totais: number =
      ocorrenciasDoNumero(fila, ATRASADAS) + ocorrenciasDoNumero(fila, ABERTAS);

    // Assert
    expect(totais).toBe(0);
  });

  it('deve mostrar a contagem de concluídas uma única vez quando o painel carrega', async () => {
    // Arrange
    const esperadas = 1;

    // Act
    await renderizarCarregado();

    // Assert
    expect(screen.getAllByText(String(CONCLUIDAS))).toHaveLength(esperadas);
  });

  it('deve pedir as métricas globais uma vez quando o painel carrega', async () => {
    // Arrange
    const esperadas = 1;

    // Act
    await renderizarCarregado();

    // Assert
    expect(obterMetricas).toHaveBeenCalledTimes(esperadas);
  });
});

describe('SolicitacoesTab — erro de um bloco não derruba os outros', () => {
  it('deve mostrar o erro da tendência quando o histórico falha', async () => {
    // Arrange
    obterHistorico.mockRejectedValue(ERRO_DE_REDE);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Não foi possível carregar a tendência')).toBeDefined();
  });

  it('deve manter a fila visível quando o histórico falha', async () => {
    // Arrange
    obterHistorico.mockRejectedValue(ERRO_DE_REDE);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Trocar correia')).toBeDefined();
  });

  it('deve manter a contagem de abertas visível quando o histórico falha', async () => {
    // Arrange
    obterHistorico.mockRejectedValue(ERRO_DE_REDE);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText(String(ABERTAS))).toBeDefined();
  });

  it('deve manter o indicador de concluídas visível quando o histórico falha', async () => {
    // Arrange
    obterHistorico.mockRejectedValue(ERRO_DE_REDE);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Concluídas no período')).toBeDefined();
  });

  it('deve mostrar o erro em Abertas quando as métricas falham', async () => {
    // Arrange
    obterMetricas.mockRejectedValue(ERRO_DE_REDE);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Não foi possível carregar as abertas')).toBeDefined();
  });

  it('deve mostrar o erro na distribuição por status quando as métricas falham', async () => {
    // Arrange
    obterMetricas.mockRejectedValue(ERRO_DE_REDE);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Não foi possível carregar o trabalho em aberto')).toBeDefined();
  });

  it('deve oferecer dois botões Tentar novamente quando as métricas falham', async () => {
    // Arrange
    obterMetricas.mockRejectedValue(ERRO_DE_REDE);

    // Act
    renderizar();

    // Assert
    expect(await screen.findAllByRole('button', { name: TENTAR_NOVAMENTE })).toHaveLength(2);
  });

  it('deve manter a fila visível quando as métricas falham', async () => {
    // Arrange
    obterMetricas.mockRejectedValue(ERRO_DE_REDE);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Trocar correia')).toBeDefined();
  });

  it('deve manter as concluídas visíveis quando as métricas falham', async () => {
    // Arrange
    obterMetricas.mockRejectedValue(ERRO_DE_REDE);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText(String(CONCLUIDAS))).toBeDefined();
  });

  it('deve manter a tendência visível quando as métricas falham', async () => {
    // Arrange
    obterMetricas.mockRejectedValue(ERRO_DE_REDE);

    // Act
    renderizar();

    // Assert
    expect(await screen.findByRole('region', { name: 'Tendência' })).toBeDefined();
  });

  it('deve mostrar a contagem de abertas quando o usuário usa Tentar novamente em Abertas', async () => {
    // Arrange
    obterMetricas.mockRejectedValue(ERRO_DE_REDE);
    renderizar();
    await screen.findByText('Não foi possível carregar as abertas');
    obterMetricas.mockResolvedValue(METRICAS);

    // Act
    await userEvent.click(screen.getAllByRole('button', { name: TENTAR_NOVAMENTE })[0]);

    // Assert
    expect(await screen.findByText(String(ABERTAS))).toBeDefined();
  });

  it('deve pedir as métricas duas vezes quando o usuário usa Tentar novamente em Abertas', async () => {
    // Arrange
    obterMetricas.mockRejectedValue(ERRO_DE_REDE);
    renderizar();
    await screen.findByText('Não foi possível carregar as abertas');
    obterMetricas.mockResolvedValue(METRICAS);

    // Act
    await userEvent.click(screen.getAllByRole('button', { name: TENTAR_NOVAMENTE })[0]);
    await screen.findByText(String(ABERTAS));

    // Assert
    expect(obterMetricas).toHaveBeenCalledTimes(2);
  });
});
