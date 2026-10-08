import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

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

export function KPICard({
  icon: Icon,
  label,
  value,
  subtext,
  gradient,
  onClickPath,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  gradient?: Gradient;
  onClickPath?: string;
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
