import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button/Button';
import { Select } from '@/shared/components/Select/Select';

import { triarSolicitacaoSchema, type TriarSolicitacaoFormData } from '../schemas/solicitacaoSchema';

type UsuarioOpcao = { id: string; nome: string };

type Props = {
  isPending?: boolean;
  usuarios: UsuarioOpcao[];
  onCancel: () => void;
  onConfirm: (data: TriarSolicitacaoFormData) => void;
};

const prioridadeOptions = [
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
];

export function TriagemModal({ isPending, usuarios, onCancel, onConfirm }: Props) {
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
        Defina a prioridade e os responsáveis para colocar em andamento.
      </p>
      <form onSubmit={handleSubmit(onConfirm)} className="mt-4 space-y-4">
        <Select
          label="Prioridade"
          options={prioridadeOptions}
          placeholder="Selecione..."
          error={errors.prioridade?.message}
          {...register('prioridade')}
        />

        <div>
          <p className="mb-2 block text-sm font-medium text-slate-800 dark:text-slate-100">
            Responsáveis
          </p>
          {usuarios.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Nenhum responsável disponível.
            </p>
          ) : (
            <div className="space-y-2">
              {usuarios.map((u) => (
                <label key={u.id} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    value={u.id}
                    className="h-4 w-4 rounded border-gray-300"
                    {...register('responsavelIds')}
                  />
                  <span className="text-sm text-slate-800 dark:text-slate-100">{u.nome}</span>
                </label>
              ))}
            </div>
          )}
          {errors.responsavelIds && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.responsavelIds.message}
            </p>
          )}
        </div>

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
