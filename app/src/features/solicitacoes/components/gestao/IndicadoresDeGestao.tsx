import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';

import { useIndicadoresDeGestao } from '../../hooks/useIndicadoresDeGestao';
import type { PeriodoDoPainel } from '../../lib/periodoDoPainel';
import { BlocoDeBacklog } from './BlocoDeBacklog';
import { BlocoDeCarga } from './BlocoDeCarga';
import { BlocoDeEtapas } from './BlocoDeEtapas';
import { BlocoDePrazo } from './BlocoDePrazo';
import { BlocoDeReincidentes } from './BlocoDeReincidentes';
import { BlocoDeResolucao } from './BlocoDeResolucao';
import { BlocoPorMaquina } from './BlocoPorMaquina';

type Props = { dias: PeriodoDoPainel };

/** Indicadores de gestão do período: uma consulta, os blocos saem todos dela. */
export function IndicadoresDeGestao({ dias }: Props) {
  const { data, isLoading, isError, refetch } = useIndicadoresDeGestao(dias);

  if (isError) {
    return (
      <ErrorState
        title="Não foi possível carregar os indicadores de gestão"
        onRetry={() => void refetch()}
      />
    );
  }
  if (isLoading || !data) return <LoadingState title="Carregando indicadores de gestão..." />;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <BlocoDePrazo prazo={data.prazo} dias={dias} />
      <BlocoDeResolucao resolucao={data.resolucao} dias={dias} />
      <BlocoDeBacklog backlog={data.backlog} />
      <BlocoDeEtapas etapas={data.etapas} devolucao={data.devolucao} dias={dias} />
      <BlocoPorMaquina maquinas={data.porMaquina} />
      <BlocoDeReincidentes reincidentes={data.reincidentes} dias={dias} />
      <BlocoDeCarga carga={data.carga} />
    </div>
  );
}
