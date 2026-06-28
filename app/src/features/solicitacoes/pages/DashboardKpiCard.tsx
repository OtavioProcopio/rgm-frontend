import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

import { cn } from '@/shared/lib/cn';

type Gradient = 'sky' | 'purple' | 'emerald' | 'amber' | 'rose' | 'slate';

const GRADIENT_CLASSES: Record<Gradient, string> = {
  sky: 'from-sky-500/10 to-blue-500/5 dark:from-sky-500/10 dark:to-blue-500/5 hover:border-sky-300 dark:hover:border-sky-600 text-sky-600 dark:text-sky-400',
  purple:
    'from-purple-500/10 to-indigo-500/5 dark:from-purple-500/10 dark:to-indigo-500/5 hover:border-purple-300 dark:hover:border-purple-600 text-purple-600 dark:text-purple-400',
  emerald:
    'from-emerald-500/10 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/5 hover:border-emerald-300 dark:hover:border-emerald-600 text-emerald-600 dark:text-emerald-400',
  amber:
    'from-amber-500/10 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/5 hover:border-amber-300 dark:hover:border-amber-600 text-amber-600 dark:text-amber-400',
  rose: 'from-rose-500/10 to-red-500/5 dark:from-rose-500/10 dark:to-red-500/5 hover:border-rose-300 dark:hover:border-rose-600 text-rose-600 dark:text-rose-400',
  slate:
    'from-slate-500/10 to-zinc-500/5 dark:from-slate-550/10 dark:to-zinc-500/5 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400',
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
  const selectedGradient = gradient ? GRADIENT_CLASSES[gradient] : GRADIENT_CLASSES.slate;
  const isClickable = Boolean(onClickPath);

  const cardContent = (
    <div
      className={cn(
        'relative flex flex-col gap-2 rounded-xl border border-slate-200/85 bg-gradient-to-br p-5 shadow-sm transition-all duration-300 dark:border-slate-700/60 dark:bg-slate-800',
        selectedGradient,
        isClickable && 'hover:shadow-md cursor-pointer hover:-translate-y-0.5',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={18} />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </span>
        </div>
        {isClickable && (
          <ArrowRight
            size={14}
            className="opacity-0 transition-opacity group-hover:opacity-100 text-slate-400"
          />
        )}
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-white">
        {value}
      </p>
      {subtext && (
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtext}</p>
      )}
    </div>
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
