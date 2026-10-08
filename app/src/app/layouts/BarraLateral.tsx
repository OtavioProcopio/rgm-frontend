import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { NavLink } from 'react-router';

import { ICONES_DE_NAVEGACAO } from '@/app/layouts/iconesDeNavegacao';
import { Logo } from '@/shared/components/Logo/Logo';
import { usePreferenciaGuardada } from '@/shared/hooks/usePreferenciaGuardada';
import { cn } from '@/shared/lib/cn';
import type { DestinoDeNavegacao } from '@/shared/lib/navegacao';

const CHAVE_DA_PREFERENCIA = 'rgm.barraLateral';
const ID_DA_NAVEGACAO = 'navegacao-principal-lateral';

type BarraLateralProps = {
  destinos: DestinoDeNavegacao[];
  identificacao: string;
};

type LinkDeDestinoProps = {
  destino: DestinoDeNavegacao;
  expandida: boolean;
};

function LinkDeDestino({ destino, expandida }: LinkDeDestinoProps) {
  const Icone = ICONES_DE_NAVEGACAO[destino.id];
  return (
    <NavLink
      to={destino.to}
      end={destino.end}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-fg-muted transition-colors pointer-coarse:min-h-11 hover:bg-surface-muted',
          isActive && 'bg-accent text-on-accent hover:bg-accent',
        )
      }
    >
      <Icone size={18} className="shrink-0" />
      <span className={cn(!expandida && 'sr-only')}>{destino.rotulo}</span>
      {expandida ? null : (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded-md border border-line bg-surface-raised px-2 py-1 text-xs text-fg shadow-lg group-hover:block group-focus-visible:block"
        >
          {destino.rotulo}
        </span>
      )}
    </NavLink>
  );
}

export function BarraLateral({ destinos, identificacao }: BarraLateralProps) {
  const [estado, alterarEstado] = usePreferenciaGuardada(CHAVE_DA_PREFERENCIA, 'expandida');
  const expandida = estado !== 'recolhida';
  const Icone = expandida ? PanelLeftClose : PanelLeftOpen;
  const alternar = (): void => alterarEstado(expandida ? 'recolhida' : 'expandida');

  return (
    <aside
      className={cn(
        'hidden border-r border-line bg-surface lg:flex lg:min-h-screen lg:shrink-0 lg:flex-col',
        'motion-safe:transition-[width] motion-safe:duration-200',
        expandida ? 'lg:w-[280px]' : 'lg:w-[72px]',
      )}
    >
      <div className={cn('border-b border-line py-5', expandida ? 'px-6' : 'px-3')}>
        <button
          type="button"
          onClick={alternar}
          aria-expanded={expandida}
          aria-controls={ID_DA_NAVEGACAO}
          aria-label={expandida ? 'Recolher menu lateral' : 'Expandir menu lateral'}
          className="flex items-center justify-center rounded-md p-2 text-fg-muted transition-colors pointer-coarse:min-h-11 hover:bg-surface-muted"
        >
          <Icone size={18} />
        </button>
        {expandida ? (
          <>
            <Logo className="mt-3 align-bottom" />
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-accent">
              {identificacao}
            </p>
          </>
        ) : null}
      </div>

      <nav
        id={ID_DA_NAVEGACAO}
        aria-label="Navegação principal"
        className="flex flex-1 flex-col gap-2 px-4 py-5"
      >
        {destinos.map((destino) => (
          <LinkDeDestino key={destino.id} destino={destino} expandida={expandida} />
        ))}
      </nav>
    </aside>
  );
}
