import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { EvidenciaUploader } from '@/features/evidencias/components/EvidenciaUploader';
import { useUploadEvidencia } from '@/features/evidencias/hooks/useUploadEvidencia';
import { Button } from '@/shared/components/Button/Button';
import { Textarea } from '@/shared/components/Textarea/Textarea';
import { LIMITES } from '@/shared/lib/limites';

import {
  enviarParaValidacaoSchema,
  type EnviarParaValidacaoFormData,
} from '../schemas/solicitacaoSchema';

type Props = {
  solicitacaoId: string;
  isPending?: boolean;
  /** REPARO/INSPECAO/REENGENHARIA exigem evidência; CRIACAO não (backend não exige). */
  evidenciaObrigatoria?: boolean;
  onCancel: () => void;
  onConfirm: (data: EnviarParaValidacaoFormData) => void;
};

export function EnviarValidacaoModal({
  solicitacaoId,
  isPending,
  evidenciaObrigatoria = true,
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
    formState: { errors, isValid },
  } = useForm<EnviarParaValidacaoFormData>({
    resolver: zodResolver(enviarParaValidacaoSchema),
    mode: 'onChange',
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

  const podeEnviar = evidenciaObrigatoria ? evidenciaAnexada : isValid;

  return (
    <div className="rounded-md border border-info bg-info-soft p-4 text-sm">
      <h3 className="font-semibold text-info-fg">Enviar para validação</h3>
      <p className="mt-1 text-info-fg">
        {evidenciaObrigatoria
          ? 'Descreva o serviço realizado e anexe uma foto como evidência.'
          : 'Descreva o andamento antes de enviar para validação.'}
      </p>

      <form onSubmit={handleSubmit(onConfirm)} className="mt-4 space-y-4">
        <Textarea
          label={evidenciaObrigatoria ? 'Descrição do serviço realizado *' : 'Comentário *'}
          placeholder="Descreva o que foi feito para resolver o problema..."
          error={errors.comentario?.message}
          disabled={evidenciaObrigatoria && evidenciaAnexada}
          maxLength={LIMITES.comentarioValidacao}
          {...register('comentario')}
        />

        <div>
          <p className="mb-2 font-medium text-info-fg">
            Evidência do serviço realizado{' '}
            {evidenciaObrigatoria ? (
              <span className="text-danger-fg">*</span>
            ) : (
              <span className="text-xs font-normal text-info-fg">(opcional)</span>
            )}
          </p>
          {evidenciaAnexada ? (
            <p className="text-xs text-success-fg">✓ Evidência anexada com sucesso</p>
          ) : (
            <>
              <EvidenciaUploader isPending={uploadEvidencia.isPending} onUpload={handleUpload} />
              {evidenciaObrigatoria ? (
                <p className="mt-1 text-xs text-info-fg">
                  Preencha a descrição antes de anexar a foto.
                </p>
              ) : null}
            </>
          )}
          {uploadError && <p className="mt-1 text-xs text-danger-fg">{uploadError}</p>}
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
            disabled={isPending || uploadEvidencia.isPending || !podeEnviar}
            title={
              evidenciaObrigatoria && !evidenciaAnexada
                ? 'Anexe uma evidência do serviço realizado'
                : undefined
            }
          >
            {isPending ? 'Enviando...' : 'Enviar para validação'}
          </Button>
        </div>
      </form>
    </div>
  );
}
