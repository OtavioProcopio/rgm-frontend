type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      ) : null}
    </div>
  );
}
