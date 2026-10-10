import { Button } from '@/shared/components/Button/Button';

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Não foi possível carregar os dados.',
  description,
  onRetry,
}: ErrorStateProps) {
  return (
    <div role="alert" className="rounded-md border border-danger bg-danger-soft p-6">
      <h2 className="text-base font-semibold text-danger-fg">{title}</h2>
      {description ? <p className="mt-1 text-sm text-danger-fg">{description}</p> : null}
      {onRetry ? (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}
