import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

type TableProps = {
  /** Classes da moldura, que é quem rola na horizontal em tela estreita. */
  className?: string;
  children: ReactNode;
};

/** Tabela dentro de uma moldura com borda; o conteúdo das células é de quem usa. */
export function Table({ className, children }: TableProps) {
  return (
    <div className={cn('overflow-x-auto rounded-md border border-line', className)}>
      <table className="min-w-full divide-y divide-line text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-surface-muted text-left text-xs font-semibold uppercase tracking-wide text-fg-muted">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-line bg-surface">{children}</tbody>;
}

export function TableRow(props: HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} />;
}

export function TableHeaderCell({ className, ...resto }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th scope="col" className={cn('px-4 py-3', className)} {...resto} />;
}

export function TableCell({ className, ...resto }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3', className)} {...resto} />;
}
