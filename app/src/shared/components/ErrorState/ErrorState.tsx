type ErrorStateProps = {
  title?: string;
  description?: string;
};

export function ErrorState({
  title = 'Não foi possível carregar os dados.',
  description,
}: ErrorStateProps) {
  return (
    <div className="rounded-md border border-danger bg-danger-soft p-6">
      <h2 className="text-base font-semibold text-danger-fg">{title}</h2>
      {description ? <p className="mt-1 text-sm text-danger-fg">{description}</p> : null}
    </div>
  );
}
