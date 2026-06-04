import { useState } from 'react';

import { Button } from '@/shared/components/Button/Button';

type UploadFotoCapaDialogProps = {
  isUploading?: boolean;
  onUpload: (file: File) => Promise<void>;
};

export function UploadFotoCapaDialog({ isUploading, onUpload }: UploadFotoCapaDialogProps) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
      <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        <span>Foto de capa</span>
        <input
          type="file"
          accept="image/*"
          disabled={isUploading}
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-200 file:px-3 file:py-2 file:text-slate-900 dark:text-slate-200 dark:file:bg-slate-700 dark:file:text-white"
        />
      </label>
      <Button
        type="button"
        className="mt-3"
        disabled={!file || isUploading}
        onClick={() => file && onUpload(file)}
      >
        {isUploading ? 'Enviando...' : 'Enviar foto'}
      </Button>
    </div>
  );
}
