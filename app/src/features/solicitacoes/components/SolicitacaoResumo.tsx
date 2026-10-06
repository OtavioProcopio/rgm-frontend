import { Link } from 'react-router';

import type { Modelo } from '@/features/admin/modelos/types/modeloTypes';

import { tipoLabel } from '../lib/solicitacaoMessages';
import type { Solicitacao } from '../types/solicitacaoTypes';
import { SolicitacaoPrioridadeBadge } from './SolicitacaoPrioridadeBadge';
import { SolicitacaoStatusBadge } from './SolicitacaoStatusBadge';

type Props = {
  solicitacao: Solicitacao;
  modelo?: Pick<Modelo, 'id' | 'codigo' | 'descricao'> | null;
};

/** Dados da solicitação exibidos no topo do detalhe. */
export function SolicitacaoResumo({ solicitacao, modelo }: Props) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Status
        </p>
        <div className="mt-1">
          <SolicitacaoStatusBadge status={solicitacao.status} />
        </div>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Prioridade
        </p>
        <div className="mt-1">
          <SolicitacaoPrioridadeBadge prioridade={solicitacao.prioridade} />
          {!solicitacao.prioridade && (
            <span className="text-sm text-slate-400 dark:text-slate-500">—</span>
          )}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Tipo
        </p>
        <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
          {tipoLabel[solicitacao.tipo]}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Descrição
        </p>
        <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{solicitacao.descricao}</p>
      </div>
      {modelo ? (
        <div className="col-span-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Modelo (rastreabilidade)
          </p>
          <Link
            to={`/app/modelos/${modelo.id}`}
            className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-sky-600 hover:underline pointer-coarse:min-h-11 dark:text-sky-400"
          >
            {modelo.codigo} — {modelo.descricao}
          </Link>
        </div>
      ) : solicitacao.tipo === 'CRIACAO' ? (
        <div className="col-span-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Modelo pretendido
          </p>
          <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">
            {solicitacao.modeloCodigo} — {solicitacao.modeloMaquina}
          </p>
          {solicitacao.modeloObservacoes ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {solicitacao.modeloObservacoes}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            O modelo será criado ao concluir esta solicitação.
          </p>
        </div>
      ) : null}
      {solicitacao.comentarioFinal ? (
        <div className="col-span-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Comentário final
          </p>
          <p className="mt-1 text-sm text-slate-800 dark:text-slate-200">
            {solicitacao.comentarioFinal}
          </p>
        </div>
      ) : null}
    </div>
  );
}
