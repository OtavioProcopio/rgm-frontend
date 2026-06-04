type ErrorStateProps = {
  title?: string;
  description?: string;
};

export function ErrorState({
  title = 'Não foi possível carregar os dados.',
  description,
}: ErrorStateProps) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-6 dark:border-red-900/70 dark:bg-red-950/30">
      <h2 className="text-base font-semibold text-red-950 dark:text-red-100">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-red-700 dark:text-red-200">{description}</p>
      ) : null}
    </div>
  );
}
