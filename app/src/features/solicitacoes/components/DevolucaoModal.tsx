import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button/Button';
import { Select } from '@/shared/components/Select/Select';
import { Textarea } from '@/shared/components/Textarea/Textarea';

import {
  devolverSolicitacaoSchema,
  type DevolverSolicitacaoFormData,
} from '../schemas/solicitacaoSchema';

type Props = {
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: (data: DevolverSolicitacaoFormData) => void;
};

const prioridadeOptions = [
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
];

export function DevolucaoModal({ isPending, onCancel, onConfirm }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<DevolverSolicitacaoFormData>({
    resolver: zodResolver(devolverSolicitacaoSchema),
  });

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900/60 dark:bg-amber-950/30">
      <h3 className="font-semibold text-amber-900 dark:text-amber-100">Devolver solicitação</h3>
      <p className="mt-1 text-amber-800 dark:text-amber-200">
        A solicitação voltará para EM ANDAMENTO.
      </p>
      <form onSubmit={handleSubmit(onConfirm)} className="mt-4 space-y-4">
        <Textarea
          label="Motivo da devolução *"
          placeholder="Descreva o motivo da devolução..."
          error={errors.motivo?.message}
          {...register('motivo')}
        />
        <Select
          label="Nova prioridade (opcional)"
          options={prioridadeOptions}
          placeholder="Manter atual"
          {...register('prioridade')}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" disabled={isPending} onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Devolvendo...' : 'Confirmar devolução'}
          </Button>
        </div>
      </form>
    </div>
  );
}
