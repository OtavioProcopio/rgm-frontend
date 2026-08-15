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
    getValues,
    trigger,
    formState: { errors },
  } = useForm<EnviarParaValidacaoFormData>({
    resolver: zodResolver(enviarParaValidacaoSchema),
  });

  async function handleUpload(file: File) {
    const descricaoValida = await trigger('comentario');
    if (!descricaoValida) return;

    setUploadError(null);
    try {
      await uploadEvidencia.mutateAsync({
        file,
        tipo: 'SERVICO_REALIZADO',
        descricao: getValues('comentario'),
      });
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
        Descreva o serviço realizado e anexe uma foto como evidência.
      </p>

      <form onSubmit={handleSubmit(onConfirm)} className="mt-4 space-y-4">
        <Textarea
          label="Descrição do serviço realizado *"
          placeholder="Descreva o que foi feito para resolver o problema..."
          error={errors.comentario?.message}
          disabled={evidenciaAnexada}
          {...register('comentario')}
        />

        <div>
          <p className="mb-2 font-medium text-blue-900 dark:text-blue-100">
            Evidência do serviço realizado{' '}
            <span className="text-red-600 dark:text-red-400">*</span>
          </p>
          {evidenciaAnexada ? (
            <p className="text-xs text-green-700 dark:text-green-400">
              ✓ Evidência anexada com sucesso
            </p>
          ) : (
            <>
              <EvidenciaUploader
                isPending={uploadEvidencia.isPending}
                onUpload={handleUpload}
              />
              <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                Preencha a descrição antes de anexar a foto.
              </p>
            </>
          )}
          {uploadError && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{uploadError}</p>
          )}
        </div>

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
  );
}
