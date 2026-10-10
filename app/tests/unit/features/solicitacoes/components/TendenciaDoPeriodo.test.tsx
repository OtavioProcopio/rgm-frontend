/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';

import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';
import { TendenciaDoPeriodo } from '@/features/solicitacoes/components/TendenciaDoPeriodo';
import type {
  HistoricoMetricas,
  PontoDeSerie,
} from '@/features/solicitacoes/types/solicitacaoTypes';
import { createQueryWrapper } from '@tests/support/queryWrapper';

const PRIMEIRO: PontoDeSerie = {
  periodo: '2026-01-01',
  total: 9,
  abertas: 7,
  concluidas: 1,
  canceladas: 1,
  slaMediaHoras: 5,
};
const SEGUNDO: PontoDeSerie = {
  periodo: '2026-01-02',
  total: 5,
  abertas: 2,
  concluidas: 3,
  canceladas: 0,
  slaMediaHoras: 6,
};
const ULTIMO: PontoDeSerie = {
  periodo: '2026-01-03',
  total: 4,
  abertas: 1,
  concluidas: 2,
  canceladas: 1,
  slaMediaHoras: 7,
};
const HISTORICO: HistoricoMetricas = {
  series: [PRIMEIRO, SEGUNDO, ULTIMO],
  slaGlobalMediaHoras: 6,
  periodoLabel: 'Últimos 30 dias',
};
const SEM_MOVIMENTO: HistoricoMetricas = {
  ...HISTORICO,
  series: [{ ...PRIMEIRO, abertas: 0, concluidas: 0 }],
};
const TRINTA_DIAS: PontoDeSerie[] = Array.from({ length: 30 }, (_, indice: number) => ({
  ...SEGUNDO,
  periodo: `2026-01-${String(indice + 1).padStart(2, '0')}`,
}));

let obterHistorico: MockInstance<typeof solicitacoesApi.obterHistoricoMetricas>;

const desenhar = (dias: 7 | 30 | 90 = 30) => {
  const { QueryWrapper } = createQueryWrapper();
  return render(<TendenciaDoPeriodo dias={dias} />, { wrapper: QueryWrapper });
};
const grupos = () => screen.findAllByRole('img');
const textoDas = (celulas: HTMLElement[]) => celulas.map((celula) => celula.textContent);

