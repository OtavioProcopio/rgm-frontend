import { LoadingState } from '@/shared/components/LoadingState/LoadingState';

import type { AtividadeSolicitacao, TipoAtividadeSolicitacao } from '../types/solicitacaoTypes';
import { statusLabel } from '../lib/solicitacaoMessages';

type Props = {
  atividades: AtividadeSolicitacao[];
  isLoading?: boolean;
};

const tipoAtividadeLabel: Record<TipoAtividadeSolicitacao, string> = {
  ABERTURA: 'Solicitação aberta',
  ATRIBUICAO: 'Responsável atribuído',
  MUDANCA_STATUS: 'Status alterado',
  COMENTARIO: 'Comentário',
  EVIDENCIA_ADICIONADA: 'Evidência anexada',
};

export function SolicitacaoTimeline({ atividades, isLoading }: Props) {
  if (isLoading) return <LoadingState title="Carregando histórico..." />;

  if (atividades.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma atividade registrada.</p>;
  }

  return (
    <ol className="space-y-4">
      {atividades.map((atividade) => {
        const date = new Date(atividade.criadaEm).toLocaleString('pt-BR');
        return (
          <li key={atividade.id} className="flex gap-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-2 w-2 rounded-full bg-slate-500 dark:bg-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {tipoAtividadeLabel[atividade.tipo]}
                {atividade.tipo === 'MUDANCA_STATUS' &&
                  atividade.deStatus &&
                  atividade.paraStatus &&
                  `: ${statusLabel[atividade.deStatus]} → ${statusLabel[atividade.paraStatus]}`}
              </p>
              {atividade.comentario ? (
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                  {atividade.comentario}
                </p>
              ) : null}
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{date}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
