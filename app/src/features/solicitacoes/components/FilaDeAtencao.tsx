import { CheckCircle2 } from 'lucide-react';
import type { JSX } from 'react';
import { Link } from 'react-router';

import { useModelo } from '@/features/admin/modelos/hooks/useModelo';
import { Card } from '@/shared/components/Card/Card';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';

import { useFilaDeAtencao, type FilaDeAtencao as Fila } from '../hooks/useFilaDeAtencao';
import { caminhoDasAtrasadas } from '../lib/distribuicaoDoTrabalho';
import type { ItemDaFila } from '../lib/filaDeAtencao';

const ID_DO_TITULO = 'fila-de-atencao-titulo';

function CodigoDoModelo({ modeloId }: { modeloId: string | null }) {
  const modelo = useModelo(modeloId);
  if (!modelo.data) return null;
  return <span className="font-mono text-xs text-fg-muted">{modelo.data.codigo}</span>;
}

function Item({ item }: { item: ItemDaFila }) {
  return (
    <li>
      <Link
        to={item.href}
        className="flex flex-col gap-1 px-4 py-3 hover:bg-surface-muted pointer-coarse:min-h-11"
      >
        <span className="break-words text-sm font-medium text-fg">{item.titulo}</span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
          <CodigoDoModelo modeloId={item.modeloId} />
          <span>{item.responsaveis}</span>
          <span>{item.etapa}</span>
          {item.atraso ? <span className="text-danger-fg">{item.atraso}</span> : null}
        </span>
      </Link>
    </li>
  );
}

function FilaVazia() {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-6 text-center">
      <CheckCircle2 aria-hidden="true" className="size-6 text-fg-muted" />
      <p className="text-base font-semibold text-fg">Nada atrasado</p>
      <p className="text-sm text-fg-muted">Nenhuma solicitação em aberto passou do prazo.</p>
    </div>
  );
}

function Carregando() {
  return (
    <div role="status">
      <LoadingState title="Carregando a fila de atenção..." />
    </div>
  );
}

function Falha({ onRetry }: { onRetry: Fila['refetch'] }) {
  return (
    <ErrorState
      title="Não foi possível carregar a fila de atenção"
      description="Verifique sua conexão com o servidor."
      onRetry={onRetry}
    />
  );
}

function Lista({ itens }: { itens: ItemDaFila[] }) {
  return (
    <ul className="divide-y divide-line">
      {itens.map((item) => (
        <Item key={item.id} item={item} />
      ))}
    </ul>
  );
}

function Conteudo({ fila }: { fila: Fila }) {
  if (fila.isLoading) return <Carregando />;
  if (fila.isError) return <Falha onRetry={fila.refetch} />;
  if (fila.total === 0) return <FilaVazia />;
  return <Lista itens={fila.itens} />;
}

/** O total de atrasadas mora só no indicador "Em atraso" (RF-13): aqui há só o caminho. */
function Cabecalho() {
  return (
    <header className="flex flex-wrap items-baseline justify-between gap-2 px-4 pt-4">
      <h2 id={ID_DO_TITULO} className="text-base font-semibold text-fg">
        Precisa de atenção
      </h2>
      <Link
        to={caminhoDasAtrasadas()}
        className="inline-flex items-center text-sm font-medium text-accent hover:underline pointer-coarse:min-h-11 pointer-coarse:px-2"
      >
        Ver todas
      </Link>
    </header>
  );
}

export function FilaDeAtencao(): JSX.Element {
  const fila = useFilaDeAtencao();
  return (
    <Card as="section" aria-labelledby={ID_DO_TITULO}>
      <Cabecalho />
      <Conteudo fila={fila} />
    </Card>
  );
}
