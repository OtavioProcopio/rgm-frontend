import { useState } from 'react';
import { ImageOff, Star } from 'lucide-react';

import type { FotoGaleria } from '../types/galeriaTypes';

type Props = {
  foto: FotoGaleria;
  overlayCount?: number;
  onClick: () => void;
};

export function GaleriaFotoThumb({ foto, overlayCount, onClick }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-700"
      aria-label={
        overlayCount ? `Ver galeria completa (mais ${overlayCount} fotos)` : `Ver foto: ${foto.identificacao}`
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
        <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500">
          <ImageOff size={18} />
        </div>
      )}
      {foto.principal ? (
        <span className="absolute left-1 top-1 inline-flex items-center rounded-full bg-sky-600 p-1 text-white shadow">
          <Star size={9} fill="currentColor" />
        </span>
      ) : null}
      {overlayCount ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-semibold text-white">
          +{overlayCount}
        </div>
      ) : null}
    </button>
  );
}
