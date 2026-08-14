import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button/Button';
import { Input } from '@/shared/components/Input/Input';
import { Select } from '@/shared/components/Select/Select';

import { useMaquinaOptions } from '../hooks/useMaquinaOptions';
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
      isSubmitting?: boolean;
      onSubmit: (data: CriarModeloRequest) => Promise<void>;
    }
  | {
      mode: 'edit';
      modelo: Modelo;
      isSubmitting?: boolean;
      onSubmit: (data: EditarModeloRequest) => Promise<void>;
    };

export function ModeloForm(props: ModeloFormProps) {
  if (props.mode === 'edit') return <EditarModeloForm {...props} />;
  return <CriarModeloForm {...props} />;
}

function CriarModeloForm({
  isSubmitting,
  onSubmit,
}: Extract<ModeloFormProps, { mode: 'create' }>) {
  const { options: maquinaOptions, isLoading: maquinasLoading } = useMaquinaOptions();

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<CriarModeloFormData>({
    resolver: zodResolver(criarModeloSchema),
    defaultValues: { codigo: '', descricao: '', observacoes: '', maquina: '' },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((data) => onSubmit({ ...data, observacoes: data.observacoes || undefined }))}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Código"
          error={errors.codigo?.message}
          disabled={isSubmitting}
          {...register('codigo')}
        />
        <Controller
          name="maquina"
          control={control}
          render={({ field }) => (
            <Select
              label="Máquina / Encaixe"
              placeholder={maquinasLoading ? 'Carregando máquinas...' : 'Selecione a máquina'}
              options={maquinaOptions}
              error={errors.maquina?.message}
              disabled={isSubmitting || maquinasLoading}
              {...field}
            />
          )}
        />
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
  modelo,
  onSubmit,
}: Extract<ModeloFormProps, { mode: 'edit' }>) {
  const { options: maquinaOptions, isLoading: maquinasLoading } = useMaquinaOptions(
    modelo.maquina,
  );

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<EditarModeloFormData>({
    resolver: zodResolver(editarModeloSchema),
    defaultValues: {
      codigo: modelo.codigo,
      descricao: modelo.descricao,
      observacoes: modelo.observacoes ?? '',
      maquina: modelo.maquina,
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
          maquina: data.maquina,
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
        <Controller
          name="maquina"
          control={control}
          render={({ field }) => (
            <Select
              label="Máquina / Encaixe"
              placeholder={maquinasLoading ? 'Carregando máquinas...' : 'Selecione a máquina'}
              options={maquinaOptions}
              error={errors.maquina?.message}
              disabled={isSubmitting || maquinasLoading}
              {...field}
            />
          )}
        />
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
