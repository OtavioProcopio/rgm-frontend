import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button/Button';
import { Textarea } from '@/shared/components/Textarea/Textarea';
import { LIMITES } from '@/shared/lib/limites';
import { EvidenciaUploader } from '@/features/evidencias/components/EvidenciaUploader';

import {
  encerrarSolicitacaoSchema,
  type EncerrarSolicitacaoFormData,
} from '../schemas/solicitacaoSchema';

type Props = {
  isPending?: boolean;
  podeConcluir?: boolean;
  onCancel: () => void;
  onConfirm: (data: EncerrarSolicitacaoFormData, foto: File | null) => void;
};

export function EncerramentoModal({ isPending, podeConcluir = true, onCancel, onConfirm }: Props) {
  const [concluir, setConcluir] = useState(podeConcluir);
  const [foto, setFoto] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EncerrarSolicitacaoFormData>({
    resolver: zodResolver(encerrarSolicitacaoSchema),
    defaultValues: { concluir: podeConcluir },
  });

  function handleRadioChange(value: boolean) {
    setConcluir(value);
    setValue('concluir', value);
  }

  function onSubmit(data: EncerrarSolicitacaoFormData) {
    onConfirm(data, concluir ? foto : null);
  }

  return (
    <div
      className={`rounded-md border p-4 text-sm ${
        concluir ? 'border-success bg-success-soft' : 'border-danger bg-danger-soft'
      }`}
    >
      <h3 className="font-semibold text-fg font-sans">
        {podeConcluir ? 'Encerrar solicitação' : 'Cancelar solicitação'}
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        {podeConcluir && (
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="concluir-option"
                checked={concluir}
                onChange={() => handleRadioChange(true)}
              />
              Concluir
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="concluir-option"
                checked={!concluir}
                onChange={() => handleRadioChange(false)}
              />
              Cancelar
            </label>
          </div>
        )}
        <Textarea
          label={concluir ? 'Comentário final' : 'Motivo do cancelamento'}
          placeholder={concluir ? 'Descreva o resultado...' : 'Descreva o motivo...'}
          error={errors.comentario?.message}
          maxLength={LIMITES.textoLongo}
          {...register('comentario')}
        />
        {concluir ? (
          <div>
            <p className="mb-2 block text-sm font-medium text-fg">Foto de conclusão (opcional)</p>
            <EvidenciaUploader onUpload={setFoto} />
            {foto ? <p className="mt-1 text-xs text-fg-muted">Anexado: {foto.name}</p> : null}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" disabled={isPending} onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending} variant={concluir ? 'primary' : 'danger'}>
            {isPending
              ? podeConcluir
                ? 'Encerrando...'
                : 'Cancelando...'
              : concluir
                ? 'Concluir'
                : 'Cancelar solicitação'}
          </Button>
        </div>
      </form>
    </div>
  );
}
