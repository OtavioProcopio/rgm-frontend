import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Minus,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router';

import type { Leitura, Tom } from '../lib/leituraDosIndicadores';

import { Card } from '@/shared/components/Card/Card';
import { cn } from '@/shared/lib/cn';

type Gradient = 'sky' | 'purple' | 'emerald' | 'amber' | 'rose' | 'slate';

/** O indicador é neutro; a cor pedida vale só para o ícone. */
const ICON_CLASSES: Record<Gradient, string> = {
  sky: 'text-accent',
  purple: 'text-accent',
  emerald: 'text-success-fg',
  amber: 'text-warning-fg',
  rose: 'text-danger-fg',
  slate: 'text-fg-muted',
};

const TONS: Record<Tom, { Icone: LucideIcon; classe: string }> = {
  ok: { Icone: CheckCircle2, classe: 'text-success-fg' },
  atencao: { Icone: AlertTriangle, classe: 'text-warning-fg' },
  ruim: { Icone: XCircle, classe: 'text-danger-fg' },
  neutro: { Icone: Minus, classe: 'text-fg-muted' },
};

/** O estado vai sempre em texto; o ícone só reforça e nunca é anunciado. */
function LinhaDeLeitura({ leitura }: { leitura: Leitura }) {
  const { Icone, classe } = TONS[leitura.tom];

  return (
    <p className={cn('flex items-center gap-1.5 text-xs font-medium', classe)}>
      <Icone size={14} aria-hidden="true" className={classe} />
      {leitura.texto}
    </p>
  );
}

export function KPICard({
  icon: Icon,
  label,
  value,
  subtext,
  gradient,
  onClickPath,
  leitura,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  gradient?: Gradient;
  onClickPath?: string;
  leitura?: Leitura;
}) {
  const iconClass = ICON_CLASSES[gradient ?? 'slate'];
  const isClickable = Boolean(onClickPath);

  const cardContent = (
    <Card
      className={cn(
        'relative flex flex-col gap-2 p-5 transition-all duration-300 hover:border-line-strong',
        isClickable && 'hover:shadow-md cursor-pointer hover:-translate-y-0.5',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={18} className={iconClass} />
          <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
            {label}
          </span>
        </div>
        {isClickable && (
          <ArrowRight
            size={14}
            className="opacity-0 transition-opacity group-hover:opacity-100 text-fg-muted"
          />
        )}
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-fg">{value}</p>
      {subtext && <p className="text-xs text-fg-muted font-medium">{subtext}</p>}
      {leitura && <LinhaDeLeitura leitura={leitura} />}
    </Card>
  );

  if (onClickPath) {
    return (
      <Link to={onClickPath} className="group block h-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
