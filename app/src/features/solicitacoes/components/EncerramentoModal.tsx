import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button/Button';
import { Textarea } from '@/shared/components/Textarea/Textarea';

import {
  encerrarSolicitacaoSchema,
  type EncerrarSolicitacaoFormData,
} from '../schemas/solicitacaoSchema';

type Props = {
  isPending?: boolean;
  podeConcluir?: boolean;
  onCancel: () => void;
  onConfirm: (data: EncerrarSolicitacaoFormData) => void;
};

export function EncerramentoModal({ isPending, podeConcluir = true, onCancel, onConfirm }: Props) {
  const [concluir, setConcluir] = useState(podeConcluir);
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

  return (
    <div
      className={`rounded-md border p-4 text-sm ${
        concluir
          ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30'
          : 'border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/30'
      }`}
    >
      <h3 className="font-semibold text-slate-900 dark:text-white">Encerrar solicitação</h3>
      <form onSubmit={handleSubmit(onConfirm)} className="mt-4 space-y-4">
        <div className="flex gap-4">
          {podeConcluir ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="concluir-option"
                checked={concluir}
                onChange={() => handleRadioChange(true)}
              />
              Concluir
            </label>
          ) : null}
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
        <Textarea
          label="Comentário final"
          placeholder="Descreva o resultado..."
          error={errors.comentario?.message}
          {...register('comentario')}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" disabled={isPending} onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className={
              !concluir
                ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500'
                : undefined
            }
          >
            {isPending ? 'Encerrando...' : concluir ? 'Concluir' : 'Cancelar solicitação'}
          </Button>
        </div>
      </form>
    </div>
  );
}
