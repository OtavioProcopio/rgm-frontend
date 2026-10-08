import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRightCircle, ExternalLink, Eye, PackagePlus, Settings2, Wrench } from 'lucide-react';

import { Badge, type BadgeVariant } from '@/shared/components/Badge/Badge';
import { Card } from '@/shared/components/Card/Card';
import { cn } from '@/shared/lib/cn';
import { rotuloDoTipoDeSolicitacao } from '@/shared/lib/rotulos';

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

const ICONE_DO_TIPO: Record<TipoSolicitacao, React.ElementType> = {
  REPARO: Wrench,
  INSPECAO: Eye,
  REENGENHARIA: Settings2,
  CRIACAO: PackagePlus,
};

const PRIORITY_BORDER: Record<string, string> = {
  URGENTE: 'border-l-danger',
  ALTA: 'border-l-warning',
  MEDIA: 'border-l-info',
  BAIXA: 'border-l-line-strong',
};

const VARIACAO_DO_PRAZO: Record<TomDoPrazo, BadgeVariant> = {
  atraso: 'danger',
  atencao: 'warning',
  neutro: 'neutral',
  ok: 'success',
};

function PrazoBadge({ solicitacao, agora }: { solicitacao: Solicitacao; agora: number }) {
  const situacao = situacaoDoPrazo(solicitacao, agora);
  if (!situacao) return null;
  return (
    <Badge
      variant={VARIACAO_DO_PRAZO[situacao.tom]}
      className="shrink-0 whitespace-nowrap rounded px-1.5 font-semibold tabular-nums"
    >
      {situacao.rotulo}
    </Badge>
  );
}

function AgeBadge({ solicitacao, agora }: { solicitacao: Solicitacao; agora: number }) {
  const days = idadeEmDias(solicitacao, agora);
  if (!days) return null;
  return (
    <span
      className="shrink-0 text-xs font-semibold tabular-nums text-fg-muted"
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
  const Icon = ICONE_DO_TIPO[solicitacao.tipo];
  const [agora] = useState(() => Date.now());
  const avancar = rotuloDeAvancar(solicitacao);
  const criadaEmFormatada = new Date(solicitacao.criadaEm).toLocaleDateString('pt-BR');
  const borderClass = solicitacao.prioridade
    ? PRIORITY_BORDER[solicitacao.prioridade]
    : 'border-l-line-strong';

  return (
    <Card
      draggable={isDraggable}
      onDragStart={
        isDraggable
          ? (e) => {
              e.dataTransfer.effectAllowed = 'move';
              onDragStart(solicitacao);
            }
          : undefined
      }
      className={cn(
        'group rounded-lg border-l-4',
        'transition-all hover:shadow-md active:opacity-50',
        isDraggable && 'lg:cursor-grab lg:active:cursor-grabbing',
        borderClass,
      )}
    >
      <div className="p-3">
        {/* Tipo + age */}
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <Badge
            variant="neutral"
            icon={<Icon size={10} aria-hidden="true" />}
            className="rounded px-1.5"
          >
            {rotuloDoTipoDeSolicitacao[solicitacao.tipo]}
          </Badge>
          <div className="flex shrink-0 items-center gap-1.5">
            <time
              dateTime={solicitacao.criadaEm}
              title={`Aberta em ${criadaEmFormatada}`}
              className="text-xs text-fg-muted"
            >
              {criadaEmFormatada}
            </time>
            <AgeBadge solicitacao={solicitacao} agora={agora} />
          </div>
        </div>

        {relacao ? (
          <p className="mt-2 text-xs font-medium text-fg-muted">{ROTULO_DA_RELACAO[relacao]}</p>
        ) : null}

        {/* Título */}
        <p className="mt-2 text-sm font-semibold leading-snug text-fg line-clamp-2">
          {solicitacao.titulo}
        </p>

        {/* Descrição */}
        {solicitacao.descricao && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-fg-muted">
            {solicitacao.descricao}
          </p>
        )}

        {/* Rodapé: prioridade + SLA + link */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            {solicitacao.prioridade ? (
              <SolicitacaoPrioridadeBadge prioridade={solicitacao.prioridade} />
            ) : (
              <span className="text-xs text-fg-muted">Sem prioridade</span>
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
                className={cn(CONTROLE_DO_CARD, 'bg-surface-muted text-accent hover:brightness-95')}
              >
                <ArrowRightCircle size={14} aria-hidden />
              </button>
            ) : null}
            <Link
              to={`/app/solicitacoes/${solicitacao.id}`}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Ver solicitação: ${solicitacao.titulo}`}
              className={cn(CONTROLE_DO_CARD, 'bg-surface-muted text-accent hover:brightness-95')}
            >
              Ver
              <ExternalLink size={10} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
