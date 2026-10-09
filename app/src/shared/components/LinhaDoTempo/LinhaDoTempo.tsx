import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { cn } from '@/shared/lib/cn';
import { formatarDataHora, tempoRelativo } from '@/shared/lib/data';
import { LIMITE_VISIVEL, agruparPorDia, recolherGrupos } from '@/shared/lib/linhaDoTempo';
import type { GrupoDoDia } from '@/shared/lib/linhaDoTempo';

export type ItemDaLinhaDoTempo = {
  id: string;
  em: string;
  marcador: ReactNode;
  titulo: ReactNode;
  detalhe?: ReactNode;
  autor?: { nome: string; iniciais: string } | null;
  peso?: 'destaque' | 'discreto';
  destino?: string | null;
};

type Props = {
  itens: ItemDaLinhaDoTempo[];
  rotulo: string;
  vazio?: ReactNode;
  agoraMs?: number;
};

function Horario({ em, agoraMs }: { em: string; agoraMs: number }) {
  const [aberto, definirAberto] = useState<boolean>(false);
  const completa: string = formatarDataHora(em);
  return (
    <span className="inline-flex items-center gap-1 text-xs text-fg-muted">
      <button
        type="button"
        aria-expanded={aberto}
        onClick={() => definirAberto(!aberto)}
        className="rounded-sm px-1 pointer-coarse:min-h-11 pointer-coarse:min-w-11"
      >
        <time dateTime={em} title={completa}>
          {tempoRelativo(em, agoraMs)}
        </time>
        <span className="sr-only">{completa}</span>
      </button>
      {aberto && <span>{completa}</span>}
    </span>
  );
}

function Autor({ autor }: { autor: NonNullable<ItemDaLinhaDoTempo['autor']> }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
      <span
        aria-hidden="true"
        className="inline-flex size-5 items-center justify-center rounded-full bg-surface-muted text-xxs font-medium text-fg"
      >
        {autor.iniciais}
      </span>
      {autor.nome}
    </span>
  );
}

function Titulo({ item }: { item: ItemDaLinhaDoTempo }) {
  const discreto: boolean = item.peso === 'discreto';
  const conteudo: ReactNode = item.destino ? (
    <Link
      to={item.destino}
      className="inline-flex items-center gap-2 text-accent underline-offset-2 hover:underline pointer-coarse:min-h-11"
    >
      {item.titulo}
    </Link>
  ) : (
    item.titulo
  );
  return (
    <div className={cn('text-sm text-fg', discreto && 'text-xs text-fg-muted')}>{conteudo}</div>
  );
}

function Evento({
  item,
  agoraMs,
  ultimo,
}: {
  item: ItemDaLinhaDoTempo;
  agoraMs: number;
  ultimo: boolean;
}) {
  return (
    <li className="relative flex gap-3 pb-4">
      {!ultimo && (
        <span aria-hidden="true" className="absolute top-8 bottom-0 left-4 w-px bg-line" />
      )}
      <span className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface">
        {item.marcador}
      </span>
      <div className="min-w-0 flex-1">
        <Titulo item={item} />
        <div className="flex flex-wrap items-center gap-x-2">
          {item.autor && <Autor autor={item.autor} />}
          <Horario em={item.em} agoraMs={agoraMs} />
        </div>
        {item.detalhe}
      </div>
    </li>
  );
}

function Grupo({ grupo, agoraMs }: { grupo: GrupoDoDia<ItemDaLinhaDoTempo>; agoraMs: number }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold text-fg-muted uppercase">{grupo.rotulo}</h3>
      <ol>
        {grupo.itens.map((item: ItemDaLinhaDoTempo, i: number) => (
          <Evento
            key={item.id}
            item={item}
            agoraMs={agoraMs}
            ultimo={i === grupo.itens.length - 1}
          />
        ))}
      </ol>
    </div>
  );
}

function rotuloDoBotao(expandido: boolean, ocultos: number): string {
  if (expandido) return 'Mostrar menos';
  return `Mostrar ${ocultos} ${ocultos === 1 ? 'evento anterior' : 'eventos anteriores'}`;
}

type BotaoProps = { expandido: boolean; ocultos: number; alvo: string; alternar: () => void };

function BotaoDeRecolhimento({ expandido, ocultos, alvo, alternar }: BotaoProps) {
  return (
    <button
      type="button"
      aria-expanded={expandido}
      aria-controls={alvo}
      onClick={alternar}
      className="rounded-md px-3 py-1.5 text-sm font-medium text-accent pointer-coarse:min-h-11"
    >
      {rotuloDoBotao(expandido, ocultos)}
    </button>
  );
}

function useEstadoDaLinha(agoraMs: number | undefined) {
  const idListas: string = useId();
  const [expandido, definirExpandido] = useState<boolean>(false);
  const [montadoEm] = useState<number>(() => Date.now());
  const alternar = (): void => definirExpandido(!expandido);
  return { idListas, expandido, alternar, agora: agoraMs ?? montadoEm };
}

type ListaProps = { id: string; grupos: GrupoDoDia<ItemDaLinhaDoTempo>[]; agoraMs: number };

function ListaDeGrupos({ id, grupos, agoraMs }: ListaProps) {
  return (
    <div id={id}>
      {grupos.map((g: GrupoDoDia<ItemDaLinhaDoTempo>) => (
        <Grupo key={g.chave} grupo={g} agoraMs={agoraMs} />
      ))}
    </div>
  );
}

export function LinhaDoTempo({ itens, rotulo, vazio, agoraMs }: Props) {
  const { idListas, expandido, alternar, agora } = useEstadoDaLinha(agoraMs);
  if (itens.length === 0) return <>{vazio ?? null}</>;
  const { grupos, ocultos } = recolherGrupos(agruparPorDia(itens, agora), expandido);
  return (
    <section aria-label={rotulo} className="w-full max-w-[720px]">
      <ListaDeGrupos id={idListas} grupos={grupos} agoraMs={agora} />
      {itens.length > LIMITE_VISIVEL && (
        <BotaoDeRecolhimento
          expandido={expandido}
          ocultos={ocultos}
          alvo={idListas}
          alternar={alternar}
        />
      )}
    </section>
  );
}
