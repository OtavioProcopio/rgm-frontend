import { cn } from '@/shared/lib/cn';

import type { BotaoDoCatalogo } from '../lib/botoesDoCatalogo';

type Props = {
  botao: BotaoDoCatalogo;
  onEscolher: (valor: string) => void;
};

/** Um botão de tipo ou de máquina: mostra o que traria e anuncia se está escolhido. */
export function BotaoDeFiltro({ botao, onEscolher }: Props) {
  return (
    <button
      type="button"
      aria-pressed={botao.escolhido}
      disabled={botao.desabilitado}
      onClick={() => onEscolher(botao.valor)}
      className={cn(
        'inline-flex min-h-11 items-center gap-1.5 rounded-md border px-3.5 text-sm font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-45',
        botao.escolhido
          ? 'border-accent bg-accent text-on-accent'
          : 'border-line-strong bg-surface text-fg hover:bg-surface-muted',
      )}
    >
      {botao.rotulo}
      {botao.total === null ? null : (
        <>
          {' '}
          <span aria-hidden="true" className="text-xs opacity-80">
            {botao.total}
          </span>
          <span className="sr-only">
            ({botao.total} {botao.total === 1 ? 'modelo' : 'modelos'})
          </span>
        </>
      )}
    </button>
  );
}
