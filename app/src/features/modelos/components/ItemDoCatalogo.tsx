import { useEffect, useRef } from 'react';
import { Link, type To } from 'react-router';

import type { Modelo } from '@/features/admin/modelos/types/modeloTypes';
import { cn } from '@/shared/lib/cn';

type Props = {
  modelo: Modelo;
  /** O endereço do modelo com os filtros atuais: um link de verdade. */
  para: To;
  emDestaque: boolean;
};

/** Uma linha da lista: capa pequena, descrição, código e selos. O clique põe o modelo em destaque. */
export function ItemDoCatalogo({ modelo, para, emDestaque }: Props) {
  const ligacao = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (emDestaque) ligacao.current?.scrollIntoView?.({ block: 'nearest' });
  }, [emDestaque]);

  return (
    <Link
      ref={ligacao}
      to={para}
      replace
      aria-current={emDestaque ? 'true' : undefined}
      aria-label={`${modelo.descricao}, ${modelo.codigo}${modelo.ativo ? '' : ', inativo'}${modelo.temPendenciaAberta ? ', pendência aberta' : ''}`}
      className={cn(
        'grid min-h-16 grid-cols-[4rem_1fr] items-center gap-3 rounded-md border-2 bg-surface p-2 text-left',
        emDestaque
          ? 'border-accent bg-surface-muted'
          : 'border-line hover:border-line-strong motion-safe:transition-colors',
      )}
    >
      {modelo.fotoCapaUrl ? (
        <img
          src={modelo.fotoCapaUrl}
          alt=""
          loading="lazy"
          className="h-12 w-16 rounded object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-12 w-16 items-center justify-center rounded bg-surface-muted font-bold text-fg-muted"
        >
          {modelo.codigo.slice(0, 2)}
        </span>
      )}
      <span className="min-w-0">
        <span className="line-clamp-2 block font-medium text-fg">{modelo.descricao}</span>
        <span className="block font-mono text-xs text-fg-muted">
          {modelo.codigo}
          {modelo.ativo ? '' : ' · inativo'}
          {modelo.temPendenciaAberta ? ' · pendência' : ''}
        </span>
      </span>
    </Link>
  );
}
