import { useState } from 'react';
import { ImageOff, Star } from 'lucide-react';

import type { FotoGaleria } from '../types/galeriaTypes';

type Props = {
  foto: FotoGaleria;
  overlayCount?: number;
  ativa?: boolean;
  onClick: () => void;
};

const BASE = 'group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border';
const CONTORNO_ATIVA = 'border-accent ring-2 ring-accent';

export function GaleriaFotoThumb({ foto, overlayCount, ativa = false, onClick }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={ativa ? 'true' : undefined}
      className={`${BASE} ${ativa ? CONTORNO_ATIVA : 'border-line'}`}
      aria-label={
        overlayCount
          ? `Ver galeria completa (mais ${overlayCount} fotos)`
          : `Ver foto: ${foto.identificacao}`
      }
    >
      {!imgError ? (
        <img
          src={foto.publicUrl}
          alt={foto.identificacao}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-surface-muted text-fg-muted">
          <ImageOff size={18} />
        </div>
      )}
      {foto.principal ? (
        <span className="absolute left-1 top-1 inline-flex items-center rounded-full bg-accent p-1 text-on-accent shadow">
          <Star size={9} fill="currentColor" />
        </span>
      ) : null}
      {overlayCount ? (
        <div className="absolute inset-0 flex items-center justify-center bg-scrim text-sm font-semibold text-on-solid">
          +{overlayCount}
        </div>
      ) : null}
    </button>
  );
}
