import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { EvidenciaUploader } from '@/features/evidencias/components/EvidenciaUploader';
import { useUploadEvidencia } from '@/features/evidencias/hooks/useUploadEvidencia';
import { Button } from '@/shared/components/Button/Button';
import { Textarea } from '@/shared/components/Textarea/Textarea';

import {
  enviarParaValidacaoSchema,
  type EnviarParaValidacaoFormData,
} from '../schemas/solicitacaoSchema';

type Props = {
  solicitacaoId: string;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: (data: EnviarParaValidacaoFormData) => void;
};

export function EnviarValidacaoModal({
  solicitacaoId,
  isPending,
  onCancel,
  onConfirm,
}: Props) {
  const [evidenciaAnexada, setEvidenciaAnexada] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadEvidencia = useUploadEvidencia(solicitacaoId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnviarParaValidacaoFormData>({
    resolver: zodResolver(enviarParaValidacaoSchema),
  });

  async function handleUpload(file: File) {
    setUploadError(null);
    try {
      await uploadEvidencia.mutateAsync(file);
      setEvidenciaAnexada(true);
    } catch {
      setUploadError('Falha ao enviar a evidência. Tente novamente.');
    }
  }

  return (
    <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-900/60 dark:bg-blue-950/30">
      <h3 className="font-semibold text-blue-900 dark:text-blue-100">
        Enviar para validação
      </h3>
      <p className="mt-1 text-blue-800 dark:text-blue-200">
        Anexe uma foto do serviço realizado e descreva o que foi feito.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <p className="mb-2 font-medium text-blue-900 dark:text-blue-100">
            Evidência do serviço realizado{' '}
            <span className="text-red-600 dark:text-red-400">*</span>
          </p>
          <EvidenciaUploader
            isPending={uploadEvidencia.isPending}
            onUpload={handleUpload}
          />
          {evidenciaAnexada && (
            <p className="mt-1 text-xs text-green-700 dark:text-green-400">
              ✓ Evidência anexada com sucesso
            </p>
          )}
          {uploadError && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{uploadError}</p>
          )}
        </div>

        <form onSubmit={handleSubmit(onConfirm)} className="space-y-4">
          <Textarea
            label="Descrição do serviço realizado *"
            placeholder="Descreva o que foi feito para resolver o problema..."
            error={errors.comentario?.message}
            {...register('comentario')}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={isPending || uploadEvidencia.isPending}
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || uploadEvidencia.isPending || !evidenciaAnexada}
              title={!evidenciaAnexada ? 'Anexe uma evidência do serviço realizado' : undefined}
            >
              {isPending ? 'Enviando...' : 'Enviar para validação'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
