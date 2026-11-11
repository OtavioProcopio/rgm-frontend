import { ChevronLeft, ChevronRight, Link2 } from 'lucide-react';
import { Link } from 'react-router';

import type { Modelo } from '@/features/admin/modelos/types/modeloTypes';
import { Badge } from '@/shared/components/Badge/Badge';
import { Button } from '@/shared/components/Button/Button';
import { nomeDoTipoDeModelo } from '@/shared/lib/rotulos';

import type { EstadoDaCopia } from '../hooks/useCopiarLink';
import { GaleriaDoDestaque } from './GaleriaDoDestaque';

type Props = {
  modelo: Modelo;
  /** Posição no filtro inteiro e o total do servidor. */
  numero: number;
  total: number;
  podeVoltar: boolean;
  podeAvancar: boolean;
  aoVoltar: () => void;
  aoAvancar: () => void;
  fotos: string[];
  carregandoFotos: boolean;
  erroNasFotos: boolean;
  aoTentarFotos: () => void;
  estadoDaCopia: EstadoDaCopia;
  aoCopiar: () => void;
};

/** O modelo grande: fotos, dados, navegação entre modelos, ficha completa e o link direto. */
export function DestaqueDoModelo({
  modelo,
  numero,
  total,
  podeVoltar,
  podeAvancar,
  aoVoltar,
  aoAvancar,
  fotos,
  carregandoFotos,
  erroNasFotos,
  aoTentarFotos,
  estadoDaCopia,
  aoCopiar,
}: Props) {
  return (
    <section
      aria-label="Modelo em destaque"
      className="space-y-4 rounded-xl border border-line bg-surface p-4"
    >
      <p className="sr-only" aria-live="polite">
        {modelo.descricao}, {numero} de {total}
      </p>

      <GaleriaDoDestaque
        key={modelo.id}
        descricao={modelo.descricao}
        codigo={modelo.codigo}
        fotos={fotos}
        carregandoFotos={carregandoFotos}
        erroNasFotos={erroNasFotos}
        onTentarFotos={aoTentarFotos}
      />

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-fg">{modelo.descricao}</h2>
          {modelo.ativo ? null : <Badge variant="neutral">Inativo</Badge>}
          {modelo.temPendenciaAberta ? <Badge variant="warning">Pendência aberta</Badge> : null}
        </div>
        <p className="font-mono text-sm text-fg-muted">
          {modelo.codigo} · versão {modelo.versao}
        </p>
        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-fg-muted">Tipo</dt>
          <dd className="text-fg">{modelo.tipo ? nomeDoTipoDeModelo(modelo.tipo) : '—'}</dd>
          <dt className="text-fg-muted">Máquina</dt>
          <dd className="text-fg">{modelo.maquina}</dd>
          <dt className="text-fg-muted">Observações</dt>
          <dd className="whitespace-pre-line break-words text-fg">{modelo.observacoes || '—'}</dd>
        </dl>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <div className="flex items-center gap-2">
          <Button variant="secondary" disabled={!podeVoltar} onClick={aoVoltar}>
            <ChevronLeft aria-hidden="true" size={16} className="mr-1" />
            Anterior
          </Button>
          <span className="min-w-24 text-center text-sm text-fg-muted">
            {numero} de {total}
          </span>
          <Button variant="secondary" disabled={!podeAvancar} onClick={aoAvancar}>
            Próximo
            <ChevronRight aria-hidden="true" size={16} className="ml-1" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={aoCopiar}>
            <Link2 aria-hidden="true" size={16} className="mr-1.5" />
            Copiar link
          </Button>
          <Link
            to={`/app/modelos/${modelo.id}`}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent-hover"
          >
            Abrir ficha completa
          </Link>
        </div>
      </div>

      {estadoDaCopia === 'copiado' ? (
        <p role="status" className="text-sm text-success-fg">
          Link copiado
        </p>
      ) : null}
      {estadoDaCopia === 'bloqueado' ? (
        <div className="space-y-1">
          <label htmlFor="link-do-modelo" className="text-sm text-fg-muted">
            Não foi possível copiar sozinho. Copie o endereço abaixo:
          </label>
          <input
            id="link-do-modelo"
            readOnly
            value={window.location.href}
            onFocus={(evento) => evento.currentTarget.select()}
            className="min-h-11 w-full rounded-md border border-line-strong bg-surface px-3 text-sm text-fg"
          />
        </div>
      ) : null}
    </section>
  );
}
