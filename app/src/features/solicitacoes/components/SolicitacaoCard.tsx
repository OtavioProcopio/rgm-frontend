import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

import { cn } from '@/shared/lib/cn';
import { rotuloDoTipoDeSolicitacao } from '@/shared/lib/rotulos';

import type { PrioridadeSolicitacao, Solicitacao } from '../types/solicitacaoTypes';
import { SolicitacaoPrioridadeBadge } from './SolicitacaoPrioridadeBadge';
import { SolicitacaoStatusBadge } from './SolicitacaoStatusBadge';

type Props = {
  solicitacao: Solicitacao;
};

const PRIORITY_BORDER: Record<PrioridadeSolicitacao, string> = {
  URGENTE: 'border-l-danger',
  ALTA: 'border-l-warning',
  MEDIA: 'border-l-info',
  BAIXA: 'border-l-line-strong',
};

export function SolicitacaoCard({ solicitacao }: Props) {
  const createdAt = new Date(solicitacao.criadaEm).toLocaleDateString('pt-BR');
  const borderClass = solicitacao.prioridade
    ? PRIORITY_BORDER[solicitacao.prioridade]
    : 'border-l-line-strong';

  return (
    <Link
      to={`/app/solicitacoes/${solicitacao.id}`}
      className={cn(
        'group flex items-center gap-3 rounded-lg border border-line border-l-4 bg-surface p-4',
        'shadow-sm transition-all hover:shadow-md active:scale-[0.99]',
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
        <p className="mt-2 text-sm font-semibold leading-snug text-fg line-clamp-1 group-hover:text-accent">
          {solicitacao.titulo}
        </p>

        {/* Descrição */}
        <p className="mt-0.5 line-clamp-1 text-xs text-fg-muted">{solicitacao.descricao}</p>

        {/* Footer */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
          <span>{rotuloDoTipoDeSolicitacao[solicitacao.tipo]}</span>
          <span aria-hidden>·</span>
          <span>{createdAt}</span>
        </div>
      </div>

      <ChevronRight
        size={18}
        className="shrink-0 text-fg-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
      />
    </Link>
  );
}
