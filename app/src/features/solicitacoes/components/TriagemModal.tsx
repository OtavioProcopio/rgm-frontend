import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button/Button';
import { Select } from '@/shared/components/Select/Select';

import { triarSolicitacaoSchema, type TriarSolicitacaoFormData } from '../schemas/solicitacaoSchema';

type Props = {
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: (data: TriarSolicitacaoFormData) => void;
};

const prioridadeOptions = [
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
];

export function TriagemModal({ isPending, onCancel, onConfirm }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TriarSolicitacaoFormData>({
    resolver: zodResolver(triarSolicitacaoSchema),
  });

  return (
    <div className="rounded-md border border-sky-200 bg-sky-50 p-4 text-sm dark:border-sky-900/60 dark:bg-sky-950/30">
      <h3 className="font-semibold text-sky-900 dark:text-sky-100">Triar solicitação</h3>
      <p className="mt-1 text-sky-800 dark:text-sky-200">
        Defina a prioridade para colocar em andamento.
      </p>
      <form onSubmit={handleSubmit(onConfirm)} className="mt-4 space-y-4">
        <Select
          label="Prioridade"
          options={prioridadeOptions}
          placeholder="Selecione..."
          error={errors.prioridade?.message}
          {...register('prioridade')}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" disabled={isPending} onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Triando...' : 'Confirmar triagem'}
          </Button>
        </div>
      </form>
    </div>
  );
}