beforeEach(() => {
  obterHistorico = vi.spyOn(solicitacoesApi, 'obterHistoricoMetricas');
  obterHistorico.mockResolvedValue(HISTORICO);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('TendenciaDoPeriodo — barras', () => {
  it('deve desenhar um grupo por ponto quando a série chega', async () => {
    // Arrange
    obterHistorico.mockResolvedValue(HISTORICO);

    // Act
    desenhar();
    const desenhados = await grupos();

    // Assert
    expect(desenhados).toHaveLength(HISTORICO.series.length);
  });

  it('deve desenhar duas barras em cada grupo quando a série chega', async () => {
    // Arrange
    obterHistorico.mockResolvedValue(HISTORICO);

    // Act
    desenhar();
    const [grupo] = await grupos();

    // Assert
    expect(grupo.children).toHaveLength(2);
  });

  it('deve dar às barras a altura proporcional ao topo do eixo quando desenha o grupo', async () => {
    // Arrange
    obterHistorico.mockResolvedValue(HISTORICO);

    // Act
    desenhar();
    const [grupo] = await grupos();
    const alturas = [...grupo.children].map((barra) => (barra as HTMLElement).style.height);

    // Assert
    expect(alturas).toEqual(['87.5%', '12.5%']);
  });

  it('deve rotular o grupo com abertas e concluídas do ponto quando a série chega', async () => {
    // Arrange
    obterHistorico.mockResolvedValue(HISTORICO);

    // Act
    desenhar();
    const [grupo] = await grupos();

    // Assert
    expect(grupo.getAttribute('aria-label')).toBe(
      '2026-01-01: 9 criadas, 7 ainda abertas, 1 concluída',
    );
  });

  it('deve resumir o gráfico num grupo rotulado quando a série chega', async () => {
    // Arrange
    obterHistorico.mockResolvedValue(HISTORICO);

    // Act
    desenhar();
    await grupos();

    // Assert
    expect(screen.getByRole('group').getAttribute('aria-label')).toBe(
      'Gráfico de tendência dos últimos 30 dias',
    );
  });
});

describe('TendenciaDoPeriodo — eixos', () => {
  it('deve mostrar as três marcas do eixo quando o maior valor é 7', async () => {
    // Arrange
    obterHistorico.mockResolvedValue(HISTORICO);

    // Act
    desenhar();
    await grupos();
    const marcas = within(screen.getByRole('list', { name: 'Escala do gráfico' }));

    // Assert
    expect(textoDas(marcas.getAllByRole('listitem'))).toEqual(['0', '4', '8']);
  });

  it('deve rotular só o último ponto com Hoje quando o período é de 30 dias', async () => {
    // Arrange
    const dias = 30;
    obterHistorico.mockResolvedValue(HISTORICO);

    // Act
    desenhar(dias);
    await grupos();

    // Assert
    expect(screen.getAllByText('Hoje')).toHaveLength(1);
  });

  it('deve rotular só o último ponto com Esta semana quando o período é de 90 dias', async () => {
    // Arrange
    const dias = 90;
    obterHistorico.mockResolvedValue(HISTORICO);

    // Act
    desenhar(dias);
    await grupos();

    // Assert
    expect([
      screen.getAllByText('Esta semana').length,
      screen.queryAllByText('Hoje').length,
    ]).toEqual([1, 0]);
  });

  it('deve rotular o primeiro ponto com a data quando há mais de um', async () => {
    // Arrange
    obterHistorico.mockResolvedValue(HISTORICO);

    // Act
    desenhar();
    await grupos();
    const grafico = within(screen.getByRole('group'));

    // Assert
    expect(grafico.getByText(PRIMEIRO.periodo).textContent).toBe(PRIMEIRO.periodo);
  });

  it('deve mostrar no máximo seis rótulos de data quando a série tem 30 pontos', async () => {
    // Arrange
    obterHistorico.mockResolvedValue({ ...HISTORICO, series: TRINTA_DIAS });

    // Act
    desenhar();
    await grupos();
    const datas = within(screen.getByRole('group')).getAllByText(/^2026-01-\d{2}$/);

    // Assert
    expect(datas.length).toBeLessThanOrEqual(6);
  });
});

describe('TendenciaDoPeriodo — valores ao focar', () => {
  it('deve mostrar o valor do ponto quando o grupo recebe o foco do teclado', async () => {
    // Arrange
    desenhar();
    await grupos();

    // Act
    await userEvent.tab();

    // Assert
    expect(screen.getByRole('tooltip').textContent).toBe(
      '2026-01-01: 9 criadas, 7 ainda abertas, 1 concluída',
    );
  });

  it('deve mostrar o valor do ponto seguinte quando o foco passa para o próximo grupo', async () => {
    // Arrange
    desenhar();
    await grupos();
    await userEvent.tab();

    // Act
    await userEvent.tab();

    // Assert
    expect(screen.getByRole('tooltip').textContent).toBe(
      '2026-01-02: 5 criadas, 2 ainda abertas, 3 concluídas',
    );
  });

  it('deve mostrar o valor do ponto quando o mouse passa sobre o grupo', async () => {
    // Arrange
    desenhar();
    const [grupo] = await grupos();

    // Act
    await userEvent.hover(grupo);

    // Assert
    expect(screen.getByRole('tooltip').textContent).toBe(
      '2026-01-01: 9 criadas, 7 ainda abertas, 1 concluída',
    );
  });

  it('deve esconder o valor do ponto quando o mouse sai do grupo', async () => {
    // Arrange
    desenhar();
    const [grupo] = await grupos();
    await userEvent.hover(grupo);

    // Act
    await userEvent.unhover(grupo);

    // Assert
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});

describe('TendenciaDoPeriodo — legenda e tabela', () => {
  it('deve explicar as abertas como criadas no dia que hoje estão abertas quando a série chega', async () => {
    // Arrange
    obterHistorico.mockResolvedValue(HISTORICO);

    // Act
    desenhar();
    await grupos();

    // Assert
    expect(
      screen.getByText('Abertas: criadas neste dia que hoje estão abertas').textContent,
    ).toContain('criadas neste dia que hoje estão abertas');
  });

  it('deve explicar as concluídas como criadas no dia que hoje estão concluídas quando a série chega', async () => {
    // Arrange
    obterHistorico.mockResolvedValue(HISTORICO);

    // Act
    desenhar();
    await grupos();

    // Assert
    expect(
      screen.getByText('Concluídas: criadas neste dia que hoje estão concluídas').textContent,
    ).toContain('criadas neste dia que hoje estão concluídas');
  });

  it('deve mostrar o rótulo do período da API quando a série chega', async () => {
    // Arrange
    obterHistorico.mockResolvedValue(HISTORICO);

    // Act
    desenhar();
    const rotulo = await screen.findByText(HISTORICO.periodoLabel);

    // Assert
    expect(rotulo.textContent).toBe('Últimos 30 dias');
  });

  it('deve começar com a tabela de valores fechada quando não há escolha guardada', async () => {
    // Arrange
    localStorage.clear();
    desenhar();

    // Act
    const botao = await screen.findByRole('button', { name: /Ver valores em tabela/ });

    // Assert
    expect(botao.getAttribute('aria-expanded')).toBe('false');
  });

  it('deve listar na tabela os cabeçalhos da série quando a série chega', async () => {
    // Arrange
    obterHistorico.mockResolvedValue(HISTORICO);

    // Act
    desenhar();
    const tabela = await screen.findByRole('table', { hidden: true });
    const cabecalhos = within(tabela).getAllByRole('columnheader', { hidden: true });

    // Assert
    expect(textoDas(cabecalhos)).toEqual([
      'Período',
      'Criadas',
      'Abertas',
      'Concluídas',
      'Canceladas',
    ]);
  });

  it('deve listar na tabela os mesmos números da série quando a série chega', async () => {
    // Arrange
    obterHistorico.mockResolvedValue(HISTORICO);

    // Act
    desenhar();
    const tabela = await screen.findByRole('table', { hidden: true });
    const celulas = within(tabela).getAllByRole('row', { hidden: true })[1];

    // Assert
    expect(textoDas(within(celulas).getAllByRole('cell', { hidden: true }))).toEqual([
      PRIMEIRO.periodo,
      String(PRIMEIRO.total),
      String(PRIMEIRO.abertas),
      String(PRIMEIRO.concluidas),
      String(PRIMEIRO.canceladas),
    ]);
  });
});

describe('TendenciaDoPeriodo — estados', () => {
  it('deve explicar o vazio quando não há solicitação aberta nem concluída', async () => {
    // Arrange
    obterHistorico.mockResolvedValue(SEM_MOVIMENTO);
    const aviso = 'Nenhuma solicitação aberta ou concluída nos últimos 30 dias';

    // Act
    desenhar();
    const cartao = await screen.findByRole('region', { name: 'Tendência' });

    // Assert
    expect(await within(cartao).findByText(aviso)).not.toBeNull();
  });

  it('deve omitir o eixo quando não há movimento', async () => {
    // Arrange
    obterHistorico.mockResolvedValue(SEM_MOVIMENTO);

    // Act
    desenhar();
    await screen.findByText(/^Nenhuma solicitação aberta ou concluída/);

    // Assert
    expect(screen.queryByRole('list', { name: 'Escala do gráfico' })).toBeNull();
  });

  it('deve anunciar o carregamento quando a série ainda não chegou', () => {
    // Arrange
    obterHistorico.mockReturnValue(new Promise(() => undefined));

    // Act
    desenhar();

    // Assert
    expect(screen.getByRole('status').textContent).toBe('Carregando a tendência...');
  });

  it('deve avisar do erro quando a consulta falha', async () => {
    // Arrange
    obterHistorico.mockRejectedValue(new Error('falha'));

    // Act
    desenhar();
    const alerta = await screen.findByRole('alert');

    // Assert
    expect(alerta.textContent).toContain('Não foi possível carregar a tendência');
  });

  it('deve refazer a chamada quando o usuário pede para tentar novamente', async () => {
    // Arrange
    obterHistorico.mockRejectedValueOnce(new Error('falha'));
    desenhar();
    await screen.findByRole('alert');

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await grupos();

    // Assert
    expect(obterHistorico).toHaveBeenCalledTimes(2);
  });
});

describe('TendenciaDoPeriodo — período e movimento', () => {
  it('deve consultar o histórico do período recebido quando monta', async () => {
    // Arrange
    const dias = 30;
    obterHistorico.mockResolvedValue(HISTORICO);

    // Act
    desenhar(dias);
    await grupos();

    // Assert
    expect(obterHistorico).toHaveBeenCalledExactlyOnceWith(30, undefined);
  });

  it('deve consultar de novo com 7 dias quando o período recebido muda', async () => {
    // Arrange
    const { rerender } = desenhar(30);
    await grupos();

    // Act
    rerender(<TendenciaDoPeriodo dias={7} />);
    await screen.findByRole('group', { name: 'Gráfico de tendência dos últimos 7 dias' });

    // Assert
    expect(obterHistorico).toHaveBeenLastCalledWith(7, undefined);
  });

  it('deve evitar animação contínua quando o gráfico é desenhado', async () => {
    // Arrange
    obterHistorico.mockResolvedValue(HISTORICO);

    // Act
    const { container } = desenhar();
    await grupos();

    // Assert
    expect(container.innerHTML).not.toContain('animate-');
  });
});
