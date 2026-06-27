import { Button } from '@/shared/components/Button/Button';

type PaginationProps = {
  page: number;
  totalPages: number;
  totalElements: number;
  itemLabel?: string;
  onPrev: () => void;
  onNext: () => void;
};

export function Pagination({
  page,
  totalPages,
  totalElements,
  itemLabel = 'item(s)',
  onPrev,
  onNext,
}: PaginationProps) {
  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Página {page + 1} de {Math.max(totalPages, 1)} &bull; {totalElements} {itemLabel}
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" disabled={page === 0} onClick={onPrev}>
          Anterior
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={page + 1 >= totalPages}
          onClick={onNext}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
