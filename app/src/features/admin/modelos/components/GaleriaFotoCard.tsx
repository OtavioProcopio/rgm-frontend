import { useState } from 'react';
import { Check, ImageOff, Pencil, Star, Trash2, X, ZoomIn } from 'lucide-react';

import { ConfirmDialog } from '@/shared/components/ConfirmDialog/ConfirmDialog';
import { cn } from '@/shared/lib/cn';

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

  function handleCancelarEdicao() {
    setEditing(false);
    setIdentificacao(foto.identificacao);
  }

  return (
    <div className="group/card overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <div className="relative">
        {!imgError ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="group block h-44 w-full focus:outline-none"
            aria-label={`Ampliar foto: ${foto.identificacao}`}
          >
            <img
              src={foto.publicUrl}
              alt={foto.identificacao}
              className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
          <div className="flex h-44 w-full items-center justify-center bg-slate-50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500">
            <ImageOff size={28} />
          </div>
        )}
        {foto.principal ? (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-sky-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
            <Star size={12} fill="currentColor" /> Capa
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2 p-3">
        {editing ? (
          <>
            <input
              autoFocus
              value={identificacao}
              onChange={(event) => setIdentificacao(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSalvarIdentificacao();
                if (event.key === 'Escape') handleCancelarEdicao();
              }}
              className="h-8 w-full min-w-0 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-950 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <IconButton
              label="Salvar identificação"
              disabled={isSaving}
              onClick={handleSalvarIdentificacao}
              className="text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
            >
              <Check size={16} />
            </IconButton>
            <IconButton label="Cancelar edição" disabled={isSaving} onClick={handleCancelarEdicao}>
              <X size={16} />
            </IconButton>
          </>
        ) : (
          <>
            <p
              className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100"
              title={foto.identificacao}
            >
              {foto.identificacao}
            </p>
            {podeGerenciar ? (
              <div className="flex shrink-0 items-center gap-1">
                <IconButton label="Renomear foto" onClick={() => setEditing(true)}>
                  <Pencil size={15} />
                </IconButton>
                {!foto.principal ? (
                  <IconButton
                    label="Definir capa"
                    disabled={isSaving}
                    onClick={onDefinirCapa}
                  >
                    <Star size={15} />
                  </IconButton>
                ) : null}
                <IconButton
                  label="Remover foto"
                  disabled={isRemoving}
                  onClick={() => setShowConfirmRemover(true)}
                  className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <Trash2 size={15} />
                </IconButton>
              </div>
            ) : null}
          </>
        )}
      </div>

      {showConfirmRemover ? (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowConfirmRemover(false)}
        >
          <div className="w-full max-w-sm" onClick={(event) => event.stopPropagation()}>
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

function IconButton({
  label,
  disabled,
  onClick,
  className,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800',
        className,
      )}
    >
      {children}
    </button>
  );
}
