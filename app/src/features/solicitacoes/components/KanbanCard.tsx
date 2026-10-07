import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRightCircle, ExternalLink, Eye, PackagePlus, Settings2, Wrench } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

import { acaoDoMovimento, proximoStatus, rotuloDaAcao } from '../lib/acoesSolicitacao';
import { idadeEmDias, situacaoDoPrazo, type TomDoPrazo } from '../lib/prazoSolicitacao';
import { ROTULO_DA_RELACAO, type RelacaoDoOperador } from '../lib/relacaoDoOperador';
import type { Solicitacao, TipoSolicitacao } from '../types/solicitacaoTypes';
import { SolicitacaoPrioridadeBadge } from './SolicitacaoPrioridadeBadge';

type Props = {
  solicitacao: Solicitacao;
  isDraggable: boolean;
  canAdvance: boolean;
  /** Relação do operador com a solicitação; ausente para quem vê todas. */
  relacao?: RelacaoDoOperador | null;
  onDragStart: (s: Solicitacao) => void;
  onAdvance: (s: Solicitacao) => void;
};

const TIPO_CONFIG: Record<
  TipoSolicitacao,
  { label: string; cls: string; Icon: React.ElementType }
> = {
  REPARO: {
    label: 'Reparo',
    cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    Icon: Wrench,
  },
  INSPECAO: {
    label: 'Inspeção',
    cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    Icon: Eye,
  },
  REENGENHARIA: {
    label: 'Reengenharia',
    cls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    Icon: Settings2,
  },
  CRIACAO: {
    label: 'Criação de modelo',
    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Icon: PackagePlus,
  },
};

const PRIORITY_BORDER: Record<string, string> = {
  URGENTE: 'border-l-red-500',
  ALTA: 'border-l-orange-400',
  MEDIA: 'border-l-sky-400',
  BAIXA: 'border-l-slate-300 dark:border-l-slate-600',
};

const TOM_DO_PRAZO: Record<TomDoPrazo, string> = {
  atraso: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  atencao: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  neutro: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  ok: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
};

function PrazoBadge({ solicitacao, agora }: { solicitacao: Solicitacao; agora: number }) {
  const situacao = situacaoDoPrazo(solicitacao, agora);
  if (!situacao) return null;
  return (
    <span
      className={cn(
        'shrink-0 whitespace-nowrap rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums',
        TOM_DO_PRAZO[situacao.tom],
      )}
    >
      {situacao.rotulo}
    </span>
  );
}

function AgeBadge({ solicitacao, agora }: { solicitacao: Solicitacao; agora: number }) {
  const days = idadeEmDias(solicitacao, agora);
  if (!days) return null;
  return (
    <span
      className={cn(
        'shrink-0 text-xs font-semibold tabular-nums',
        days > 7
          ? 'text-red-600 dark:text-red-400'
          : days > 3
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-slate-500 dark:text-slate-400',
      )}
      title={`Aberta há ${days} dias`}
    >
      {days}d
    </span>
  );
}

/** Área de toque de 44 px em tela de toque; no computador o card continua denso. */
const CONTROLE_DO_CARD =
  'inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors pointer-coarse:min-h-11 pointer-coarse:min-w-11';

/** Nome da ação que avançar o card representa, para o botão dizer o que faz. */
function rotuloDeAvancar(solicitacao: Solicitacao): string {
  const proximo = proximoStatus(solicitacao.status);
  const acao = proximo ? acaoDoMovimento(solicitacao.status, proximo) : null;
  return acao ? rotuloDaAcao(acao) : 'Avançar para a próxima etapa';
}

export function KanbanCard({
  solicitacao,
  isDraggable,
  canAdvance,
  relacao,
  onDragStart,
  onAdvance,
}: Props) {
  const tipo = TIPO_CONFIG[solicitacao.tipo];
  const { Icon } = tipo;
  const [agora] = useState(() => Date.now());
  const avancar = rotuloDeAvancar(solicitacao);
  const criadaEmFormatada = new Date(solicitacao.criadaEm).toLocaleDateString('pt-BR');
  const borderClass = solicitacao.prioridade
    ? PRIORITY_BORDER[solicitacao.prioridade]
    : 'border-l-slate-200 dark:border-l-slate-700';

  return (
    <div
      draggable={isDraggable}
      onDragStart={isDraggable ? (e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(solicitacao);
      } : undefined}
      className={cn(
        'group rounded-lg border border-slate-200 border-l-4 bg-white shadow-sm',
        'transition-all hover:shadow-md active:opacity-50',
        isDraggable && 'lg:cursor-grab lg:active:cursor-grabbing',
        'dark:border-slate-700 dark:bg-slate-800',
        borderClass,
      )}
    >
      <div className="p-3">
        {/* Tipo + age */}
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium',
              tipo.cls,
            )}
          >
            <Icon size={10} />
            {tipo.label}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            <time
              dateTime={solicitacao.criadaEm}
              title={`Aberta em ${criadaEmFormatada}`}
              className="text-xs text-slate-500 dark:text-slate-400"
            >
              {criadaEmFormatada}
            </time>
            <AgeBadge solicitacao={solicitacao} agora={agora} />
          </div>
        </div>

        {relacao ? (
          <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            {ROTULO_DA_RELACAO[relacao]}
          </p>
        ) : null}

        {/* Título */}
        <p className="mt-2 text-sm font-semibold leading-snug text-slate-900 line-clamp-2 dark:text-white">
          {solicitacao.titulo}
        </p>

        {/* Descrição */}
        {solicitacao.descricao && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {solicitacao.descricao}
          </p>
        )}

        {/* Rodapé: prioridade + SLA + link */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {solicitacao.prioridade ? (
              <SolicitacaoPrioridadeBadge prioridade={solicitacao.prioridade} />
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400">Sem prioridade</span>
            )}
            <PrazoBadge solicitacao={solicitacao} agora={agora} />
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {canAdvance ? (
              <button
                type="button"
                title={avancar}
                aria-label={avancar}
                onClick={(e) => {
                  e.stopPropagation();
                  onAdvance(solicitacao);
                }}
                className={cn(
                  CONTROLE_DO_CARD,
                  'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40',
                )}
              >
                <ArrowRightCircle size={14} aria-hidden />
              </button>
            ) : null}
            <Link
              to={`/app/solicitacoes/${solicitacao.id}`}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Ver solicitação: ${solicitacao.titulo}`}
              className={cn(
                CONTROLE_DO_CARD,
                'bg-slate-50 text-sky-700 hover:bg-sky-50 hover:text-sky-800 dark:bg-slate-700 dark:text-sky-300 dark:hover:bg-sky-900/30',
              )}
            >
              Ver
              <ExternalLink size={10} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
