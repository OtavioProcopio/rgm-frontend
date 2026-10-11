import { cn } from '@/shared/lib/cn';

type SkeletonProps = {
  className?: string;
};

/** Bloco que ocupa o lugar do conteúdo que carrega. Decorativo: quem anuncia é o `LoadingState`. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('rounded-md bg-line motion-safe:animate-pulse', className)}
    />
  );
}
