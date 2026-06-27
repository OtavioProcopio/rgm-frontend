import { ArrowRight, MessageSquare, Paperclip, Plus, User } from 'lucide-react';

import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { cn } from '@/shared/lib/cn';

import { statusLabel } from '../lib/solicitacaoMessages';
import type { AtividadeSolicitacao, TipoAtividadeSolicitacao } from '../types/solicitacaoTypes';

type Props = {
  atividades: AtividadeSolicitacao[];
  isLoading?: boolean;
};

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const TIPO_CONFIG: Record<
  TipoAtividadeSolicitacao,
  { label: string; iconClass: string; dotClass: string; Icon: React.ElementType }
> = {
  ABERTURA: {
    label: 'Solicitação aberta',
    iconClass: 'text-sky-600 dark:text-sky-400',
    dotClass: 'bg-sky-100 dark:bg-sky-900/40',
    Icon: Plus,
  },
  ATRIBUICAO: {
    label: 'Responsável atribuído',
    iconClass: 'text-violet-600 dark:text-violet-400',
    dotClass: 'bg-violet-100 dark:bg-violet-900/40',
    Icon: User,
  },
  MUDANCA_STATUS: {
    label: 'Status alterado',
    iconClass: 'text-amber-600 dark:text-amber-400',
    dotClass: 'bg-amber-100 dark:bg-amber-900/40',
    Icon: ArrowRight,
  },
  COMENTARIO: {
    label: 'Comentário',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    dotClass: 'bg-emerald-100 dark:bg-emerald-900/40',
    Icon: MessageSquare,
  },
  EVIDENCIA_ADICIONADA: {
    label: 'Evidência anexada',
    iconClass: 'text-slate-600 dark:text-slate-400',
    dotClass: 'bg-slate-100 dark:bg-slate-700',
    Icon: Paperclip,
  },
};

export function SolicitacaoTimeline({ atividades, isLoading }: Props) {
  if (isLoading) return <LoadingState title="Carregando histórico..." />;

  if (atividades.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma atividade registrada.</p>
    );
  }

  return (
    <ol className="space-y-1">
      {atividades.map((atividade, i) => {
        const config = TIPO_CONFIG[atividade.tipo];
        const { Icon } = config;
        const isLast = i === atividades.length - 1;

        return (
          <li key={atividade.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  config.dotClass,
                )}
              >
                <Icon size={14} className={config.iconClass} />
              </div>
              {!isLast && <div className="mt-1 w-px flex-1 bg-slate-200 dark:bg-slate-700" />}
            </div>
            <div className={cn('min-w-0 pb-4', isLast && 'pb-0')}>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {config.label}
                  {atividade.tipo === 'MUDANCA_STATUS' &&
                    atividade.deStatus &&
                    atividade.paraStatus &&
                    `: ${statusLabel[atividade.deStatus]} → ${statusLabel[atividade.paraStatus]}`}
                </p>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {atividade.autorNome}
                </span>
                <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
                <time className="text-xs text-slate-400 dark:text-slate-500">
                  {formatDateTime(atividade.criadaEm)}
                </time>
              </div>
              {atividade.comentario ? (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {atividade.comentario}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
