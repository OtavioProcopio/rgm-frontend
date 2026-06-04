import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button/Button';
import { Input } from '@/shared/components/Input/Input';

import { maquinaSchema, type MaquinaFormData } from '../schemas/maquinaSchema';
import type { CriarMaquinaRequest, EditarMaquinaRequest, Maquina } from '../types/maquinaTypes';

type MaquinaFormProps = {
  initialValues?: Partial<Maquina>;
  isSubmitting?: boolean;
  onSubmit: (data: CriarMaquinaRequest | EditarMaquinaRequest) => Promise<void>;
};

export function MaquinaForm({ initialValues, isSubmitting, onSubmit }: MaquinaFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<MaquinaFormData>({
    resolver: zodResolver(maquinaSchema),
    defaultValues: {
      nome: initialValues?.nome ?? '',
      codigo: initialValues?.codigo ?? '',
      descricao: initialValues?.descricao ?? '',
    },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((data) =>
        onSubmit({
          nome: data.nome,
          codigo: data.codigo,
          descricao: data.descricao || undefined,
        }),
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Código"
          error={errors.codigo?.message}
          disabled={isSubmitting}
          {...register('codigo')}
        />
        <Input
          label="Nome"
          error={errors.nome?.message}
          disabled={isSubmitting}
          {...register('nome')}
        />
      </div>

      <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        <span>Descrição</span>
        <textarea
          rows={4}
          disabled={isSubmitting}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          {...register('descricao')}
        />
      </label>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar máquina'}
      </Button>
    </form>
  );
}
