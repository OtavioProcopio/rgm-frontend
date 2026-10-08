import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  /** O que a pessoa pode fazer a partir daqui: um link ou um botão. */
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-line-strong bg-surface p-6 text-center">
      <h2 className="text-base font-semibold text-fg">{title}</h2>
      {description ? <p className="mt-1 text-sm text-fg-muted">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
