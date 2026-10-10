import { Check } from 'lucide-react';
import { useRef, type KeyboardEvent } from 'react';

import { cn } from '@/shared/lib/cn';

export type OpcaoDoControle<T extends string | number> = { valor: T; rotulo: string };

type Props<T extends string | number> = {
  rotulo: string;
  opcoes: OpcaoDoControle<T>[];
  valor: T;
  onChange: (valor: T) => void;
  className?: string;
};

type Navegacao<T extends string | number> = {
  escolher: (valor: T) => void;
  aoTeclar: (evento: KeyboardEvent<HTMLButtonElement>, indice: number) => void;
  registrar: (indice: number, el: HTMLButtonElement | null) => void;
};

function indiceDestino(tecla: string, atual: number, total: number): number | null {
  if (tecla === 'ArrowRight' || tecla === 'ArrowDown') return (atual + 1) % total;
  if (tecla === 'ArrowLeft' || tecla === 'ArrowUp') return (atual - 1 + total) % total;
  if (tecla === 'Home') return 0;
  if (tecla === 'End') return total - 1;
  return null;
}

function useNavegacao<T extends string | number>(props: Props<T>): Navegacao<T> {
  const { opcoes, valor, onChange } = props;
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);
  const registrar = (indice: number, el: HTMLButtonElement | null): void => {
    botoes.current[indice] = el;
  };
  const escolher = (novo: T): void => {
    if (novo !== valor) onChange(novo);
  };
  const aoTeclar = (evento: KeyboardEvent<HTMLButtonElement>, indice: number): void => {
    const destino = indiceDestino(evento.key, indice, opcoes.length);
    if (destino === null) return;
    evento.preventDefault();
    escolher(opcoes[destino].valor);
    botoes.current[destino]?.focus();
  };
  return { escolher, aoTeclar, registrar };
}

type BotaoProps<T extends string | number> = {
  opcao: OpcaoDoControle<T>;
  escolhida: boolean;
  indice: number;
  nav: Navegacao<T>;
};

function classeDoBotao(escolhida: boolean): string {
  return cn(
    'inline-flex items-center gap-1 rounded-md px-3 py-1 text-sm font-medium motion-safe:transition-colors pointer-coarse:min-h-11',
    escolhida ? 'bg-accent text-on-accent' : 'text-fg-muted hover:text-fg',
  );
}

function BotaoOpcao<T extends string | number>({ opcao, escolhida, indice, nav }: BotaoProps<T>) {
  return (
    <button
      ref={(el) => nav.registrar(indice, el)}
      type="button"
      role="radio"
      aria-checked={escolhida}
      tabIndex={escolhida ? 0 : -1}
      onClick={() => nav.escolher(opcao.valor)}
      onKeyDown={(e) => nav.aoTeclar(e, indice)}
      className={classeDoBotao(escolhida)}
    >
      {escolhida && <Check aria-hidden="true" className="size-4" />}
      {opcao.rotulo}
      {escolhida && <span className="sr-only"> (selecionada)</span>}
    </button>
  );
}

type BotoesProps<T extends string | number> = {
  opcoes: OpcaoDoControle<T>[];
  valor: T;
  nav: Navegacao<T>;
};

function BotoesDoControle<T extends string | number>({ opcoes, valor, nav }: BotoesProps<T>) {
  return (
    <>
      {opcoes.map((opcao, i) => (
        <BotaoOpcao
          key={opcao.valor}
          opcao={opcao}
          escolhida={opcao.valor === valor}
          indice={i}
          nav={nav}
        />
      ))}
    </>
  );
}

export function ControleSegmentado<T extends string | number>(props: Props<T>) {
  const { rotulo, opcoes, valor, className } = props;
  const nav = useNavegacao(props);
  return (
    <div
      role="radiogroup"
      aria-label={rotulo}
      className={cn('inline-flex gap-1 rounded-lg border border-line p-0.5', className)}
    >
      <BotoesDoControle opcoes={opcoes} valor={valor} nav={nav} />
    </div>
  );
}
