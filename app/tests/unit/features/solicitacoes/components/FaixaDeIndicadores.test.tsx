/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';
import { FaixaDeIndicadores } from '@/features/solicitacoes/components/FaixaDeIndicadores';
import {
  intervalosDoPeriodo,
  type PeriodoDoPainel,
} from '@/features/solicitacoes/lib/periodoDoPainel';
import type { MetricasResponse, Solicitacao } from '@/features/solicitacoes/types/solicitacaoTypes';
import type { PageResponse } from '@/shared/types/page';
import { createAppWrapper } from '@tests/support/appWrapper';
import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

type Pagina = PageResponse<Solicitacao>;
type Resposta = Pagina | Error;
type Respostas = { fila: Resposta; atual: Resposta; anterior: Resposta };
type Props = Parameters<typeof FaixaDeIndicadores>[0];

const DIAS: PeriodoDoPainel = 30;
const ABERTAS = 42;
const ATRASADAS = 3;
const CONCLUIDAS = 7;
const UMA_HORA = 3600;
const ERRO_DE_REDE = new Error('falha de rede');
const TENTAR_NOVAMENTE = 'Tentar novamente';
const SEM_VALOR = '—';
const CARREGANDO = 'Carregando';
const LEITURA_DE_ATRASO = /das abertas|Em dia/;

let listar: MockInstance<typeof solicitacoesApi.listar>;

function pagina(total: number, tempos: (number | null)[] = []): Pagina {
  const content: Solicitacao[] = tempos.map((tempo) =>
    criarSolicitacao({ tempoResolucaoSegundos: tempo }),
  );
  return { content, page: 0, size: 100, totalElements: total, totalPages: 1 };
}

function metricasCom(abertas: number): MetricasResponse {
  return {
    totalUsuarios: 0,
    totalModelos: 0,
    totalSolicitacoes: 0,
    solicitacoesPorStatus: {} as MetricasResponse['solicitacoesPorStatus'],
    solicitacoesAbertas: abertas,
    solicitacoesPendentes: 0,
    solicitacoesConcluidas: 0,
    tempoMedioResolucaoSegundos: 0,
  };
}

function responder(parcial: Partial<Respostas>): void {
  const respostas: Respostas = {
    fila: pagina(0),
    atual: pagina(0),
    anterior: pagina(0),
    ...parcial,
  };
  const intervalos = intervalosDoPeriodo(DIAS, new Date());
  listar.mockImplementation(async (filtros) => {
    const alvo =
      filtros.atrasada === true
        ? respostas.fila
        : filtros.dataInicio === intervalos.atual.inicio
          ? respostas.atual
          : respostas.anterior;
    if (alvo instanceof Error) throw alvo;
    return alvo;
  });
}

function responderTudoMenosAbertas(): void {
  responder({
    fila: pagina(ATRASADAS),
    atual: pagina(CONCLUIDAS, [UMA_HORA]),
    anterior: pagina(CONCLUIDAS, [UMA_HORA]),
  });
}

function manterFilaPendente(): void {
  listar.mockImplementation((filtros) =>
    filtros.atrasada === true
      ? new Promise<Pagina>(() => {})
      : Promise.resolve(pagina(CONCLUIDAS, [UMA_HORA])),
  );
}

function manterPeriodoPendente(): void {
  listar.mockImplementation((filtros) =>
    filtros.status === 'CONCLUIDA' ? new Promise<Pagina>(() => {}) : Promise.resolve(pagina(0)),
  );
}

async function aguardarOutrosCartoes(): Promise<void> {
  await screen.findByText(String(ATRASADAS));
  await screen.findByText(String(CONCLUIDAS));
}

function renderFaixa(props: Partial<Props> = {}) {
  const { AppWrapper } = createAppWrapper();
  return render(
    <FaixaDeIndicadores
      dias={DIAS}
      metricas={metricasCom(ABERTAS)}
      metricasErro={false}
      onRetryMetricas={() => {}}
      {...props}
    />,
    { wrapper: AppWrapper },
  );
}

