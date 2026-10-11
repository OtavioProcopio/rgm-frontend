import { X } from 'lucide-react';
import { useId, useState } from 'react';

import { cn } from '@/shared/lib/cn';

export type OpcaoDoSeletor = { valor: string; rotulo: string };

type Props = {
  rotulo: string;
  /** Opções já escolhidas, mostradas como etiquetas removíveis. */
  escolhidas: OpcaoDoSeletor[];
  /** Candidatos da busca atual (a busca é de quem usa: o seletor só mostra e escolhe). */
  opcoes: OpcaoDoSeletor[];
  onChange: (escolhidas: OpcaoDoSeletor[]) => void;
  onBuscar: (termo: string) => void;
  carregando?: boolean;
  erro?: string;
  textoSemResultado?: string;
  placeholder?: string;
  className?: string;
};

/** Escolha múltipla com busca: digita parte do nome, toca na opção e ela vira etiqueta. */
export function SeletorMultiplo({
  rotulo,
  escolhidas,
  opcoes,
  onChange,
  onBuscar,
  carregando = false,
  erro,
  textoSemResultado = 'Nenhum resultado.',
  placeholder = 'Digite para buscar...',
  className,
}: Props) {
  const idDoCampo = useId();
  const [termo, setTermo] = useState('');
  const disponiveis = opcoes.filter((o) => !escolhidas.some((e) => e.valor === o.valor));

  function escolher(opcao: OpcaoDoSeletor) {
    onChange([...escolhidas, opcao]);
    setTermo('');
    onBuscar('');
  }

  function remover(valor: string) {
    onChange(escolhidas.filter((e) => e.valor !== valor));
  }

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={idDoCampo} className="block text-sm font-medium text-fg">
        {rotulo}
      </label>

      {escolhidas.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5" aria-label={`${rotulo} escolhidos`}>
          {escolhidas.map((e) => (
            <li
              key={e.valor}
              className="inline-flex items-center gap-1 rounded-full bg-info-soft py-0.5 pl-2.5 pr-1 text-sm text-info-fg"
            >
              {e.rotulo}
              <button
                type="button"
                aria-label={`Remover ${e.rotulo}`}
                onClick={() => remover(e.valor)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-surface-muted pointer-coarse:h-11 pointer-coarse:w-11"
              >
                <X size={14} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        id={idDoCampo}
        type="search"
        value={termo}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          setTermo(e.target.value);
          onBuscar(e.target.value);
        }}
        className="block w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-fg pointer-coarse:min-h-11"
      />

      <ul
        aria-label={`Resultados de ${rotulo}`}
        className="max-h-48 divide-y divide-line overflow-y-auto rounded-md border border-line"
      >
        {disponiveis.map((o) => (
          <li key={o.valor}>
            <button
              type="button"
              onClick={() => escolher(o)}
              className="block w-full px-3 py-2 text-left text-sm text-fg hover:bg-surface-muted pointer-coarse:min-h-11"
            >
              {o.rotulo}
            </button>
          </li>
        ))}
        {disponiveis.length === 0 ? (
          <li className="px-3 py-2 text-sm text-fg-muted">
            {carregando ? 'Buscando...' : textoSemResultado}
          </li>
        ) : null}
      </ul>

      {erro ? <p className="text-sm text-danger-fg">{erro}</p> : null}
    </div>
  );
}
