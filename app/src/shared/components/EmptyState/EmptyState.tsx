type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-center">
      <h2 className="text-base font-semibold text-gray-950">{title}</h2>
      {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
    </div>
  );
}
