import { useState } from 'react';
import { ImageOff, Star, X, ZoomIn } from 'lucide-react';

import { Button } from '@/shared/components/Button/Button';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog/ConfirmDialog';

import type { FotoGaleria } from '../types/galeriaTypes';

type Props = {
  foto: FotoGaleria;
  podeGerenciar: boolean;
  isSaving?: boolean;
  isRemoving?: boolean;
  onDefinirCapa: () => void;
  onRenomear: (identificacao: string) => void;
  onRemover: () => void;
};

export function GaleriaFotoCard({
  foto,
  podeGerenciar,
  isSaving,
  isRemoving,
  onDefinirCapa,
  onRenomear,
  onRemover,
}: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [identificacao, setIdentificacao] = useState(foto.identificacao);
  const [showConfirmRemover, setShowConfirmRemover] = useState(false);

  function handleSalvarIdentificacao() {
    const trimmed = identificacao.trim();
    if (trimmed && trimmed !== foto.identificacao) {
      onRenomear(trimmed);
    }
    setEditing(false);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="relative">
        {!imgError ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="group block h-40 w-full focus:outline-none"
            aria-label={`Ampliar foto: ${foto.identificacao}`}
          >
            <img
              src={foto.publicUrl}
              alt={foto.identificacao}
              className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
              <ZoomIn
                size={24}
                className="text-white opacity-0 drop-shadow-md transition-opacity duration-200 group-hover:opacity-100"
              />
            </div>
          </button>
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-slate-50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500">
            <ImageOff size={28} />
          </div>
        )}
        {foto.principal ? (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-sky-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
            <Star size={12} fill="currentColor" /> Capa
          </span>
        ) : null}
      </div>
      <div className="space-y-2 p-3">
        {editing ? (
          <input
            autoFocus
            value={identificacao}
            onChange={(event) => setIdentificacao(event.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-950 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        ) : (
          <p
            className="truncate text-sm font-medium text-slate-800 dark:text-slate-100"
            title={foto.identificacao}
          >
            {foto.identificacao}
          </p>
        )}
        {podeGerenciar ? (
          <div className="flex flex-wrap gap-1.5">
            {editing ? (
              <>
                <Button
                  variant="secondary"
                  className="px-2 py-1 text-xs"
                  disabled={isSaving}
                  onClick={handleSalvarIdentificacao}
                >
                  Salvar
                </Button>
                <Button
                  variant="ghost"
                  className="px-2 py-1 text-xs"
                  disabled={isSaving}
                  onClick={() => {
                    setEditing(false);
                    setIdentificacao(foto.identificacao);
                  }}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setEditing(true)}>
                  Renomear
                </Button>
                {!foto.principal ? (
                  <Button
                    variant="ghost"
                    className="px-2 py-1 text-xs"
                    disabled={isSaving}
                    onClick={onDefinirCapa}
                  >
                    Definir capa
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  disabled={isRemoving}
                  onClick={() => setShowConfirmRemover(true)}
                >
                  Remover
                </Button>
              </>
            )}
          </div>
        ) : null}
      </div>

      {showConfirmRemover ? (
        <div className="border-t border-slate-200 p-3 dark:border-slate-700">
          <ConfirmDialog
            title="Remover foto"
            message="Esta foto será removida permanentemente da galeria. Deseja continuar?"
            confirmLabel="Remover"
            variant="danger"
            isPending={isRemoving}
            onCancel={() => setShowConfirmRemover(false)}
            onConfirm={() => {
              onRemover();
              setShowConfirmRemover(false);
            }}
          />
        </div>
      ) : null}

      {lightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={foto.publicUrl}
            alt={foto.identificacao}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