function chamadasDasConcluidas(): number {
  return listar.mock.calls.filter(([filtros]) => filtros.status === 'CONCLUIDA').length;
}

beforeEach(() => {
  listar = vi.spyOn(solicitacoesApi, 'listar');
  responder({});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('FaixaDeIndicadores — estrutura', () => {
  it.each(['Abertas', 'Em atraso', 'Concluídas no período', 'Tempo médio'])(
    'deve mostrar o rótulo %s quando todos os dados carregam',
    async (rotulo) => {
      // Arrange
      responderTudoMenosAbertas();

      // Act
      renderFaixa();

      // Assert
      expect(await screen.findByText(rotulo)).toBeDefined();
    },
  );

  it('deve expor a região Indicadores quando a faixa é renderizada', () => {
    // Arrange
    const props: Partial<Props> = { dias: DIAS };

    // Act
    renderFaixa(props);

    // Assert
    expect(screen.getByRole('region', { name: 'Indicadores' })).toBeDefined();
  });

  it('deve não usar animação quando os dados estão carregando', () => {
    // Arrange
    const props: Partial<Props> = { metricas: undefined };

    // Act
    const { container } = renderFaixa(props);

    // Assert
    expect(container.innerHTML).not.toContain('animate-');
  });
});

describe('FaixaDeIndicadores — abertas', () => {
  it('deve mostrar o valor das métricas quando elas estão carregadas', () => {
    // Arrange
    const metricas = metricasCom(ABERTAS);

    // Act
    renderFaixa({ metricas });

    // Assert
    expect(screen.getByText(String(ABERTAS))).toBeDefined();
  });

  it('deve mostrar o detalhe em aberto agora quando as métricas estão carregadas', () => {
    // Arrange
    const metricas = metricasCom(ABERTAS);

    // Act
    renderFaixa({ metricas });

    // Assert
    expect(screen.getByText('em aberto agora')).toBeDefined();
  });

  it('deve mostrar erro no lugar do cartão quando as métricas falharam', () => {
    // Arrange
    const props: Partial<Props> = { metricas: undefined, metricasErro: true };

    // Act
    renderFaixa(props);

    // Assert
    expect(screen.getByText('Não foi possível carregar as abertas')).toBeDefined();
  });

  it('deve não mostrar o rótulo Abertas quando as métricas falharam', () => {
    // Arrange
    const props: Partial<Props> = { metricas: undefined, metricasErro: true };

    // Act
    renderFaixa(props);

    // Assert
    expect(screen.queryByText('Abertas')).toBeNull();
  });

  it('deve chamar a nova tentativa das métricas uma vez quando o botão é acionado', () => {
    // Arrange
    const onRetryMetricas = vi.fn();
    renderFaixa({ metricas: undefined, metricasErro: true, onRetryMetricas });

    // Act
    fireEvent.click(screen.getByRole('button', { name: TENTAR_NOVAMENTE }));

    // Assert
    expect(onRetryMetricas).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar o valor vazio quando as métricas ainda não chegaram', async () => {
    // Arrange
    responderTudoMenosAbertas();

    // Act
    renderFaixa({ metricas: undefined });
    await aguardarOutrosCartoes();

    // Assert
    expect(screen.getAllByText(SEM_VALOR)).toHaveLength(1);
  });

  it('deve marcar o cartão como ocupado quando as métricas ainda não chegaram', async () => {
    // Arrange
    responderTudoMenosAbertas();

    // Act
    renderFaixa({ metricas: undefined });
    await aguardarOutrosCartoes();

    // Assert
    expect(screen.getByText(CARREGANDO).closest('[aria-busy="true"]')).not.toBeNull();
  });

  it('deve avisar Carregando aos leitores de tela quando as métricas ainda não chegaram', async () => {
    // Arrange
    responderTudoMenosAbertas();

    // Act
    renderFaixa({ metricas: undefined });
    await aguardarOutrosCartoes();

    // Assert
    expect(screen.getByText(CARREGANDO)).toBeDefined();
  });
});

describe('FaixaDeIndicadores — em atraso', () => {
  it('deve mostrar o total da fila quando há atrasadas', async () => {
    // Arrange
    responder({ fila: pagina(ATRASADAS) });

    // Act
    renderFaixa();

    // Assert
    expect(await screen.findByText(String(ATRASADAS))).toBeDefined();
  });

  it('deve mostrar o detalhe fora do prazo quando a fila carrega', async () => {
    // Arrange
    responder({ fila: pagina(ATRASADAS) });

    // Act
    renderFaixa();

    // Assert
    expect(await screen.findByText('em aberto e fora do prazo')).toBeDefined();
  });

  it('deve mostrar Em dia quando não há atrasadas', async () => {
    // Arrange
    responder({ fila: pagina(0) });

    // Act
    renderFaixa();

    // Assert
    expect(await screen.findByText('Em dia')).toBeDefined();
  });

  it('deve mostrar Ruim com o percentual quando as atrasadas passam de 10% das abertas', async () => {
    // Arrange
    responder({ fila: pagina(10) });

    // Act
    renderFaixa();

    // Assert
    expect(await screen.findByText('Ruim · 24% das abertas')).toBeDefined();
  });

  it('deve mostrar Atenção com o percentual quando as atrasadas não passam de 10%', async () => {
    // Arrange
    responder({ fila: pagina(ATRASADAS) });

    // Act
    renderFaixa();

    // Assert
    expect(await screen.findByText('Atenção · 7% das abertas')).toBeDefined();
  });

  it('deve não mostrar leitura quando as métricas ainda não chegaram', async () => {
    // Arrange
    responder({ fila: pagina(ATRASADAS) });

    // Act
    renderFaixa({ metricas: undefined });
    await screen.findByText(String(ATRASADAS));

    // Assert
    expect(screen.queryByText(LEITURA_DE_ATRASO)).toBeNull();
  });

  it('deve mostrar o valor vazio quando a fila ainda carrega', async () => {
    // Arrange
    manterFilaPendente();

    // Act
    renderFaixa();
    await screen.findByText(String(CONCLUIDAS));

    // Assert
    expect(screen.getAllByText(SEM_VALOR)).toHaveLength(1);
  });

  it('deve não mostrar leitura quando a fila ainda carrega', async () => {
    // Arrange
    manterFilaPendente();

    // Act
    renderFaixa();
    await screen.findByText(String(CONCLUIDAS));

    // Assert
    expect(screen.queryByText(LEITURA_DE_ATRASO)).toBeNull();
  });

  it('deve mostrar erro no lugar do cartão quando a fila falha', async () => {
    // Arrange
    responder({ fila: ERRO_DE_REDE });

    // Act
    renderFaixa();

    // Assert
    expect(await screen.findByText('Não foi possível carregar os itens em atraso')).toBeDefined();
  });

  it('deve manter as abertas visíveis quando a fila falha', async () => {
    // Arrange
    responder({ fila: ERRO_DE_REDE });

    // Act
    renderFaixa();
    await screen.findByRole('alert');

    // Assert
    expect(screen.getByText(String(ABERTAS))).toBeDefined();
  });

  it('deve refazer a consulta da fila quando o botão de nova tentativa é acionado', async () => {
    // Arrange
    responder({ fila: ERRO_DE_REDE });
    renderFaixa();
    await screen.findByRole('alert');
    const antes = listar.mock.calls.filter(([filtros]) => filtros.atrasada === true).length;

    // Act
    fireEvent.click(screen.getByRole('button', { name: TENTAR_NOVAMENTE }));

    // Assert
    await waitFor(() =>
      expect(listar.mock.calls.filter(([filtros]) => filtros.atrasada === true)).toHaveLength(
        antes + 1,
      ),
    );
  });
});

describe('FaixaDeIndicadores — concluídas no período', () => {
  it('deve mostrar o total do período atual quando a consulta termina', async () => {
    // Arrange
    responder({ atual: pagina(25), anterior: pagina(20) });

    // Act
    renderFaixa();

    // Assert
    expect(await screen.findByText('25')).toBeDefined();
  });

  it('deve mostrar o número de dias no detalhe quando o período é de 30 dias', async () => {
    // Arrange
    responder({ atual: pagina(25), anterior: pagina(20) });

    // Act
    renderFaixa({ dias: DIAS });

    // Assert
    expect(await screen.findByText('nos últimos 30 dias')).toBeDefined();
  });

  it('deve mostrar a variação percentual quando o período anterior tem 5 ou mais', async () => {
    // Arrange
    responder({ atual: pagina(25), anterior: pagina(20) });

    // Act
    renderFaixa();

    // Assert
    expect(await screen.findByText('+25% contra o período anterior')).toBeDefined();
  });

  it('deve mostrar a diferença absoluta quando o período anterior tem menos de 5', async () => {
    // Arrange
    responder({ atual: pagina(5), anterior: pagina(2) });

    // Act
    renderFaixa();

    // Assert
    expect(await screen.findByText('+3 contra o período anterior')).toBeDefined();
  });

  it('deve mostrar sem dados no período anterior quando o anterior é zero', async () => {
    // Arrange
    responder({ atual: pagina(5), anterior: pagina(0) });

    // Act
    renderFaixa();

    // Assert
    expect(await screen.findByText('sem dados no período anterior')).toBeDefined();
  });

  it('deve não mostrar 0% quando o anterior é zero', async () => {
    // Arrange
    responder({ atual: pagina(5), anterior: pagina(0) });

    // Act
    renderFaixa();
    await screen.findByText('sem dados no período anterior');

    // Assert
    expect(screen.queryByText(/0%/)).toBeNull();
  });

  it('deve avisar Carregando nos dois cartões do período quando a consulta ainda não terminou', async () => {
    // Arrange
    manterPeriodoPendente();

    // Act
    renderFaixa();
    await screen.findByText('Em dia');

    // Assert
    expect(screen.getAllByText(CARREGANDO)).toHaveLength(2);
  });
});

describe('FaixaDeIndicadores — tempo médio', () => {
  it('deve mostrar a duração em horas quando a média passa de uma hora', async () => {
    // Arrange
    responder({ atual: pagina(1, [7200]), anterior: pagina(1, [7200]) });

    // Act
    renderFaixa();

    // Assert
    expect(await screen.findByText('2 h')).toBeDefined();
  });

  it('deve mostrar a duração em minutos quando a média é menor que uma hora', async () => {
    // Arrange
    responder({ atual: pagina(1, [1800]), anterior: pagina(1, [1800]) });

    // Act
    renderFaixa();

    // Assert
    expect(await screen.findByText('30 min')).toBeDefined();
  });

  it('deve mostrar o valor vazio quando nenhum item tem tempo', async () => {
    // Arrange
    responder({ atual: pagina(2, [null, null]), anterior: pagina(0) });

    // Act
    renderFaixa();
    await screen.findByText('sem conclusões no período');

    // Assert
    expect(screen.getAllByText(SEM_VALOR)).toHaveLength(1);
  });

  it('deve mostrar a leitura sem conclusões quando nenhum item tem tempo', async () => {
    // Arrange
    responder({ atual: pagina(2, [null, null]), anterior: pagina(0) });

    // Act
    renderFaixa();

    // Assert
    expect(await screen.findByText('sem conclusões no período')).toBeDefined();
  });

  it('deve mostrar o detalhe da abertura à conclusão quando a média é calculada', async () => {
    // Arrange
    responder({ atual: pagina(1, [UMA_HORA]), anterior: pagina(1, [UMA_HORA]) });

    // Act
    renderFaixa();
    await screen.findByText('1 h');

    // Assert
    expect(screen.getByText('da abertura à conclusão')).toBeDefined();
  });

  it('deve avisar a amostra quando há 130 concluídas e só 100 entram na média', async () => {
    // Arrange
    responder({ atual: pagina(130, new Array<number>(100).fill(UMA_HORA)), anterior: pagina(0) });

    // Act
    renderFaixa();

    // Assert
    expect(await screen.findByText(/média de 100 de 130/)).toBeDefined();
  });

  it('deve mostrar Melhor que o período anterior quando o tempo diminuiu', async () => {
    // Arrange
    responder({ atual: pagina(1, [UMA_HORA]), anterior: pagina(1, [7200]) });

    // Act
    renderFaixa();

    // Assert
    expect(await screen.findByText('Melhor que o período anterior')).toBeDefined();
  });

  it('deve mostrar Pior que o período anterior quando o tempo aumentou', async () => {
    // Arrange
    responder({ atual: pagina(1, [7200]), anterior: pagina(1, [UMA_HORA]) });

    // Act
    renderFaixa();

    // Assert
    expect(await screen.findByText('Pior que o período anterior')).toBeDefined();
  });

  it('deve mostrar sem dados no período anterior quando o anterior não tem tempo', async () => {
    // Arrange
    responder({ atual: pagina(1, [UMA_HORA]), anterior: pagina(2, [null, null]) });

    // Act
    renderFaixa();

    // Assert
    expect(await screen.findByText('sem dados no período anterior')).toBeDefined();
  });
});

describe('FaixaDeIndicadores — falha nos indicadores do período', () => {
  it('deve mostrar um único alerta quando uma das consultas do período falha', async () => {
    // Arrange
    responder({ atual: ERRO_DE_REDE });

    // Act
    renderFaixa();

    // Assert
    expect(await screen.findAllByRole('alert')).toHaveLength(1);
  });

  it('deve mostrar o título do erro dos indicadores quando o período falha', async () => {
    // Arrange
    responder({ anterior: ERRO_DE_REDE });

    // Act
    renderFaixa();

    // Assert
    expect(
      await screen.findByText('Não foi possível carregar os indicadores do período'),
    ).toBeDefined();
  });

  it('deve manter abertas e em atraso visíveis quando o período falha', async () => {
    // Arrange
    responder({ atual: ERRO_DE_REDE });

    // Act
    renderFaixa();
    await screen.findByRole('alert');

    // Assert
    expect(await screen.findByText('Em dia')).toBeDefined();
  });

  it('deve não mostrar os cartões do período quando o período falha', async () => {
    // Arrange
    responder({ atual: ERRO_DE_REDE });

    // Act
    renderFaixa();
    await screen.findByRole('alert');

    // Assert
    expect(screen.queryByText('Tempo médio')).toBeNull();
  });

  it('deve refazer as duas consultas do período quando o botão de nova tentativa é acionado', async () => {
    // Arrange
    responder({ atual: ERRO_DE_REDE });
    renderFaixa();
    await screen.findByRole('alert');
    const antes = chamadasDasConcluidas();

    // Act
    fireEvent.click(screen.getByRole('button', { name: TENTAR_NOVAMENTE }));

    // Assert
    await waitFor(() => expect(chamadasDasConcluidas()).toBe(antes + 2));
  });
});

describe('FaixaDeIndicadores — carregando', () => {
  beforeEach(() => {
    listar.mockImplementation(() => new Promise<Pagina>(() => {}));
  });

  it('deve mostrar o valor vazio nos quatro cartões quando nada carregou', () => {
    // Arrange
    const props: Partial<Props> = { metricas: undefined };

    // Act
    renderFaixa(props);

    // Assert
    expect(screen.getAllByText(SEM_VALOR)).toHaveLength(4);
  });

  it('deve avisar Carregando nos quatro cartões quando nada carregou', () => {
    // Arrange
    const props: Partial<Props> = { metricas: undefined };

    // Act
    renderFaixa(props);

    // Assert
    expect(screen.getAllByText(CARREGANDO)).toHaveLength(4);
  });

  it('deve marcar os quatro cartões como ocupados quando nada carregou', () => {
    // Arrange
    const props: Partial<Props> = { metricas: undefined };

    // Act
    const { container } = renderFaixa(props);

    // Assert
    expect(container.querySelectorAll('[aria-busy="true"]')).toHaveLength(4);
  });
});
