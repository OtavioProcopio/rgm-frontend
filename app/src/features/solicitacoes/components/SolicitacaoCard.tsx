import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

import { cn } from '@/shared/lib/cn';

import { tipoLabel } from '../lib/solicitacaoMessages';
import type { PrioridadeSolicitacao, Solicitacao } from '../types/solicitacaoTypes';
import { SolicitacaoPrioridadeBadge } from './SolicitacaoPrioridadeBadge';
import { SolicitacaoStatusBadge } from './SolicitacaoStatusBadge';

type Props = {
  solicitacao: Solicitacao;
};

const PRIORITY_BORDER: Record<PrioridadeSolicitacao, string> = {
  URGENTE: 'border-l-red-500',
  ALTA: 'border-l-orange-400',
  MEDIA: 'border-l-sky-400',
  BAIXA: 'border-l-slate-300 dark:border-l-slate-600',
};

export function SolicitacaoCard({ solicitacao }: Props) {
  const createdAt = new Date(solicitacao.criadaEm).toLocaleDateString('pt-BR');
  const borderClass = solicitacao.prioridade
    ? PRIORITY_BORDER[solicitacao.prioridade]
    : 'border-l-slate-200 dark:border-l-slate-700';

  return (
    <Link
      to={`/app/solicitacoes/${solicitacao.id}`}
      className={cn(
        'group flex items-center gap-3 rounded-lg border border-slate-200 border-l-4 bg-white p-4',
        'shadow-sm transition-all hover:shadow-md active:scale-[0.99]',
        'dark:border-slate-700 dark:bg-slate-800',
        borderClass,
      )}
    >
      <div className="min-w-0 flex-1">
        {/* Header row */}
        <div className="flex flex-wrap items-center gap-2">
          <SolicitacaoStatusBadge status={solicitacao.status} />
          {solicitacao.prioridade && (
            <SolicitacaoPrioridadeBadge prioridade={solicitacao.prioridade} />
          )}
        </div>

        {/* Título */}
        <p className="mt-2 text-sm font-semibold leading-snug text-slate-900 line-clamp-1 group-hover:text-sky-700 dark:text-white dark:group-hover:text-sky-300">
          {solicitacao.titulo}
        </p>

        {/* Descrição */}
        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
          {solicitacao.descricao}
        </p>

        {/* Footer */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <span>{tipoLabel[solicitacao.tipo]}</span>
          <span aria-hidden>·</span>
          <span>{createdAt}</span>
        </div>
      </div>

      <ChevronRight
        size={18}
        className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-500 dark:text-slate-600"
      />
    </Link>
  );
}
