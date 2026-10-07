import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  /** O que a pessoa pode fazer a partir daqui: um link ou um botão. */
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
