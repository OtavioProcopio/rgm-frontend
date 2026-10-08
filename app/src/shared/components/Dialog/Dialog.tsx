import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

type DialogProps = {
  /** Nome acessível do diálogo: a ação e sobre o que ela age. */
  titulo: string;
  /** Chamado por Esc e por clique fora. */
  onClose: () => void;
  /** Enquanto verdadeiro, Esc e clique fora não fecham (envio em andamento). */
  bloqueado?: boolean;
  /**
   * `painel` (padrão) é o painel de formulário; `imersivo` ocupa a tela sobre o fundo de
   * sobreposição de foto, escuro nos dois temas.
   */
  aparencia?: keyof typeof APARENCIAS;
  children: ReactNode;
};

const APARENCIAS = {
  painel: {
    fundo: 'items-end bg-black/50 sm:items-center sm:p-4',
    painel: 'max-h-dvh overflow-y-auto rounded-t-xl bg-surface-raised sm:max-w-md sm:rounded-xl',
  },
  imersivo: {
    fundo: 'items-stretch bg-scrim',
    painel: 'h-dvh text-on-solid',
  },
};

const FOCAVEIS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Diálogo modal: montado significa aberto. Prende o foco e devolve-o ao fechar. */
export function Dialog({
  titulo,
  onClose,
  bloqueado = false,
  aparencia = 'painel',
  children,
}: DialogProps) {
  const painel = useRef<HTMLDivElement>(null);

  function focaveis(): HTMLElement[] {
    // Controle dentro de elemento oculto não recebe foco, então fica fora do ciclo.
    return Array.from(painel.current!.querySelectorAll<HTMLElement>(FOCAVEIS)).filter(
      (controle) => !controle.closest('[hidden]'),
    );
  }

  useEffect(() => {
    const focoAnterior = document.activeElement as HTMLElement | null;
    const rolagemAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    (focaveis()[0] ?? painel.current!).focus();
    return () => {
      document.body.style.overflow = rolagemAnterior;
      focoAnterior?.focus();
    };
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      if (!bloqueado) onClose();
      return;
    }
    if (event.key !== 'Tab') return;

    const controles = focaveis();
    const primeiro = controles[0];
    const ultimo = controles[controles.length - 1];
    if (!primeiro) {
      event.preventDefault();
      return;
    }
    const atual = document.activeElement;
    if (event.shiftKey && (atual === primeiro || atual === painel.current)) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && atual === ultimo) {
      event.preventDefault();
      primeiro.focus();
    }
  }

  return (
    <div
      className={cn('fixed inset-0 z-50 flex justify-center', APARENCIAS[aparencia].fundo)}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !bloqueado) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className={cn('w-full outline-none', APARENCIAS[aparencia].painel)}
      >
        {children}
      </div>
    </div>
  );
}
