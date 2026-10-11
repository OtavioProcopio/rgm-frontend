import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export type AbaDaPeca = { id: string; rotulo: string; conteudo: ReactNode };

type Props = {
  abas: AbaDaPeca[];
  rotulo: string;
  abaInicial?: string;
  className?: string;
};

type Navegacao = {
  aberta: string;
  abrir: (id: string) => void;
  aoTeclar: (evento: KeyboardEvent<HTMLButtonElement>, indice: number) => void;
  registrar: (id: string, el: HTMLButtonElement | null) => void;
};

function indiceDestino(tecla: string, atual: number, total: number): number | null {
  if (tecla === 'ArrowRight') return (atual + 1) % total;
  if (tecla === 'ArrowLeft') return (atual - 1 + total) % total;
  if (tecla === 'Home') return 0;
  if (tecla === 'End') return total - 1;
  return null;
}

function useNavegacao(abas: AbaDaPeca[], abaInicial?: string): Navegacao {
  const [aberta, abrir] = useState<string>(abaInicial ?? abas[0]?.id ?? '');
  const botoes = useRef<Record<string, HTMLButtonElement | null>>({});
  const registrar = (id: string, el: HTMLButtonElement | null): void => {
    botoes.current[id] = el;
  };
  const aoTeclar = (evento: KeyboardEvent<HTMLButtonElement>, indice: number): void => {
    const destino = indiceDestino(evento.key, indice, abas.length);
    if (destino === null) return;
    evento.preventDefault();
    abrir(abas[destino].id);
    botoes.current[abas[destino].id]?.focus();
  };
  return { aberta, abrir, aoTeclar, registrar };
}

const CLASSE_BASE =
  '-mb-px border-b-2 px-4 py-2 text-sm font-medium motion-safe:transition-colors pointer-coarse:min-h-11';

type BotaoProps = { aba: AbaDaPeca; base: string; indice: number; nav: Navegacao };

function BotaoAba({ aba, base, indice, nav }: BotaoProps) {
  const ativa = nav.aberta === aba.id;
  return (
    <button
      ref={(el) => nav.registrar(aba.id, el)}
      id={`${base}-aba-${aba.id}`}
      type="button"
      role="tab"
      aria-selected={ativa}
      aria-controls={`${base}-painel-${aba.id}`}
      tabIndex={ativa ? 0 : -1}
      onClick={() => nav.abrir(aba.id)}
      onKeyDown={(e) => nav.aoTeclar(e, indice)}
      className={cn(
        CLASSE_BASE,
        ativa ? 'border-accent text-accent' : 'border-transparent text-fg-muted hover:text-fg',
      )}
    >
      {aba.rotulo}
    </button>
  );
}

function PainelAba({ aba, base, aberta }: { aba: AbaDaPeca; base: string; aberta: boolean }) {
  return (
    <div
      id={`${base}-painel-${aba.id}`}
      role="tabpanel"
      aria-labelledby={`${base}-aba-${aba.id}`}
      hidden={!aberta}
    >
      {aba.conteudo}
    </div>
  );
}

export function Abas({ abas, rotulo, abaInicial, className }: Props) {
  const base = useId();
  const nav = useNavegacao(abas, abaInicial);
  return (
    <div className={className}>
      <div role="tablist" aria-label={rotulo} className="flex gap-1 border-b border-border">
        {abas.map((aba, i) => (
          <BotaoAba key={aba.id} aba={aba} base={base} indice={i} nav={nav} />
        ))}
      </div>
      {abas.map((aba) => (
        <PainelAba key={aba.id} aba={aba} base={base} aberta={nav.aberta === aba.id} />
      ))}
    </div>
  );
}
