type LoadingStateProps = {
  title?: string;
};

export function LoadingState({ title = 'Carregando...' }: LoadingStateProps) {
  return (
    <div className="rounded-md border border-line bg-surface-muted p-6 text-sm text-fg-muted">
      {title}
    </div>
  );
}
