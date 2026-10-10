import { useId, useState } from 'react';
import { Link } from 'react-router';

import {
  useDistribuicaoDoTrabalho,
  type DistribuicaoDoTrabalho as Distribuicao,
  type ParteContada,
} from '@/features/solicitacoes/hooks/useDistribuicaoDoTrabalho';
import {
  VISOES,
  caminhoDoFiltro,
  type VisaoDaDistribuicao,
} from '@/features/solicitacoes/lib/distribuicaoDoTrabalho';
import type { MetricasResponse } from '@/features/solicitacoes/types/solicitacaoTypes';
import { Card } from '@/shared/components/Card/Card';
import { ControleSegmentado } from '@/shared/components/ControleSegmentado/ControleSegmentado';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';

type Props = {
  metricas: MetricasResponse | undefined;
  metricasErro: boolean;
  onRetryMetricas: () => void;
};

const COR_POR_VISAO: Record<VisaoDaDistribuicao, Record<string, string>> = {
  status: { A_FAZER: 'bg-fg-muted', EM_ANDAMENTO: 'bg-info', EM_VALIDACAO: 'bg-warning' },
  tipo: {
    REPARO: 'bg-accent',
    INSPECAO: 'bg-accent',
    REENGENHARIA: 'bg-accent',
    CRIACAO: 'bg-accent',
  },
  prioridade: {
    URGENTE: 'bg-danger',
    ALTA: 'bg-warning',
    MEDIA: 'bg-info',
    BAIXA: 'bg-fg-muted',
  },
};

const OPCOES = VISOES.map((visao) => ({ valor: visao.id, rotulo: visao.rotulo }));
const TITULO_DO_ERRO = 'Não foi possível carregar o trabalho em aberto';

function largura(quantidade: number, maior: number): string {
  return `${Math.round((quantidade / maior) * 100)}%`;
}

type LinhaProps = { visao: VisaoDaDistribuicao; parte: ParteContada; maior: number };

function Barra({ visao, parte, maior }: LinhaProps) {
  return (
    <span className="h-2 flex-1 rounded-full bg-surface-muted">
      <span
        data-barra
        style={{ width: largura(parte.quantidade, maior) }}
        className={`block h-2 rounded-full motion-safe:transition-all ${COR_POR_VISAO[visao][parte.valor]}`}
      />
    </span>
  );
}

function Linha({ visao, parte, maior }: LinhaProps) {
  return (
    <li>
      <Link
        to={caminhoDoFiltro(visao, parte.valor)}
        className="flex items-center gap-3 rounded-md py-1 text-sm hover:bg-surface-muted pointer-coarse:min-h-11"
      >
        <span className="w-28 shrink-0 text-fg">{parte.rotulo}</span>
        <Barra visao={visao} parte={parte} maior={maior} />
        <span className="w-10 shrink-0 text-right tabular-nums text-fg-muted">
          {parte.quantidade}
        </span>
      </Link>
    </li>
  );
}

type ListaProps = { visao: VisaoDaDistribuicao; partes: ParteContada[] };

function Lista({ visao, partes }: ListaProps) {
  const maior = Math.max(1, ...partes.map((parte) => parte.quantidade));
  return (
    <ul className="space-y-1">
      {partes.map((parte) => (
        <Linha key={parte.valor} visao={visao} parte={parte} maior={maior} />
      ))}
    </ul>
  );
}

type CorpoProps = { visao: VisaoDaDistribuicao; distribuicao: Distribuicao } & Pick<
  Props,
  'metricasErro' | 'onRetryMetricas'
>;

function Corpo({ visao, distribuicao, metricasErro, onRetryMetricas }: CorpoProps) {
  if (visao === 'status' && metricasErro) {
    return <ErrorState title={TITULO_DO_ERRO} onRetry={onRetryMetricas} />;
  }
  if (distribuicao.isError) {
    return <ErrorState title={TITULO_DO_ERRO} onRetry={distribuicao.refetch} />;
  }
  if (!distribuicao.partes) {
    return (
      <div role="status">
        <LoadingState title="Carregando a distribuição..." />
      </div>
    );
  }
  return <Lista visao={visao} partes={distribuicao.partes} />;
}

type CabecalhoProps = {
  tituloId: string;
  visao: VisaoDaDistribuicao;
  onChange: (visao: VisaoDaDistribuicao) => void;
};

function Cabecalho({ tituloId, visao, onChange }: CabecalhoProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id={tituloId} className="text-base font-semibold text-fg">
        Trabalho em aberto
      </h2>
      <ControleSegmentado rotulo="Ver por" opcoes={OPCOES} valor={visao} onChange={onChange} />
    </div>
  );
}

export function DistribuicaoDoTrabalho({ metricas, metricasErro, onRetryMetricas }: Props) {
  const [visao, setVisao] = useState<VisaoDaDistribuicao>('status');
  const distribuicao = useDistribuicaoDoTrabalho(visao, metricas);
  const tituloId = useId();
  return (
    <Card as="section" aria-labelledby={tituloId} className="space-y-4 p-5">
      <Cabecalho tituloId={tituloId} visao={visao} onChange={setVisao} />
      <Corpo
        visao={visao}
        distribuicao={distribuicao}
        metricasErro={metricasErro}
        onRetryMetricas={onRetryMetricas}
      />
    </Card>
  );
}
