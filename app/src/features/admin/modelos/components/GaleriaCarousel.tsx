import { useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, ImageOff, Pencil, Star, Trash2, X } from 'lucide-react';

import { Badge } from '@/shared/components/Badge/Badge';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog/ConfirmDialog';
import { Dialog } from '@/shared/components/Dialog/Dialog';
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

const SETA =
  'absolute z-10 rounded-full bg-scrim p-2 text-on-solid transition hover:brightness-125';

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
    // Esc é do `Dialog`; aqui ficam só as setas, que trocam de foto.
    function handleKeyDown(event: KeyboardEvent) {
      // Com a confirmação aberta, o teclado é dela.
      if (showConfirmRemover || fotos.length <= 1) return;
      if (event.key === 'ArrowLeft') goPrev();
      if (event.key === 'ArrowRight') goNext();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!foto) return null;

  return (
    <>
      <Dialog
        aparencia="imersivo"
        titulo={`Galeria de fotos: ${foto.identificacao}`}
        onClose={onClose}
      >
        <div className="flex h-full flex-col">
          <CarouselPhotoPanel
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
                className={cn(SETA, 'left-2 sm:left-6')}
              >
                <ChevronLeft size={22} />
              </button>
            ) : null}
            {fotos.length > 1 ? (
              <button
                type="button"
                onClick={goNext}
                aria-label="Próxima foto"
                className={cn(SETA, 'right-2 sm:right-6')}
              >
                <ChevronRight size={22} />
              </button>
            ) : null}
          </CarouselPhotoPanel>

          {fotos.length > 1 ? (
            <p className="pb-4 text-center text-sm text-on-solid">
              {safeIndex + 1} / {fotos.length}
            </p>
          ) : null}
        </div>
      </Dialog>

      {showConfirmRemover ? (
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
      ) : null}
    </>
  );
}

/**
 * O `Dialog` ouve o teclado a partir do controle focado. Quando esse controle sai da tela
 * (a edição termina, a foto vira capa), o foco volta para a primeira ação do cabeçalho,
 * para Esc e Tab continuarem valendo.
 */
function useFocoNasAcoes() {
  const acoes = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (document.activeElement !== document.body) return;
    acoes.current?.querySelector<HTMLElement>('button:not([disabled])')?.focus();
  });
  return acoes;
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
  // Os estados guardam a foto a que se referem: trocar de foto os desfaz sem remontar os
  // controles, e o foco fica onde estava.
  const [fotoComErro, setFotoComErro] = useState<string | null>(null);
  const [fotoEmEdicao, setFotoEmEdicao] = useState<string | null>(null);
  const [identificacao, setIdentificacao] = useState(foto.identificacao);
  const acoes = useFocoNasAcoes();
  const imgError = fotoComErro === foto.id;
  const editing = fotoEmEdicao === foto.id;

  function handleEditar() {
    setIdentificacao(foto.identificacao);
    setFotoEmEdicao(foto.id);
  }

  function handleSalvarIdentificacao() {
    const trimmed = identificacao.trim();
    if (trimmed && trimmed !== foto.identificacao) {
      onRenomear(trimmed);
    }
    setFotoEmEdicao(null);
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
                if (event.key === 'Escape') setFotoEmEdicao(null);
                if (event.key !== 'Enter') return;
                // O foco vai para o botão de renomear; sem isto, o mesmo Enter o acionaria.
                event.preventDefault();
                handleSalvarIdentificacao();
              }}
              className="h-9 w-full max-w-xs rounded-md border border-line-strong bg-surface px-2 text-sm text-fg outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
            />
          ) : (
            <>
              <p
                className="min-w-0 truncate text-base font-medium text-on-solid"
                title={foto.identificacao}
              >
                {foto.identificacao}
              </p>
              {foto.principal ? (
                <Badge
                  variant="accent"
                  icon={<Star size={11} fill="currentColor" />}
                  className="shrink-0 px-2 font-semibold"
                >
                  Capa
                </Badge>
              ) : null}
            </>
          )}
        </div>
        <div ref={acoes} className="flex shrink-0 items-center gap-1">
          {podeGerenciar ? (
            editing ? (
              <>
                <CarouselIconButton
                  label="Salvar identificação"
                  disabled={isSaving}
                  onClick={handleSalvarIdentificacao}
                >
                  <Check size={16} />
                </CarouselIconButton>
                <CarouselIconButton
                  label="Cancelar edição"
                  disabled={isSaving}
                  onClick={() => setFotoEmEdicao(null)}
                >
                  <X size={16} />
                </CarouselIconButton>
              </>
            ) : (
              <>
                <CarouselIconButton label="Renomear foto" onClick={handleEditar}>
                  <Pencil size={16} />
                </CarouselIconButton>
                {!foto.principal ? (
                  <CarouselIconButton
                    label="Definir capa"
                    disabled={isSaving}
                    onClick={onDefinirCapa}
                  >
                    <Star size={16} />
                  </CarouselIconButton>
                ) : null}
                <CarouselIconButton
                  label="Remover foto"
                  disabled={isRemoving}
                  onClick={onRequestRemove}
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
            onError={() => setFotoComErro(foto.id)}
          />
        ) : (
          <div className="flex h-64 w-64 items-center justify-center rounded-lg text-on-solid">
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
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-on-solid transition hover:bg-scrim disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}
