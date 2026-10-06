import { useRef, useState } from 'react';

import { Button } from '@/shared/components/Button/Button';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import {
  nomesDosTipos,
  TAMANHO_MAXIMO_MB,
  TIPOS_DE_EVIDENCIA,
  validarArquivo,
} from '@/shared/lib/arquivoPermitido';

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

    const erro = validarArquivo(file);
    setValidationError(erro);
    if (erro) {
      e.target.value = '';
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
          aria-label="Arquivo de evidência"
          accept={TIPOS_DE_EVIDENCIA.join(',')}
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
        <span className="text-xs text-slate-400">
          {nomesDosTipos(TIPOS_DE_EVIDENCIA)} — máx. {TAMANHO_MAXIMO_MB} MB
        </span>
      </div>
    </div>
  );
}
