import { useRef, useState } from 'react';

import { Button } from '@/shared/components/Button/Button';
import { Input } from '@/shared/components/Input/Input';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

type Props = {
  isSubmitting?: boolean;
  onSubmit: (file: File, identificacao: string) => Promise<void>;
};

export function AdicionarFotoGaleriaForm({ isSubmitting, onSubmit }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [identificacao, setIdentificacao] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setFileError(null);

    if (!ACCEPTED_IMAGE_TYPES.includes(selected.type)) {
      setFileError('Apenas imagens nos formatos JPG, PNG ou WEBP são permitidas.');
      return;
    }

    if (selected.size > MAX_SIZE_BYTES) {
      setFileError('A imagem deve ter no máximo 10 MB.');
      return;
    }

    setFile(selected);
  }

  async function handleSubmit() {
    if (!file || !identificacao.trim()) return;
    await onSubmit(file, identificacao.trim());
    setFile(null);
    setIdentificacao('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <Input
          label="Identificação da foto"
          placeholder="Ex.: Contra-macho, Cavidade 1..."
          value={identificacao}
          disabled={isSubmitting}
          onChange={(event) => setIdentificacao(event.target.value)}
        />
        <label className="space-y-2 text-sm font-medium text-slate-800 dark:text-slate-100">
          <span>Foto</span>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            disabled={isSubmitting}
            onChange={handleFileChange}
            className="block text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-200 file:px-3 file:py-2 file:text-slate-900 dark:text-slate-200 dark:file:bg-slate-700 dark:file:text-white"
          />
        </label>
      </div>
      {fileError ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fileError}</p> : null}
      <Button
        type="button"
        className="mt-3"
        disabled={!file || !identificacao.trim() || isSubmitting}
        onClick={handleSubmit}
      >
        {isSubmitting ? 'Enviando...' : 'Adicionar foto'}
      </Button>
    </div>
  );
}
