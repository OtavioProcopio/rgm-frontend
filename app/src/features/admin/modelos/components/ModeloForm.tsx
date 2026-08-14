import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Camera, X } from 'lucide-react';

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
      onSubmit: (data: CriarModeloRequest, photo: File | null) => Promise<void>;
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

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function CriarModeloForm({
  isSubmitting,
  onSubmit,
}: Extract<ModeloFormProps, { mode: 'create' }>) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setPhotoError('Apenas imagens nos formatos JPG, PNG ou WEBP são permitidas.');
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setPhotoError('A imagem deve ter no máximo 10 MB.');
      return;
    }

    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    setPhoto(null);
    setPhotoPreview(null);
    setPhotoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((data) =>
        onSubmit({ ...data, observacoes: data.observacoes || undefined }, photo),
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

      {/* Upload Foto de Capa (Opcional) */}
      <div className="space-y-2">
        <span className="block text-sm font-medium text-slate-850 dark:text-slate-100">
          Foto de capa (Opcional)
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          onChange={handlePhotoChange}
          disabled={isSubmitting}
          className="hidden"
        />
        {!photoPreview ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
            className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-350 bg-slate-50/50 py-6 px-4 text-center hover:bg-slate-50 transition-colors focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900 cursor-pointer"
          >
            <div className="rounded-full bg-slate-100 p-2 text-slate-500 dark:bg-slate-850 dark:text-slate-400">
              <Camera size={20} />
            </div>
            <span className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Clique para selecionar uma foto
            </span>
            <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Formatos suportados: JPG, PNG ou WEBP até 10 MB
            </span>
          </button>
        ) : (
          <div className="relative rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                <img
                  src={photoPreview}
                  alt="Preview da foto do modelo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                  {photo?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {(photo!.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isSubmitting}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-850 dark:hover:text-slate-350"
                title="Remover foto"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
        {photoError && <p className="text-sm text-red-600 dark:text-red-400">{photoError}</p>}
      </div>

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
