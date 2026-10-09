import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';

import type { Modelo } from '@/features/admin/modelos/types/modeloTypes';
import { Badge, type BadgeVariant } from '@/shared/components/Badge/Badge';
import { formatarDataHora, tempoRelativo } from '@/shared/lib/data';
import { rotuloDoTipoDeSolicitacao } from '@/shared/lib/rotulos';

import { nomeDeQuemAbriu, nomesDosResponsaveis } from '../lib/nomesDosUsuarios';
import { prazoDoResumo, type SituacaoDoPrazo, type TomDoPrazo } from '../lib/prazoSolicitacao';
import type { AtividadeSolicitacao, Solicitacao } from '../types/solicitacaoTypes';
import { SolicitacaoPrioridadeBadge } from './SolicitacaoPrioridadeBadge';
import { SolicitacaoStatusBadge } from './SolicitacaoStatusBadge';

type Props = {
  solicitacao: Solicitacao;
  modelo?: Pick<Modelo, 'id' | 'codigo' | 'descricao'> | null;
  atividades?: AtividadeSolicitacao[];
  usuarios?: { id: string; nome: string }[];
  agoraMs?: number;
};

const NOME_DO_CAMPO = 'text-xs font-medium uppercase tracking-wide text-fg-muted';

const VARIANTE_DO_TOM: Record<TomDoPrazo, BadgeVariant> = {
  atraso: 'danger',
  atencao: 'warning',
  ok: 'success',
  neutro: 'neutral',
};

function Campo({ nome, children }: { nome: string; children: ReactNode }) {
  return (
    <div>
      <p className={NOME_DO_CAMPO}>{nome}</p>
      <div className="mt-1 text-sm text-fg">{children}</div>
    </div>
  );
}

function CampoPrazo({ prazo }: { prazo: SituacaoDoPrazo | null }) {
  if (!prazo) return null;
  return (
    <Campo nome="Prazo">
      <Badge variant={VARIANTE_DO_TOM[prazo.tom]}>{prazo.rotulo}</Badge>
    </Campo>
  );
}

function HorarioDeAbertura({ criadaEm, agoraMs }: { criadaEm: string; agoraMs: number }) {
  const completa: string = formatarDataHora(criadaEm);
  return (
    <>
      <time dateTime={criadaEm} title={completa} className="text-fg-muted">
        {tempoRelativo(criadaEm, agoraMs)}
      </time>
      <span className="sr-only">{completa}</span>
    </>
  );
}

function CampoAbertura({
  nome,
  criadaEm,
  agoraMs,
}: {
  nome: string | null;
  criadaEm: string;
  agoraMs: number;
}) {
  const horario = <HorarioDeAbertura criadaEm={criadaEm} agoraMs={agoraMs} />;
  if (!nome) return <Campo nome="Aberta">{horario}</Campo>;
  return (
    <Campo nome="Aberta por">
      <span className="mr-2 font-medium">{nome}</span>
      {horario}
    </Campo>
  );
}

/** Dados da solicitação exibidos no topo do detalhe. */
export function SolicitacaoResumo({ solicitacao, modelo, atividades, usuarios, agoraMs }: Props) {
  const [montadaEm] = useState<number>(() => Date.now());
  const agora: number = agoraMs ?? montadaEm;
  const responsaveis = nomesDosResponsaveis(solicitacao, usuarios ?? []);
  const abertaPor = nomeDeQuemAbriu(solicitacao, atividades ?? [], usuarios ?? []);
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-line bg-surface-muted p-4">
      <CampoPrazo prazo={prazoDoResumo(solicitacao, agora)} />
      <Campo nome="Responsáveis">{responsaveis ?? '—'}</Campo>
      <CampoAbertura nome={abertaPor} criadaEm={solicitacao.criadaEm} agoraMs={agora} />
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
