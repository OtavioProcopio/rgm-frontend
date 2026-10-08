import { Link } from 'react-router';

import { Card } from '@/shared/components/Card/Card';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';

import type { EventoModelo } from '../types/modeloTypes';

const MOLDURA = 'rounded-md p-4 shadow-none';

export function EventosModeloList({ eventos }: { eventos: EventoModelo[] }) {
  if (eventos.length === 0) {
    return (
      <EmptyState
        title="Nenhum evento registrado"
        description="O modelo ainda não possui eventos."
      />
    );
  }

  return (
    <ol className="space-y-3">
      {eventos.map((evento) => {
        const isClickable = !!evento.solicitacaoRelacionadaId;
        const cardContent = (
          <>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-semibold text-fg transition-colors group-hover:text-accent">
                {evento.titulo}
              </h3>
              <span className="text-xs text-fg-muted">{formatDate(evento.criadoEm)}</span>
            </div>
            <p className="mt-1 text-sm text-fg-muted">{evento.descricao ?? evento.tipo}</p>
            {evento.estadoModeloDescricao ? (
              <p className="mt-1 text-xs text-fg-muted">{evento.estadoModeloDescricao}</p>
            ) : null}
            {isClickable ? (
              <span className="mt-2 inline-flex items-center text-xs font-semibold text-accent group-hover:underline">
                Ver solicitação relacionada →
              </span>
            ) : null}
          </>
        );

        return (
          <li key={evento.id}>
            {isClickable ? (
              <Link
                to={`/app/solicitacoes/${evento.solicitacaoRelacionadaId}`}
                className="group block"
              >
                <Card
                  className={`${MOLDURA} transition-all group-hover:border-accent group-hover:shadow-sm`}
                >
                  {cardContent}
                </Card>
              </Link>
            ) : (
              <Card className={MOLDURA}>{cardContent}</Card>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  );
}
