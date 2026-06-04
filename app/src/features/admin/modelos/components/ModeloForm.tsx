import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button/Button';
import { Input } from '@/shared/components/Input/Input';

import type { Maquina } from '../../maquinas/types/maquinaTypes';
import {
  criarModeloSchema,
  editarModeloSchema,
  type CriarModeloFormData,
  type EditarModeloFormData,
} from '../schemas/modeloSchema';
import type { CriarModeloRequest, EditarModeloRequest, Modelo } from '../types/modeloTypes';

type ModeloFormProps =
  | {
      mode: 'create';
      maquinas: Maquina[];
      isSubmitting?: boolean;
      onSubmit: (data: CriarModeloRequest) => Promise<void>;
    }
  | {
      mode: 'edit';
      modelo: Modelo;
      maquinaLabel?: string;
      isSubmitting?: boolean;
      onSubmit: (data: EditarModeloRequest) => Promise<void>;
    };

export function ModeloForm(props: ModeloFormProps) {
  if (props.mode === 'edit') return <EditarModeloForm {...props} />;
  return <CriarModeloForm {...props} />;
}

function CriarModeloForm({
  isSubmitting,
  maquinas,
  onSubmit,
}: Extract<ModeloFormProps, { mode: 'create' }>) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<CriarModeloFormData>({
    resolver: zodResolver(criarModeloSchema),
    defaultValues: { codigo: '', descricao: '', observacoes: '', maquinaId: '' },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((data) =>
        onSubmit({ ...data, observacoes: data.observacoes || undefined }),
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Código"
          error={errors.codigo?.message}
          disabled={isSubmitting}
          {...register('codigo')}
        />
        <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span>Máquina</span>
          <select
            disabled={isSubmitting}
            className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            {...register('maquinaId')}
          >
            <option value="">Selecione</option>
            {maquinas.map((maquina) => (
              <option key={maquina.id} value={maquina.id}>
                {maquina.codigo} - {maquina.nome}
                {maquina.ativa ? '' : ' (inativa)'}
              </option>
            ))}
          </select>
          {errors.maquinaId ? (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.maquinaId.message}</p>
          ) : null}
        </label>
      </div>
      <Input
        label="Descrição"
        error={errors.descricao?.message}
        disabled={isSubmitting}
        {...register('descricao')}
      />
      <TextArea label="Observações" disabled={isSubmitting} register={register('observacoes')} />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar modelo'}
      </Button>
    </form>
  );
}

function EditarModeloForm({
  isSubmitting,
  maquinaLabel,
  modelo,
  onSubmit,
}: Extract<ModeloFormProps, { mode: 'edit' }>) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<EditarModeloFormData>({
    resolver: zodResolver(editarModeloSchema),
    defaultValues: {
      codigo: modelo.codigo,
      descricao: modelo.descricao,
      observacoes: modelo.observacoes ?? '',
    },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((data) =>
        onSubmit({
          codigo: data.codigo,
          descricao: data.descricao,
          observacoes: data.observacoes || undefined,
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
        <ReadOnlyField label="Máquina" value={maquinaLabel ?? modelo.maquinaId} />
      </div>
      <Input
        label="Descrição"
        error={errors.descricao?.message}
        disabled={isSubmitting}
        {...register('descricao')}
      />
      <TextArea label="Observações" disabled={isSubmitting} register={register('observacoes')} />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar modelo'}
      </Button>
    </form>
  );
}

function TextArea({
  disabled,
  label,
  register,
}: {
  disabled?: boolean;
  label: string;
  register: object;
}) {
  return (
    <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
      <span>{label}</span>
      <textarea
        rows={4}
        disabled={disabled}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition-colors focus:border-sky-600 focus:ring-2 focus:ring-sky-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        {...register}
      />
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
        {value}
      </div>
    </div>
  );
}
