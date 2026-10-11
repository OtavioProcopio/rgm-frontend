import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  /** O que a pessoa pode fazer a partir daqui: um link ou um botão. */
  action?: ReactNode;
  /** Ícone decorativo; sem ele, aparece a caixa vazia padrão. */
  icone?: ReactNode;
};

function IconeDeCaixaVazia() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8"
    >
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}

export function EmptyState({ title, description, action, icone }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-line-strong bg-surface p-6 text-center">
      <div aria-hidden="true" className="mb-3 flex justify-center text-fg-muted">
        {icone ?? <IconeDeCaixaVazia />}
      </div>
      <h2 className="text-base font-semibold text-fg">{title}</h2>
      {description ? <p className="mt-1 text-sm text-fg-muted">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
