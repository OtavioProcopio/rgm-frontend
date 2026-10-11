import { Trash2 } from 'lucide-react';

import type { Evidencia } from '../types/evidenciaTypes';

type Props = {
  evidencia: Evidencia;
  onDelete?: (evidenciaId: string) => void;
  isDeleting?: boolean;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function EvidenciaPreview({ evidencia, onDelete, isDeleting }: Props) {
  const isImage = evidencia.mimeType.startsWith('image/');

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface">
      {/* Thumbnail */}
      {isImage ? (
        <a
          href={evidencia.publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block shrink-0"
        >
          <img
            src={evidencia.publicUrl}
            alt={evidencia.nomeArquivo}
            className="h-32 w-full object-cover"
          />
        </a>
      ) : (
        <div className="flex h-24 shrink-0 items-center justify-center bg-surface-muted text-sm text-fg-muted">
          Arquivo
        </div>
      )}

      {/* Info + ações */}
      <div className="flex flex-col gap-1 p-2">
        <p className="truncate text-xs font-medium text-fg">{evidencia.nomeArquivo}</p>
        <p className="text-xs text-fg-muted">{formatBytes(evidencia.tamanhoBytes)}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <a
            href={evidencia.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-accent hover:underline"
          >
            Abrir
          </a>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(evidencia.id)}
              disabled={isDeleting}
              aria-label="Excluir evidência"
              className="rounded p-1 text-fg-muted hover:bg-danger-soft hover:text-danger-fg disabled:opacity-50"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
