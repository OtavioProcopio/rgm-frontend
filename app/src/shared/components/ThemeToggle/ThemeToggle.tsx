import { Check, Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

import { useTema } from '@/shared/hooks/useTema';
import { cn } from '@/shared/lib/cn';
import type { ThemePreference } from '@/shared/lib/theme';

const OPCOES: { preferencia: ThemePreference; rotulo: string; Icone: LucideIcon }[] = [
  { preferencia: 'system', rotulo: 'Sistema', Icone: Monitor },
  { preferencia: 'light', rotulo: 'Claro', Icone: Sun },
  { preferencia: 'dark', rotulo: 'Escuro', Icone: Moon },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { preferencia, escolher } = useTema();
  const [aberto, setAberto] = useState(false);
  const controleRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const itensRef = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  const indiceDaAtiva = OPCOES.findIndex((opcao) => opcao.preferencia === preferencia);
  const ativa = OPCOES[indiceDaAtiva];

  useEffect(() => {
    if (!aberto) return;

    itensRef.current[indiceDaAtiva]?.focus();

    function fecharSeForFora(evento: MouseEvent) {
      if (!controleRef.current!.contains(evento.target as Node)) setAberto(false);
    }
    document.addEventListener('mousedown', fecharSeForFora);
    return () => document.removeEventListener('mousedown', fecharSeForFora);
  }, [aberto, indiceDaAtiva]);

  function fechar() {
    setAberto(false);
    botaoRef.current!.focus();
  }

  function escolherEFechar(nova: ThemePreference) {
    escolher(nova);
    fechar();
  }

  function aoTeclar(evento: KeyboardEvent<HTMLButtonElement>, indice: number) {
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault();
      const passo = evento.key === 'ArrowDown' ? 1 : -1;
      itensRef.current[(indice + passo + OPCOES.length) % OPCOES.length]?.focus();
    } else if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      escolherEFechar(OPCOES[indice].preferencia);
    } else if (evento.key === 'Escape') {
      evento.preventDefault();
      fechar();
    }
  }

  return (
    <div ref={controleRef} className="relative inline-block">
      <button
        ref={botaoRef}
        type="button"
        aria-label={`Tema: ${ativa.rotulo}`}
        title={`Tema: ${ativa.rotulo}`}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-controls={aberto ? menuId : undefined}
        onClick={() => setAberto((estava) => !estava)}
        className={cn(
          'inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-surface text-fg transition-colors hover:bg-surface-muted pointer-coarse:h-11 pointer-coarse:w-11',
          className,
        )}
      >
        <ativa.Icone aria-hidden="true" size={18} />
      </button>

      {aberto ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Tema"
          className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border border-line bg-surface-raised p-1 shadow-lg"
        >
          {OPCOES.map(({ preferencia: valor, rotulo, Icone }, indice) => (
            <button
              key={valor}
              ref={(item) => {
                itensRef.current[indice] = item;
              }}
              type="button"
              role="menuitemradio"
              aria-checked={valor === preferencia}
              tabIndex={-1}
              onClick={() => escolherEFechar(valor)}
              onKeyDown={(evento) => aoTeclar(evento, indice)}
              className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm text-fg hover:bg-surface-muted focus:bg-surface-muted pointer-coarse:min-h-11"
            >
              <Icone aria-hidden="true" size={16} />
              <span className="flex-1">{rotulo}</span>
              {valor === preferencia ? (
                <Check aria-hidden="true" size={16} className="text-accent" />
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
