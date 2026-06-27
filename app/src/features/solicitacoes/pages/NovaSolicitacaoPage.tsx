import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { useModelos } from '@/features/admin/modelos/hooks/useModelos';
import { Button } from '@/shared/components/Button/Button';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { Input } from '@/shared/components/Input/Input';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Select } from '@/shared/components/Select/Select';
import { Textarea } from '@/shared/components/Textarea/Textarea';

import { useAbrirSolicitacao } from '../hooks/useAbrirSolicitacao';
import { getSolicitacaoErrorMessage } from '../lib/solicitacaoMessages';
import {
  abrirSolicitacaoSchema,
  type AbrirSolicitacaoFormData,
} from '../schemas/solicitacaoSchema';

const tipoOptions = [
  { value: 'REPARO', label: 'Reparo' },
  { value: 'INSPECAO', label: 'Inspeção' },
  { value: 'REENGENHARIA', label: 'Reengenharia' },
];

export function NovaSolicitacaoPage() {
  const navigate = useNavigate();
  const abrirSolicitacao = useAbrirSolicitacao();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AbrirSolicitacaoFormData>({
    resolver: zodResolver(abrirSolicitacaoSchema),
  });

  const codigo = watch('modeloCodigo')?.trim() ?? '';
  const { data: modelosPage, isFetching: isLookingUp } = useModelos({
    page: 0,
    size: 1,
    codigo: codigo || undefined,
  });
  const modeloEncontrado = codigo ? (modelosPage?.content[0] ?? null) : null;

  async function onSubmit(data: AbrirSolicitacaoFormData) {
    setSubmitError(null);
    if (!modeloEncontrado) {
      setSubmitError('Modelo não encontrado para o código informado.');
      return;
    }
    try {
      const created = await abrirSolicitacao.mutateAsync({
        titulo: data.titulo,
        descricao: data.descricao,
        tipo: data.tipo,
        modeloId: modeloEncontrado.id,
      });
      navigate(`/app/solicitacoes/${created.id}`);
    } catch (err) {
      setSubmitError(getSolicitacaoErrorMessage(err));
    }
  }

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
          {...register('titulo')}
        />
        <Textarea
          label="Descrição"
          placeholder="Detalhe o problema encontrado..."
          error={errors.descricao?.message}
          {...register('descricao')}
        />
        <Select
          label="Tipo"
          options={tipoOptions}
          placeholder="Selecione o tipo..."
          error={errors.tipo?.message}
          {...register('tipo')}
        />
        <div>
          <Input
            label="Código do modelo"
            placeholder="Ex.: MDL-TESTE-001"
            error={errors.modeloCodigo?.message}
            {...register('modeloCodigo')}
          />
          {codigo ? (
            <p className="mt-1 text-xs">
              {isLookingUp ? (
                <span className="text-slate-500 dark:text-slate-400">Buscando modelo...</span>
              ) : modeloEncontrado ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Modelo encontrado: {modeloEncontrado.descricao}
                </span>
              ) : (
                <span className="text-rose-600 dark:text-rose-400">Modelo não encontrado</span>
              )}
            </p>
          ) : null}
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={abrirSolicitacao.isPending}
            onClick={() => navigate('/app/solicitacoes')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={abrirSolicitacao.isPending || !modeloEncontrado}
          >
            {abrirSolicitacao.isPending ? 'Abrindo...' : 'Abrir solicitação'}
          </Button>
        </div>
      </form>
    </section>
  );
}
