import { Skeleton } from '@/shared/components/Skeleton/Skeleton';

type LoadingStateProps = {
  title?: string;
  /** Quantas linhas de esqueleto desenhar; a forma do conteúdo, não um spinner. */
  linhas?: number;
};

/** Esqueleto anunciado como estado: o texto fica oculto da vista e disponível ao leitor de tela. */
export function LoadingState({ title = 'Carregando...', linhas = 3 }: LoadingStateProps) {
  return (
    <div role="status" className="space-y-3 rounded-md border border-line bg-surface-muted p-6">
      <span className="sr-only">{title}</span>
      {Array.from({ length: linhas }, (_, indice) => (
        <Skeleton key={indice} className={indice === linhas - 1 ? 'h-4 w-2/3' : 'h-4 w-full'} />
      ))}
    </div>
  );
}
