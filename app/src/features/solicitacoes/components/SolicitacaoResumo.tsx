import { Link } from 'react-router';

import type { Modelo } from '@/features/admin/modelos/types/modeloTypes';
import { rotuloDoTipoDeSolicitacao } from '@/shared/lib/rotulos';

import type { Solicitacao } from '../types/solicitacaoTypes';
import { SolicitacaoPrioridadeBadge } from './SolicitacaoPrioridadeBadge';
import { SolicitacaoStatusBadge } from './SolicitacaoStatusBadge';

type Props = {
  solicitacao: Solicitacao;
  modelo?: Pick<Modelo, 'id' | 'codigo' | 'descricao'> | null;
};

const NOME_DO_CAMPO = 'text-xs font-medium uppercase tracking-wide text-fg-muted';

/** Dados da solicitação exibidos no topo do detalhe. */
export function SolicitacaoResumo({ solicitacao, modelo }: Props) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-line bg-surface-muted p-4">
      <div>
        <p className={NOME_DO_CAMPO}>Status</p>
        <div className="mt-1">
          <SolicitacaoStatusBadge status={solicitacao.status} />
        </div>
      </div>
      <div>
        <p className={NOME_DO_CAMPO}>Prioridade</p>
        <div className="mt-1">
          <SolicitacaoPrioridadeBadge prioridade={solicitacao.prioridade} />
          {!solicitacao.prioridade && <span className="text-sm text-fg-muted">—</span>}
        </div>
      </div>
      <div>
        <p className={NOME_DO_CAMPO}>Tipo</p>
        <p className="mt-1 text-sm font-medium text-fg">
          {rotuloDoTipoDeSolicitacao[solicitacao.tipo]}
        </p>
      </div>
      <div>
        <p className={NOME_DO_CAMPO}>Descrição</p>
        <p className="mt-1 text-sm text-fg">{solicitacao.descricao}</p>
      </div>
      {modelo ? (
        <div className="col-span-2">
          <p className={NOME_DO_CAMPO}>Modelo (rastreabilidade)</p>
          <Link
            to={`/app/modelos/${modelo.id}`}
            className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline pointer-coarse:min-h-11"
          >
            {modelo.codigo} — {modelo.descricao}
          </Link>
        </div>
      ) : solicitacao.tipo === 'CRIACAO' ? (
        <div className="col-span-2">
          <p className={NOME_DO_CAMPO}>Modelo pretendido</p>
          <p className="mt-1 text-sm text-fg">
            {solicitacao.modeloCodigo} — {solicitacao.modeloMaquina}
          </p>
          {solicitacao.modeloObservacoes ? (
            <p className="mt-1 text-sm text-fg-muted">{solicitacao.modeloObservacoes}</p>
          ) : null}
          <p className="mt-1 text-xs text-fg-muted">
            O modelo será criado ao concluir esta solicitação.
          </p>
        </div>
      ) : null}
      {solicitacao.comentarioFinal ? (
        <div className="col-span-2">
          <p className={NOME_DO_CAMPO}>Comentário final</p>
          <p className="mt-1 text-sm text-fg">{solicitacao.comentarioFinal}</p>
        </div>
      ) : null}
    </div>
  );
}
