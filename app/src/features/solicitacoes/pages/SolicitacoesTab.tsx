import { useState, type JSX } from 'react';

import { ControleSegmentado } from '@/shared/components/ControleSegmentado/ControleSegmentado';

import { DistribuicaoDoTrabalho } from '../components/DistribuicaoDoTrabalho';
import { FaixaDeIndicadores } from '../components/FaixaDeIndicadores';
import { FilaDeAtencao } from '../components/FilaDeAtencao';
import { TendenciaDoPeriodo } from '../components/TendenciaDoPeriodo';
import { useMetricas } from '../hooks/useMetricas';
import { PERIODOS, type PeriodoDoPainel } from '../lib/periodoDoPainel';
import type { MetricasResponse } from '../types/solicitacaoTypes';

const OPCOES_DO_PERIODO = PERIODOS.map((dias) => ({ valor: dias, rotulo: `${dias} dias` }));
const CLASSE_DA_CELULA = 'h-full [&>*]:h-full';

type DadosDasMetricas = {
  metricas: MetricasResponse | undefined;
  metricasErro: boolean;
  onRetryMetricas: () => void;
};

type SeletorProps = { dias: PeriodoDoPainel; onChange: (dias: PeriodoDoPainel) => void };

function SeletorDoPeriodo({ dias, onChange }: SeletorProps): JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <ControleSegmentado
        rotulo="Período"
        opcoes={OPCOES_DO_PERIODO}
        valor={dias}
        onChange={onChange}
      />
    </div>
  );
}

function TendenciaEDistribuicao(props: DadosDasMetricas & { dias: PeriodoDoPainel }): JSX.Element {
  const { dias, ...metricas } = props;
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className={CLASSE_DA_CELULA}>
        <TendenciaDoPeriodo dias={dias} />
      </div>
      <div className={CLASSE_DA_CELULA}>
        <DistribuicaoDoTrabalho {...metricas} />
      </div>
    </div>
  );
}

export function SolicitacoesTab(): JSX.Element {
  const [dias, setDias] = useState<PeriodoDoPainel>(30);
  const { data, isError, refetch } = useMetricas();
  const dados: DadosDasMetricas = {
    metricas: data,
    metricasErro: isError,
    onRetryMetricas: (): void => void refetch(),
  };

  return (
    <div className="space-y-6">
      <SeletorDoPeriodo dias={dias} onChange={setDias} />
      <FilaDeAtencao />
      <FaixaDeIndicadores dias={dias} {...dados} />
      <TendenciaEDistribuicao dias={dias} {...dados} />
    </div>
  );
}
