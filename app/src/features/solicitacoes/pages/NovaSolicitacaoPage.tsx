import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import { Camera, X } from 'lucide-react';

import { useAuth } from '@/app/providers/authContext';
import { useMaquinaOptions } from '@/features/admin/modelos/hooks/useMaquinaOptions';
import { useModelos } from '@/features/admin/modelos/hooks/useModelos';
import { Button } from '@/shared/components/Button/Button';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { Input } from '@/shared/components/Input/Input';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Select } from '@/shared/components/Select/Select';
import { Textarea } from '@/shared/components/Textarea/Textarea';
import { Combobox } from '@/shared/components/Combobox/Combobox';
import { evidenciasApi } from '@/features/evidencias/api/evidenciasApi';
import { canAbrirSolicitacaoCriacao } from '@/shared/lib/permissions';

import { useAbrirSolicitacao } from '../hooks/useAbrirSolicitacao';
import { getSolicitacaoErrorMessage } from '../lib/solicitacaoMessages';
import {
  abrirSolicitacaoSchema,
  type AbrirSolicitacaoFormData,
} from '../schemas/solicitacaoSchema';

const BASE_TIPO_OPTIONS = [
  { value: 'REPARO', label: 'Reparo' },
  { value: 'INSPECAO', label: 'Inspeção' },
  { value: 'REENGENHARIA', label: 'Reengenharia' },
];

const CRIACAO_TIPO_OPTION = { value: 'CRIACAO', label: 'Criação de modelo' };

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function NovaSolicitacaoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultModeloId = searchParams.get('modeloId') || '';
  const abrirSolicitacao = useAbrirSolicitacao();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const podeAbrirCriacao = canAbrirSolicitacaoCriacao(user?.perfil);
  const tipoOptions = podeAbrirCriacao
    ? [...BASE_TIPO_OPTIONS, CRIACAO_TIPO_OPTION]
    : BASE_TIPO_OPTIONS;

  // Foto Evidência State
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<AbrirSolicitacaoFormData>({
    resolver: zodResolver(abrirSolicitacaoSchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      tipo: 'REPARO',
      modeloId: defaultModeloId,
    },
  });

  const tipoSelecionado = watch('tipo');
  const isCriacao = tipoSelecionado === 'CRIACAO';

  // Busca TODOS os modelos ativos (limite alto para abranger centenas)
  const { data: modelosPage, isLoading: isLoadingModelos } = useModelos({
    page: 0,
    size: 1000,
    ativo: true,
  });

  const modeloOptions = modelosPage?.content.map((m) => ({
    value: m.id,
    label: `${m.codigo} - ${m.descricao}`,
    subLabel: m.maquina,
  })) ?? [];

  const { options: maquinaOptions, isLoading: isLoadingMaquinas } = useMaquinaOptions();

  // Manipulação de Foto
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

  async function onSubmit(data: AbrirSolicitacaoFormData) {
    setSubmitError(null);
    setIsUploading(true);
    try {
      // 1. Cria a solicitação
      const created = await abrirSolicitacao.mutateAsync(
        data.tipo === 'CRIACAO'
          ? {
              titulo: data.titulo,
              descricao: data.descricao,
              tipo: data.tipo,
              modeloCodigo: data.modeloCodigo,
              modeloMaquina: data.modeloMaquina,
              modeloObservacoes: data.modeloObservacoes || undefined,
            }
          : {
              titulo: data.titulo,
              descricao: data.descricao,
              tipo: data.tipo,
              modeloId: data.modeloId,
            },
      );

      // 2. Upload da foto se houver
      if (photo) {
        try {
          await evidenciasApi.anexar(created.id, photo, { tipo: 'ABERTURA' });
        } catch (uploadErr) {
          console.error('Erro ao fazer upload da evidência:', uploadErr);
          // Permite continuar, a solicitação já foi aberta
        }
      }

      navigate(`/app/solicitacoes/${created.id}`);
    } catch (err) {
      setSubmitError(getSolicitacaoErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  }

  const isPending = abrirSolicitacao.isPending || isUploading;

  return (
    <section>
      <PageHeader
        title="Nova solicitação"
        description="Preencha os dados para abrir uma solicitação de manutenção."
      />

      {submitError ? (
        <div className="mb-5">
          <ErrorState title="Não foi possível abrir a solicitação" description={submitError} />
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-5">
        <Input
          label="Título"
          placeholder="Descreva brevemente o problema"
          error={errors.titulo?.message}
          disabled={isPending}
          {...register('titulo')}
        />
        
        <Textarea
          label="Descrição"
          placeholder="Detalhe o problema encontrado..."
          error={errors.descricao?.message}
          disabled={isPending}
          {...register('descricao')}
        />
        
        <Select
          label="Tipo"
          options={tipoOptions}
          placeholder="Selecione o tipo..."
          error={errors.tipo?.message}
          disabled={isPending}
          {...register('tipo')}
        />
        
        {isCriacao ? (
          <div className="space-y-5 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              O modelo ainda não existe — ele será criado automaticamente quando esta
              solicitação for concluída, com os dados abaixo.
            </p>
            <Input
              label="Código do modelo"
              placeholder="Ex.: MOD-042"
              error={errors.modeloCodigo?.message}
              disabled={isPending}
              {...register('modeloCodigo')}
            />
            <Select
              label="Máquina"
              options={maquinaOptions}
              placeholder={isLoadingMaquinas ? 'Carregando máquinas...' : 'Selecione a máquina...'}
              error={errors.modeloMaquina?.message}
              disabled={isPending}
              {...register('modeloMaquina')}
            />
            <Textarea
              label="Observações (opcional)"
              placeholder="Detalhes adicionais sobre o modelo pretendido..."
              error={errors.modeloObservacoes?.message}
              disabled={isPending}
              {...register('modeloObservacoes')}
            />
          </div>
        ) : (
          <Controller
            control={control}
            name="modeloId"
            render={({ field }) => (
              <Combobox
                label="Modelo"
                placeholder={isLoadingModelos ? 'Carregando modelos...' : 'Selecione ou digite para filtrar o modelo...'}
                options={modeloOptions}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.modeloId?.message}
              />
            )}
          />
        )}

        {/* Anexar Foto (Evidência Inicial) */}
        <div className="space-y-2">
          <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
            Foto do problema (Opcional)
          </span>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            onChange={handlePhotoChange}
            disabled={isPending}
            className="hidden"
          />

          {!photoPreview ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
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
                    alt="Preview do problema"
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
                  disabled={isPending}
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

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={() => navigate('/app/solicitacoes')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isPending}
          >
            {isPending ? 'Enviando...' : 'Abrir solicitação'}
          </Button>
        </div>
      </form>
    </section>
  );
}
