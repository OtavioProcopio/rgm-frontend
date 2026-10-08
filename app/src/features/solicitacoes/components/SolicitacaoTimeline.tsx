import { ArrowRight, MessageSquare, Paperclip, Plus, User } from 'lucide-react';

import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { cn } from '@/shared/lib/cn';
import { rotuloDoStatus, rotuloDoTipoDeAtividade } from '@/shared/lib/rotulos';

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

/** Marcador de cada tipo de atividade; o texto vem de `rotuloDoTipoDeAtividade`. */
const TIPO_CONFIG: Record<
  TipoAtividadeSolicitacao,
  { iconClass: string; dotClass: string; Icon: React.ElementType }
> = {
  ABERTURA: { iconClass: 'text-info-fg', dotClass: 'bg-info-soft', Icon: Plus },
  ATRIBUICAO: { iconClass: 'text-accent', dotClass: 'bg-surface-muted', Icon: User },
  MUDANCA_STATUS: { iconClass: 'text-warning-fg', dotClass: 'bg-warning-soft', Icon: ArrowRight },
  COMENTARIO: { iconClass: 'text-success-fg', dotClass: 'bg-success-soft', Icon: MessageSquare },
  EVIDENCIA_ADICIONADA: {
    iconClass: 'text-fg-muted',
    dotClass: 'bg-surface-muted',
    Icon: Paperclip,
  },
};

export function SolicitacaoTimeline({ atividades, isLoading }: Props) {
  if (isLoading) return <LoadingState title="Carregando histórico..." />;

  if (atividades.length === 0) {
    return <p className="text-sm text-fg-muted">Nenhuma atividade registrada.</p>;
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
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                  config.dotClass,
                )}
              >
                <Icon size={12} className={config.iconClass} />
              </div>
              {!isLast && <div className="mt-1 w-px flex-1 bg-line" />}
            </div>
            <div className={cn('min-w-0 pb-3', isLast && 'pb-0')}>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-sm font-medium text-fg">
                  {rotuloDoTipoDeAtividade[atividade.tipo]}
                  {atividade.tipo === 'MUDANCA_STATUS' &&
                    atividade.deStatus &&
                    atividade.paraStatus &&
                    `: ${rotuloDoStatus[atividade.deStatus]} → ${rotuloDoStatus[atividade.paraStatus]}`}
                </p>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-xs font-medium text-fg-muted">{atividade.autorNome}</span>
                <span className="text-xs text-fg-muted">·</span>
                <time className="text-xs text-fg-muted">{formatDateTime(atividade.criadaEm)}</time>
              </div>
              {atividade.comentario ? (
                <p className="mt-1 text-sm text-fg-muted">{atividade.comentario}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
