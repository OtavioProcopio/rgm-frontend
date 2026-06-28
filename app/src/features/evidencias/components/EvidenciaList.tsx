import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';

import type { Evidencia } from '../types/evidenciaTypes';
import { EvidenciaPreview } from './EvidenciaPreview';

type Props = {
  evidencias: Evidencia[];
  isLoading?: boolean;
  onDelete?: (evidenciaId: string) => void;
  isDeleting?: boolean;
};

export function EvidenciaList({ evidencias, isLoading, onDelete, isDeleting }: Props) {
  if (isLoading) return <LoadingState title="Carregando evidências..." />;

  if (evidencias.length === 0) {
    return (
      <EmptyState
        title="Nenhuma evidência"
        description="Faça upload de arquivos para documentar esta solicitação."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {evidencias.map((evidencia) => (
        <EvidenciaPreview
          key={evidencia.id}
          evidencia={evidencia}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
}
