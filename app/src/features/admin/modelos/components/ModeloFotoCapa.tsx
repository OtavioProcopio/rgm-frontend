import { useState } from 'react';
import { ImageOff, ZoomIn } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export function ModeloFotoCapa({ fotoUrl, className }: { fotoUrl: string | null; className?: string }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!fotoUrl || imgError) {
    return (
      <div className={cn("flex w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/50", className || "h-48")}>
        <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
          <ImageOff size={32} />
          <span className="text-xs">Sem foto de capa</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="group relative block w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        aria-label="Ampliar foto de capa"
      >
        <img
          src={fotoUrl}
          alt="Foto de capa"
          className={cn("w-full object-cover transition-transform duration-300 group-hover:scale-105", className || "h-48")}
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/30">
          <ZoomIn
            size={28}
            className="text-white opacity-0 drop-shadow-md transition-opacity duration-200 group-hover:opacity-100"
          />
        </div>
      </button>

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={fotoUrl}
            alt="Foto de capa ampliada"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
