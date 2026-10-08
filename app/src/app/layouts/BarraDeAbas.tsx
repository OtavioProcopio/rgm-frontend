import { NavLink } from 'react-router';

import { ICONES_DE_NAVEGACAO } from '@/app/layouts/iconesDeNavegacao';
import { cn } from '@/shared/lib/cn';
import type { DestinoDeNavegacao } from '@/shared/lib/navegacao';

type BarraDeAbasProps = {
  destinos: DestinoDeNavegacao[];
};

/** Navegação principal do celular: abas fixas na base, ocultas a partir de `lg`. */
export function BarraDeAbas({ destinos }: BarraDeAbasProps) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${destinos.length}, minmax(0, 1fr))` }}
      >
        {destinos.map((destino) => (
          <Aba key={destino.id} destino={destino} />
        ))}
      </div>
    </nav>
  );
}

function Aba({ destino }: { destino: DestinoDeNavegacao }) {
  const Icone = ICONES_DE_NAVEGACAO[destino.id];

  return (
    <NavLink
      to={destino.to}
      end={destino.end}
      className={({ isActive }) =>
        cn(
          'flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 border-t-2 px-0.5 text-[11px] leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
          isActive ? 'border-accent text-accent' : 'border-transparent text-fg-muted',
        )
      }
    >
      <Icone size={20} aria-hidden="true" />
      <span className="max-w-full truncate">{destino.rotulo}</span>
    </NavLink>
  );
}
