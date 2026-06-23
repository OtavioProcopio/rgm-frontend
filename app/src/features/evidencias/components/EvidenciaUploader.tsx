import { useRef, useState } from 'react';

import { Button } from '@/shared/components/Button/Button';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';

const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

type Props = {
  isPending?: boolean;
  onUpload: (file: File) => void;
};

export function EvidenciaUploader({ isPending, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationError(null);

    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      setValidationError('Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou PDF.');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setValidationError('Arquivo muito grande. O limite é 10 MB.');
      return;
    }

    onUpload(file);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="space-y-3">
      {validationError ? (
        <ErrorState title="Arquivo inválido" description={validationError} />
      ) : null}
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_MIME_TYPES.join(',')}
          className="hidden"
          onChange={handleChange}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          {isPending ? 'Enviando...' : 'Anexar arquivo'}
        </Button>
        <span className="text-xs text-slate-400">JPG, PNG, WEBP, PDF — máx. 10 MB</span>
      </div>
    </div>
  );
}
