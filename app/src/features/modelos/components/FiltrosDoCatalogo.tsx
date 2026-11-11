import { X } from 'lucide-react';

import { Button } from '@/shared/components/Button/Button';

import type { BotaoDoCatalogo } from '../lib/botoesDoCatalogo';
import { BotaoDeFiltro } from './BotaoDeFiltro';

type Props = {
  tipos: BotaoDoCatalogo[];
  maquinas: BotaoDoCatalogo[];
  onTipo: (valor: string) => void;
  onMaquina: (valor: string) => void;
  busca: string;
  onBusca: (texto: string) => void;
  /** A busca tem 1 caractere: o servidor só filtra a partir de 2. */
  buscaCurta: boolean;
  inativos: boolean;
  onInativos: (ligado: boolean) => void;
  temFiltro: boolean;
  onLimpar: () => void;
};

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={titulo} className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">{titulo}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/** Tipo e máquina em botões sempre visíveis, a busca única, "Mostrar inativos" e "Limpar filtros". */
export function FiltrosDoCatalogo({
  tipos,
  maquinas,
  onTipo,
  onMaquina,
  busca,
  onBusca,
  buscaCurta,
  inativos,
  onInativos,
  temFiltro,
  onLimpar,
}: Props) {
  return (
    <section
      aria-label="Filtros"
      className="space-y-4 rounded-xl border border-line bg-surface p-4"
    >
      <Grupo titulo="Tipo de modelo">
        {tipos.map((botao) => (
          <BotaoDeFiltro key={botao.valor || 'todos'} botao={botao} onEscolher={onTipo} />
        ))}
      </Grupo>
      <Grupo titulo="Máquina">
        {maquinas.map((botao) => (
          <BotaoDeFiltro key={botao.valor || 'todas'} botao={botao} onEscolher={onMaquina} />
        ))}
      </Grupo>
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-64 flex-1 space-y-1">
          <label htmlFor="busca-do-catalogo" className="sr-only">
            Buscar por código ou descrição
          </label>
          <input
            id="busca-do-catalogo"
            type="search"
            value={busca}
            onChange={(evento) => onBusca(evento.target.value)}
            placeholder="Buscar por código ou descrição"
            aria-describedby={buscaCurta ? 'dica-da-busca' : undefined}
            className="min-h-11 w-full rounded-md border border-line-strong bg-surface px-3 text-sm text-fg outline-none placeholder:text-fg-muted focus:border-accent focus:ring-2 focus:ring-accent/40"
          />
          {buscaCurta ? (
            <p id="dica-da-busca" className="text-xs text-fg-muted">
              Digite ao menos 2 letras
            </p>
          ) : null}
        </div>
        <label className="flex min-h-11 items-center gap-2 text-sm text-fg">
          <input
            type="checkbox"
            checked={inativos}
            onChange={(evento) => onInativos(evento.target.checked)}
            className="size-4 accent-[var(--accent)]"
          />
          Mostrar inativos
        </label>
        {temFiltro ? (
          <Button variant="secondary" onClick={onLimpar}>
            <X aria-hidden="true" size={16} className="mr-1.5" />
            Limpar filtros
          </Button>
        ) : null}
      </div>
    </section>
  );
}
