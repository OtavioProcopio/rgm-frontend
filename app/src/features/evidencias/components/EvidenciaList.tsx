import { useState } from 'react';

import { ConfirmDialog } from '@/shared/components/ConfirmDialog/ConfirmDialog';
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
  const [idParaExcluir, setIdParaExcluir] = useState<string | null>(null);
  // Some da lista (excluída por outro usuário) fecha a pergunta junto.
  const paraExcluir = evidencias.find((evidencia) => evidencia.id === idParaExcluir);

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
          onDelete={onDelete ? setIdParaExcluir : undefined}
          isDeleting={isDeleting}
        />
      ))}
      {paraExcluir ? (
        <ConfirmDialog
          title="Excluir evidência"
          message={`A evidência "${paraExcluir.nomeArquivo}" será excluída. Não há como desfazer.`}
          confirmLabel="Excluir"
          variant="danger"
          onCancel={() => setIdParaExcluir(null)}
          onConfirm={() => {
            onDelete?.(paraExcluir.id);
            setIdParaExcluir(null);
          }}
        />
      ) : null}
    </div>
  );
}
