import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/shared/components/Button/Button';
import { Input } from '@/shared/components/Input/Input';
import { Select } from '@/shared/components/Select/Select';
import { Textarea } from '@/shared/components/Textarea/Textarea';
import { LIMITES } from '@/shared/lib/limites';
import { rotuloDoTipoDeModelo } from '@/shared/lib/rotulos';

import { useMaquinaOptions } from '../hooks/useMaquinaOptions';
import {
  criarModeloSchema,
  editarModeloSchema,
  type CriarModeloFormData,
  type EditarModeloFormData,
} from '../schemas/modeloSchema';
import type { CriarModeloRequest, EditarModeloRequest, Modelo } from '../types/modeloTypes';

const tipoModeloOptions = [
  { value: '', label: 'Não definido' },
  ...Object.entries(rotuloDoTipoDeModelo).map(([value, label]) => ({ value, label })),
];

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

function CriarModeloForm({ isSubmitting, onSubmit }: Extract<ModeloFormProps, { mode: 'create' }>) {
  const { options: maquinaOptions, isLoading: maquinasLoading } = useMaquinaOptions();

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<CriarModeloFormData>({
    resolver: zodResolver(criarModeloSchema),
    defaultValues: { codigo: '', descricao: '', observacoes: '', maquina: '', tipo: '' },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((data) =>
        onSubmit({
          ...data,
          observacoes: data.observacoes || undefined,
          tipo: data.tipo || undefined,
        }),
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Código"
          error={errors.codigo?.message}
          disabled={isSubmitting}
          maxLength={LIMITES.modeloCodigo}
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
      <Select
        label="Tipo do Modelo"
        options={tipoModeloOptions}
        error={errors.tipo?.message}
        disabled={isSubmitting}
        {...register('tipo')}
      />
      <Input
        label="Descrição"
        error={errors.descricao?.message}
        disabled={isSubmitting}
        maxLength={LIMITES.modeloDescricao}
        {...register('descricao')}
      />
      <Textarea
        label="Observações"
        rows={4}
        error={errors.observacoes?.message}
        disabled={isSubmitting}
        maxLength={LIMITES.textoLongo}
        {...register('observacoes')}
      />

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
  const { options: maquinaOptions, isLoading: maquinasLoading } = useMaquinaOptions(modelo.maquina);

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
      tipo: modelo.tipo ?? '',
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
          tipo: data.tipo || undefined,
        }),
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Código"
          error={errors.codigo?.message}
          disabled={isSubmitting}
          maxLength={LIMITES.modeloCodigo}
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
      <Select
        label="Tipo do Modelo"
        options={tipoModeloOptions}
        error={errors.tipo?.message}
        disabled={isSubmitting}
        {...register('tipo')}
      />
      <Input
        label="Descrição"
        error={errors.descricao?.message}
        disabled={isSubmitting}
        maxLength={LIMITES.modeloDescricao}
        {...register('descricao')}
      />
      <Textarea
        label="Observações"
        rows={4}
        error={errors.observacoes?.message}
        disabled={isSubmitting}
        maxLength={LIMITES.textoLongo}
        {...register('observacoes')}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar modelo'}
      </Button>
    </form>
  );
}
