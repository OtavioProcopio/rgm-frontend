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
    <div className="relative rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(evidencia.id)}
          disabled={isDeleting}
          aria-label="Excluir evidência"
          className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
        >
          <Trash2 size={14} />
        </button>
      )}
      {isImage ? (
        <a href={evidencia.publicUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={evidencia.publicUrl}
            alt={evidencia.nomeArquivo}
            className="mb-2 h-32 w-full rounded object-cover"
          />
        </a>
      ) : (
        <div className="mb-2 flex h-16 items-center justify-center rounded bg-slate-100 text-sm text-slate-500 dark:bg-slate-700 dark:text-slate-400">
          Arquivo
        </div>
      )}
      <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
        {evidencia.nomeArquivo}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500">
        {formatBytes(evidencia.tamanhoBytes)}
      </p>
      <a
        href={evidencia.publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
      >
        Abrir
      </a>
    </div>
  );
}
