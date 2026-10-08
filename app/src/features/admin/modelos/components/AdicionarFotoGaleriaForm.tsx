import { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';

import { Button } from '@/shared/components/Button/Button';
import { Input } from '@/shared/components/Input/Input';
import {
  nomesDosTipos,
  TAMANHO_MAXIMO_MB,
  TIPOS_DE_IMAGEM,
  validarArquivo,
} from '@/shared/lib/arquivoPermitido';

type Props = {
  isSubmitting?: boolean;
  onSubmit: (file: File, identificacao: string) => Promise<void>;
  onCancel?: () => void;
};

export function AdicionarFotoGaleriaForm({ isSubmitting, onSubmit, onCancel }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [identificacao, setIdentificacao] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    const erro = validarArquivo(selected, TIPOS_DE_IMAGEM);
    setFileError(erro);
    if (erro) return;

    setFile(selected);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  }

  function handleRemoveFile() {
    setFile(null);
    setPreview(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleSubmit() {
    if (!file || !identificacao.trim()) return;
    await onSubmit(file, identificacao.trim());
    handleRemoveFile();
    setIdentificacao('');
  }

  return (
    <div className="space-y-4">
      <Input
        label="Identificação da foto"
        placeholder="Ex.: Contra-macho, Cavidade 1..."
        value={identificacao}
        disabled={isSubmitting}
        onChange={(event) => setIdentificacao(event.target.value)}
      />

      <div className="space-y-2">
        <span className="block text-sm font-medium text-fg">Foto</span>
        <input
          ref={fileInputRef}
          type="file"
          aria-label="Foto da galeria"
          accept={TIPOS_DE_IMAGEM.join(',')}
          onChange={handleFileChange}
          disabled={isSubmitting}
          className="hidden"
        />
        {!preview ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
            className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-line-strong bg-surface-muted py-8 px-4 text-center transition hover:brightness-95 focus:outline-none"
          >
            <div className="rounded-full bg-surface p-2 text-fg-muted">
              <Camera size={20} />
            </div>
            <span className="mt-2 text-sm font-medium text-fg-muted">
              Clique para selecionar uma foto
            </span>
            <span className="mt-1 text-xs text-fg-muted">
              Formatos suportados: {nomesDosTipos(TIPOS_DE_IMAGEM)} até {TAMANHO_MAXIMO_MB} MB
            </span>
          </button>
        ) : (
          <div className="relative overflow-hidden rounded-lg border border-line">
            <img src={preview} alt="Pré-visualização" className="h-48 w-full object-cover" />
            <button
              type="button"
              onClick={handleRemoveFile}
              disabled={isSubmitting}
              className="absolute right-2 top-2 rounded-full bg-scrim p-1.5 text-on-solid transition hover:brightness-125"
              title="Remover foto selecionada"
              aria-label="Remover foto selecionada"
            >
              <X size={16} />
            </button>
            <p className="truncate border-t border-line bg-surface px-3 py-2 text-xs text-fg-muted">
              {file?.name} — {file ? (file.size / (1024 * 1024)).toFixed(2) : 0} MB
            </p>
          </div>
        )}
        {fileError ? <p className="text-sm text-danger-fg">{fileError}</p> : null}
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="secondary" disabled={isSubmitting} onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
        <Button
          type="button"
          disabled={!file || !identificacao.trim() || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Enviando...' : 'Adicionar foto'}
        </Button>
      </div>
    </div>
  );
}
