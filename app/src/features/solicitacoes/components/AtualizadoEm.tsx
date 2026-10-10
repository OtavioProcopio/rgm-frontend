import type { JSX } from 'react';

interface AtualizadoEmProps {
  instante: number | undefined;
  className?: string;
}

const CLASSE_BASE: string = 'text-xs text-fg-muted';

function instanteValido(instante: number | undefined): instante is number {
  return instante !== undefined && Number.isFinite(instante) && instante > 0;
}

function formatarHora(instante: number): string {
  return new Date(instante).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function AtualizadoEm({ instante, className }: AtualizadoEmProps): JSX.Element | null {
  if (!instanteValido(instante)) return null;
  const classes: string = className ? `${CLASSE_BASE} ${className}` : CLASSE_BASE;
  return (
    <time dateTime={new Date(instante).toISOString()} className={classes}>
      Atualizado às {formatarHora(instante)}
    </time>
  );
}
