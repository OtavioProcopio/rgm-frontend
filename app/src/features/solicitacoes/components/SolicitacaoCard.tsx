import { Link } from 'react-router';

import { tipoLabel } from '../lib/solicitacaoMessages';
import type { Solicitacao } from '../types/solicitacaoTypes';
import { SolicitacaoPrioridadeBadge } from './SolicitacaoPrioridadeBadge';
import { SolicitacaoStatusBadge } from './SolicitacaoStatusBadge';

type Props = {
  solicitacao: Solicitacao;
};

export function SolicitacaoCard({ solicitacao }: Props) {
  const createdAt = new Date(solicitacao.criadaEm).toLocaleDateString('pt-BR');

  return (
    <Link
      to={`/app/solicitacoes/${solicitacao.id}`}
      className="block rounded-md border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{solicitacao.titulo}</p>
        <div className="flex flex-wrap gap-2">
          <SolicitacaoStatusBadge status={solicitacao.status} />
          <SolicitacaoPrioridadeBadge prioridade={solicitacao.prioridade} />
        </div>
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
        {solicitacao.descricao}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span>{tipoLabel[solicitacao.tipo]}</span>
        <span>•</span>
        <span>Aberta em {createdAt}</span>
      </div>
    </Link>
  );
}
