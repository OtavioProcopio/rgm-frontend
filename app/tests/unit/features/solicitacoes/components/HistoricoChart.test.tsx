/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HistoricoChart } from '@/features/solicitacoes/components/HistoricoChart';
import { useHistoricoMetricas } from '@/features/solicitacoes/hooks/useHistoricoMetricas';
import type { HistoricoMetricas } from '@/features/solicitacoes/types/solicitacaoTypes';

vi.mock('@/features/solicitacoes/hooks/useHistoricoMetricas', () => ({
  useHistoricoMetricas: vi.fn(),
}));

type Consulta = ReturnType<typeof useHistoricoMetricas>;

const PONTO = {
  periodo: '2026-01-05',
  total: 10,
  abertas: 5,
  concluidas: 3,
  canceladas: 2,
  slaMediaHoras: 12,
};
const HISTORICO: HistoricoMetricas = {
  series: [PONTO],
  slaGlobalMediaHoras: 18,
  periodoLabel: 'Últimos 30 dias',
};
const PERIODO_INICIAL = 30;
const OUTRO_PERIODO = 90;

/** Partes da barra, na ordem em que são desenhadas, com o papel de cada série. */
const SERIES = [
  { serie: 'concluídas', indice: 0, rotulo: 'Concluídas', papel: 'bg-success' },
  { serie: 'canceladas', indice: 1, rotulo: 'Canceladas', papel: 'bg-danger' },
  { serie: 'abertas', indice: 2, rotulo: 'Abertas', papel: 'bg-accent' },
] as const;
const QUANTIDADES = [PONTO.concluidas, PONTO.canceladas, PONTO.abertas];

const classes = (elemento: Element) => elemento.className.split(' ');
const consulta = (estado: Partial<Consulta>) =>
  ({ data: undefined, isLoading: false, isError: false, ...estado }) as Consulta;
const partesDaBarra = (container: HTMLElement) =>
  [
    ...container.querySelector(`[title^="${PONTO.periodo}"]`)!.firstElementChild!.children,
  ] as HTMLElement[];
const botaoDoPeriodo = (dias: number) => screen.getByRole('button', { name: `${dias} dias` });

beforeEach(() => {
  vi.mocked(useHistoricoMetricas).mockReturnValue(consulta({ data: HISTORICO }));
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('HistoricoChart', () => {
  it('deve pedir o histórico dos últimos 30 dias quando abre', () => {
    // Act
    render(<HistoricoChart />);

    // Assert
    expect(vi.mocked(useHistoricoMetricas).mock.calls).toEqual([[PERIODO_INICIAL]]);
  });

  it('deve pedir o histórico do período escolhido quando o período é trocado', async () => {
    // Arrange
    render(<HistoricoChart />);

    // Act
    await userEvent.click(botaoDoPeriodo(OUTRO_PERIODO));

    // Assert
    expect(vi.mocked(useHistoricoMetricas).mock.lastCall).toEqual([OUTRO_PERIODO]);
  });

  it('deve mostrar o período e a média do prazo quando o histórico chega', () => {
    // Arrange
    const esperado = `${HISTORICO.periodoLabel} · SLA médio ${HISTORICO.slaGlobalMediaHoras}h`;

    // Act
    render(<HistoricoChart />);

    // Assert
    expect(screen.getByText(esperado).textContent).toBe(esperado);
  });

  it.each(SERIES)(
    'deve desenhar a parte das $serie na proporção do total quando o período tem solicitações',
    ({ indice }) => {
      // Arrange
      const esperado = `${(QUANTIDADES[indice] / PONTO.total) * 100}%`;

      // Act
      const { container } = render(<HistoricoChart />);

      // Assert
      expect(partesDaBarra(container)[indice].style.height).toBe(esperado);
    },
  );

  it('deve avisar que está carregando quando o histórico ainda não chegou', () => {
    // Arrange
    vi.mocked(useHistoricoMetricas).mockReturnValue(consulta({ isLoading: true }));

    // Act
    render(<HistoricoChart />);

    // Assert
    expect(screen.getByText('Carregando histórico...').tagName).toBe('P');
  });

  it('deve avisar que não há dados quando o período não tem solicitações', () => {
    // Arrange
    vi.mocked(useHistoricoMetricas).mockReturnValue(
      consulta({ data: { ...HISTORICO, series: [] } }),
    );

    // Act
    render(<HistoricoChart />);

    // Assert
    expect(screen.getByText('Sem dados no período.').tagName).toBe('P');
  });
});

describe('HistoricoChart — cores por papel', () => {
  it.each(SERIES)('deve usar $papel na parte da barra das $serie', ({ indice, papel }) => {
    // Act
    const { container } = render(<HistoricoChart />);

    // Assert
    expect(classes(partesDaBarra(container)[indice])).toContain(papel);
  });

  it.each(SERIES)('deve usar $papel na legenda das $serie', ({ rotulo, papel }) => {
    // Act
    render(<HistoricoChart />);

    // Assert
    expect(classes(screen.getByText(rotulo).firstElementChild!)).toContain(papel);
  });

  it('deve usar o texto secundário na legenda quando o gráfico é mostrado', () => {
    // Act
    render(<HistoricoChart />);
    const legenda = screen.getByText(SERIES[0].rotulo).parentElement!;

    // Assert
    expect(classes(legenda)).toContain('text-fg-muted');
  });

  it('deve usar o destaque cheio no botão do período em uso', () => {
    // Act
    render(<HistoricoChart />);

    // Assert
    expect(classes(botaoDoPeriodo(PERIODO_INICIAL))).toEqual(
      expect.arrayContaining(['bg-accent', 'text-on-accent']),
    );
  });

  it('deve usar o texto secundário no botão de um período que não está em uso', () => {
    // Act
    render(<HistoricoChart />);

    // Assert
    expect(classes(botaoDoPeriodo(OUTRO_PERIODO))).toContain('text-fg-muted');
  });

  it('deve usar a superfície e a borda de divisória no cartão do gráfico', () => {
    // Act
    const { container } = render(<HistoricoChart />);

    // Assert
    expect(classes(container.firstElementChild!)).toEqual(
      expect.arrayContaining(['bg-surface', 'border-line']),
    );
  });

  it('deve usar o texto de perigo quando o histórico não pôde ser carregado', () => {
    // Arrange
    vi.mocked(useHistoricoMetricas).mockReturnValue(consulta({ isError: true }));

    // Act
    render(<HistoricoChart />);

    // Assert
    expect(classes(screen.getByText('Não foi possível carregar o histórico.'))).toContain(
      'text-danger-fg',
    );
  });
});
