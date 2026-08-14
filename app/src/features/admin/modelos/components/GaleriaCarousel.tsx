import { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, ImageOff, Pencil, Star, Trash2, X } from 'lucide-react';

import { ConfirmDialog } from '@/shared/components/ConfirmDialog/ConfirmDialog';
import { cn } from '@/shared/lib/cn';

import type { FotoGaleria } from '../types/galeriaTypes';

type Props = {
  fotos: FotoGaleria[];
  initialIndex: number;
  podeGerenciar: boolean;
  pendingFotoId: string | null;
  isSavingGlobal: boolean;
  isRemovingGlobal: boolean;
  onDefinirCapa: (fotoId: string) => void;
  onRenomear: (fotoId: string, identificacao: string) => void;
  onRemover: (fotoId: string) => void;
  onClose: () => void;
};

export function GaleriaCarousel({
  fotos,
  initialIndex,
  podeGerenciar,
  pendingFotoId,
  isSavingGlobal,
  isRemovingGlobal,
  onDefinirCapa,
  onRenomear,
  onRemover,
  onClose,
}: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [showConfirmRemover, setShowConfirmRemover] = useState(false);

  const safeIndex = fotos.length ? ((index % fotos.length) + fotos.length) % fotos.length : 0;
  const foto = fotos[safeIndex];
  const isSaving = !!foto && pendingFotoId === foto.id && isSavingGlobal;
  const isRemoving = !!foto && pendingFotoId === foto.id && isRemovingGlobal;

  useEffect(() => {
    if (fotos.length === 0) onClose();
  }, [fotos.length, onClose]);

  function goPrev() {
    setShowConfirmRemover(false);
    setIndex((current) => current - 1);
  }

  function goNext() {
    setShowConfirmRemover(false);
    setIndex((current) => current + 1);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (showConfirmRemover) {
        if (event.key === 'Escape') setShowConfirmRemover(false);
        return;
      }
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft' && fotos.length > 1) goPrev();
      if (event.key === 'ArrowRight' && fotos.length > 1) goNext();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!foto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Galeria de fotos: ${foto.identificacao}`}
      className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm"
    >
      <CarouselPhotoPanel
        key={foto.id}
        foto={foto}
        podeGerenciar={podeGerenciar}
        isSaving={isSaving}
        isRemoving={isRemoving}
        onDefinirCapa={() => onDefinirCapa(foto.id)}
        onRenomear={(identificacao) => onRenomear(foto.id, identificacao)}
        onRequestRemove={() => setShowConfirmRemover(true)}
        onClose={onClose}
      >
        {fotos.length > 1 ? (
          <button
            type="button"
            onClick={goPrev}
            aria-label="Foto anterior"
            className="absolute left-2 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft size={22} />
          </button>
        ) : null}
        {fotos.length > 1 ? (
          <button
            type="button"
            onClick={goNext}
            aria-label="Próxima foto"
            className="absolute right-2 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-6"
          >
            <ChevronRight size={22} />
          </button>
        ) : null}
      </CarouselPhotoPanel>

      {fotos.length > 1 ? (
        <p className="pb-4 text-center text-sm text-white/60">
          {safeIndex + 1} / {fotos.length}
        </p>
      ) : null}

      {showConfirmRemover ? (
        <div
          role="presentation"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
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
                onRemover(foto.id);
                setShowConfirmRemover(false);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CarouselPhotoPanel({
  foto,
  podeGerenciar,
  isSaving,
  isRemoving,
  onDefinirCapa,
  onRenomear,
  onRequestRemove,
  onClose,
  children,
}: {
  foto: FotoGaleria;
  podeGerenciar: boolean;
  isSaving: boolean;
  isRemoving: boolean;
  onDefinirCapa: () => void;
  onRenomear: (identificacao: string) => void;
  onRequestRemove: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [imgError, setImgError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [identificacao, setIdentificacao] = useState(foto.identificacao);

  function handleSalvarIdentificacao() {
    const trimmed = identificacao.trim();
    if (trimmed && trimmed !== foto.identificacao) {
      onRenomear(trimmed);
    }
    setEditing(false);
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {editing ? (
            <input
              autoFocus
              value={identificacao}
              onChange={(event) => setIdentificacao(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSalvarIdentificacao();
                if (event.key === 'Escape') setEditing(false);
              }}
              className="h-9 w-full max-w-xs rounded-md border border-white/30 bg-white/10 px-2 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30"
            />
          ) : (
            <>
              <p className="min-w-0 truncate text-base font-medium text-white" title={foto.identificacao}>
                {foto.identificacao}
              </p>
              {foto.principal ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sky-600 px-2 py-0.5 text-xs font-semibold text-white">
                  <Star size={11} fill="currentColor" /> Capa
                </span>
              ) : null}
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {podeGerenciar ? (
            editing ? (
              <>
                <CarouselIconButton
                  label="Salvar identificação"
                  disabled={isSaving}
                  onClick={handleSalvarIdentificacao}
                  className="text-emerald-400 hover:bg-emerald-400/10"
                >
                  <Check size={16} />
                </CarouselIconButton>
                <CarouselIconButton label="Cancelar edição" disabled={isSaving} onClick={() => setEditing(false)}>
                  <X size={16} />
                </CarouselIconButton>
              </>
            ) : (
              <>
                <CarouselIconButton label="Renomear foto" onClick={() => setEditing(true)}>
                  <Pencil size={16} />
                </CarouselIconButton>
                {!foto.principal ? (
                  <CarouselIconButton label="Definir capa" disabled={isSaving} onClick={onDefinirCapa}>
                    <Star size={16} />
                  </CarouselIconButton>
                ) : null}
                <CarouselIconButton
                  label="Remover foto"
                  disabled={isRemoving}
                  onClick={onRequestRemove}
                  className="text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 size={16} />
                </CarouselIconButton>
              </>
            )
          ) : null}
          <CarouselIconButton label="Fechar" onClick={onClose}>
            <X size={18} />
          </CarouselIconButton>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-4">
        {children}
        {!imgError ? (
          <img
            src={foto.publicUrl}
            alt={foto.identificacao}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-64 w-64 items-center justify-center rounded-lg bg-white/5 text-white/50">
            <ImageOff size={40} />
          </div>
        )}
      </div>
    </>
  );
}

function CarouselIconButton({
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
        'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      {children}
    </button>
  );
}
