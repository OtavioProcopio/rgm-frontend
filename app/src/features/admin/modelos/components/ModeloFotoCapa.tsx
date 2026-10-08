import { useState } from 'react';
import { ImageOff, ZoomIn } from 'lucide-react';

import { Dialog } from '@/shared/components/Dialog/Dialog';
import { cn } from '@/shared/lib/cn';

export function ModeloFotoCapa({
  fotoUrl,
  className,
}: {
  fotoUrl: string | null;
  className?: string;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!fotoUrl || imgError) {
    return (
      <div
        className={cn(
          'flex w-full items-center justify-center rounded-lg border border-dashed border-line-strong bg-surface-muted',
          className || 'h-48',
        )}
      >
        <div className="flex flex-col items-center gap-2 text-fg-muted">
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
        className="group relative block w-full overflow-hidden rounded-lg border border-line focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Ampliar foto de capa"
      >
        <img
          src={fotoUrl}
          alt="Foto de capa"
          className={cn(
            'w-full object-cover transition-transform duration-300 group-hover:scale-105',
            className || 'h-48',
          )}
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <ZoomIn size={28} className="text-on-solid drop-shadow-md" />
        </div>
      </button>

      {lightboxOpen && (
        <Dialog
          aparencia="imersivo"
          titulo="Foto de capa ampliada"
          onClose={() => setLightboxOpen(false)}
        >
          <FotoAmpliada fotoUrl={fotoUrl} onClose={() => setLightboxOpen(false)} />
        </Dialog>
      )}
    </>
  );
}

/** Conteúdo do diálogo: clicar fora da foto fecha, como o botão. */
function FotoAmpliada({ fotoUrl, onClose }: { fotoUrl: string; onClose: () => void }) {
  return (
    <div
      className="relative flex h-full items-center justify-center p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <img
        src={fotoUrl}
        alt="Foto de capa"
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
      />
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-scrim p-2 text-on-solid transition hover:brightness-125"
        aria-label="Fechar"
      >
        ✕
      </button>
    </div>
  );
}
