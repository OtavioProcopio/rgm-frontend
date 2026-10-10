import { AlarmClock, CheckCircle2, FolderOpen, Timer } from 'lucide-react';
import type { ReactNode } from 'react';

import { useFilaDeAtencao, type FilaDeAtencao } from '../hooks/useFilaDeAtencao';
import {
  useIndicadoresDoPeriodo,
  type IndicadoresDoPeriodo,
} from '../hooks/useIndicadoresDoPeriodo';
import {
  leituraDoAtraso,
  leituraDoTempoMedio,
  variacaoDeConcluidas,
  type Leitura,
  type TempoMedio,
} from '../lib/leituraDosIndicadores';
import type { PeriodoDoPainel } from '../lib/periodoDoPainel';
import { KPICard } from '../pages/DashboardKpiCard';
import type { MetricasResponse } from '../types/solicitacaoTypes';

import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { formatarDuracao } from '@/shared/lib/duracao';

type Props = {
  dias: PeriodoDoPainel;
  metricas: MetricasResponse | undefined;
  metricasErro: boolean;
  onRetryMetricas: () => void;
};

const SEM_VALOR = '—';
const DETALHE_DO_TEMPO = 'da abertura à conclusão';
const ERRO_DO_ATRASO = 'Não foi possível carregar os itens em atraso';

function Celula({ carregando, children }: { carregando: boolean; children: ReactNode }) {
  return (
    <div className="h-full [&>div]:h-full" aria-busy={carregando}>
      {children}
      {carregando && <span className="sr-only">Carregando</span>}
    </div>
  );
}

function segundosDe(tempo: TempoMedio | null): number | null {
  return tempo === null ? null : tempo.segundos;
}

function valorDoTempo(tempo: TempoMedio | null): string {
  return tempo === null ? SEM_VALOR : formatarDuracao(tempo.segundos * 1000);
}

function detalheDoTempo(tempo: TempoMedio | null): string {
  if (tempo === null || tempo.amostra === null) return DETALHE_DO_TEMPO;
  const { usados, total } = tempo.amostra;
  return `${DETALHE_DO_TEMPO} · média de ${usados} de ${total}`;
}

function CartaoAbertas(props: Pick<Props, 'metricas' | 'metricasErro' | 'onRetryMetricas'>) {
  const { metricas, metricasErro, onRetryMetricas } = props;
  if (metricasErro) {
    return <ErrorState title="Não foi possível carregar as abertas" onRetry={onRetryMetricas} />;
  }
  return (
    <Celula carregando={metricas === undefined}>
      <KPICard
        icon={FolderOpen}
        label="Abertas"
        value={metricas ? metricas.solicitacoesAbertas : SEM_VALOR}
        subtext="em aberto agora"
        gradient="sky"
      />
    </Celula>
  );
}

function leituraEmAtraso(fila: FilaDeAtencao, metricas?: MetricasResponse): Leitura | undefined {
  if (!metricas || fila.isLoading) return undefined;
  return leituraDoAtraso(fila.total, metricas.solicitacoesAbertas);
}

function CartaoEmAtraso({ fila, metricas }: { fila: FilaDeAtencao; metricas?: MetricasResponse }) {
  if (fila.isError) return <ErrorState title={ERRO_DO_ATRASO} onRetry={fila.refetch} />;
  const leitura = leituraEmAtraso(fila, metricas);
  return (
    <Celula carregando={fila.isLoading}>
      <KPICard
        icon={AlarmClock}
        label="Em atraso"
        value={fila.isLoading ? SEM_VALOR : fila.total}
        subtext="em aberto e fora do prazo"
        gradient="rose"
        leitura={leitura}
      />
    </Celula>
  );
}

type DadosDoPeriodo = {
  concluidas: { atual: number; anterior: number };
  tempoMedio: { atual: TempoMedio | null; anterior: TempoMedio | null };
};

function CartaoConcluidas({ dias, dados }: { dias: number; dados?: DadosDoPeriodo }) {
  const concluidas = dados?.concluidas;
  return (
    <Celula carregando={concluidas === undefined}>
      <KPICard
        icon={CheckCircle2}
        label="Concluídas no período"
        value={concluidas ? concluidas.atual : SEM_VALOR}
        subtext={`nos últimos ${dias} dias`}
        gradient="emerald"
        leitura={concluidas && variacaoDeConcluidas(concluidas.atual, concluidas.anterior)}
      />
    </Celula>
  );
}

function CartaoTempoMedio({ dados }: { dados?: DadosDoPeriodo }) {
  const tempo = dados?.tempoMedio;
  return (
    <Celula carregando={tempo === undefined}>
      <KPICard
        icon={Timer}
        label="Tempo médio"
        value={tempo ? valorDoTempo(tempo.atual) : SEM_VALOR}
        subtext={tempo ? detalheDoTempo(tempo.atual) : DETALHE_DO_TEMPO}
        gradient="purple"
        leitura={tempo && leituraDoTempoMedio(segundosDe(tempo.atual), segundosDe(tempo.anterior))}
      />
    </Celula>
  );
}

type CartoesDoPeriodoProps = { dias: number; indicadores: IndicadoresDoPeriodo };

function CartoesDoPeriodo({ dias, indicadores }: CartoesDoPeriodoProps) {
  const { concluidas, tempoMedio, refetch } = indicadores;
  if (indicadores.isError) {
    return (
      <div className="col-span-2">
        <ErrorState title="Não foi possível carregar os indicadores do período" onRetry={refetch} />
      </div>
    );
  }
  const dados = concluidas && tempoMedio ? { concluidas, tempoMedio } : undefined;
  return (
    <>
      <CartaoConcluidas dias={dias} dados={dados} />
      <CartaoTempoMedio dados={dados} />
    </>
  );
}

export function FaixaDeIndicadores({ dias, metricas, metricasErro, onRetryMetricas }: Props) {
  const fila = useFilaDeAtencao();
  const indicadores = useIndicadoresDoPeriodo(dias);

  return (
    <section aria-label="Indicadores" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <CartaoAbertas
        metricas={metricas}
        metricasErro={metricasErro}
        onRetryMetricas={onRetryMetricas}
      />
      <CartaoEmAtraso fila={fila} metricas={metricas} />
      <CartoesDoPeriodo dias={dias} indicadores={indicadores} />
    </section>
  );
}
