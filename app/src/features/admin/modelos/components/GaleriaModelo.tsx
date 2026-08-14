import { useState } from 'react';

import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';

import { AdicionarFotoGaleriaForm } from './AdicionarFotoGaleriaForm';
import { GaleriaFotoCard } from './GaleriaFotoCard';
import { useAdicionarFotoGaleria } from '../hooks/useAdicionarFotoGaleria';
import { useEditarFotoGaleria } from '../hooks/useEditarFotoGaleria';
import { useGaleriaModelo } from '../hooks/useGaleriaModelo';
import { useRemoverFotoGaleria } from '../hooks/useRemoverFotoGaleria';
import { getModeloErrorMessage } from '../lib/modeloMessages';

type Props = {
  modeloId: string;
  podeGerenciar: boolean;
};

export function GaleriaModelo({ modeloId, podeGerenciar }: Props) {
  const { data: fotos, isLoading, error } = useGaleriaModelo(modeloId);
  const adicionarFoto = useAdicionarFotoGaleria();
  const editarFoto = useEditarFotoGaleria();
  const removerFoto = useRemoverFotoGaleria();
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingFotoId, setPendingFotoId] = useState<string | null>(null);

  async function handleAdicionar(file: File, identificacao: string) {
    setActionError(null);
    try {
      await adicionarFoto.mutateAsync({ modeloId, file, identificacao });
    } catch (err) {
      setActionError(getModeloErrorMessage(err));
    }
  }

  async function handleDefinirCapa(fotoId: string) {
    setActionError(null);
    setPendingFotoId(fotoId);
    try {
      await editarFoto.mutateAsync({ modeloId, fotoId, payload: { principal: true } });
    } catch (err) {
      setActionError(getModeloErrorMessage(err));
    } finally {
      setPendingFotoId(null);
    }
  }

  async function handleRenomear(fotoId: string, identificacao: string) {
    setActionError(null);
    setPendingFotoId(fotoId);
    try {
      await editarFoto.mutateAsync({ modeloId, fotoId, payload: { identificacao } });
    } catch (err) {
      setActionError(getModeloErrorMessage(err));
    } finally {
      setPendingFotoId(null);
    }
  }

  async function handleRemover(fotoId: string) {
    setActionError(null);
    setPendingFotoId(fotoId);
    try {
      await removerFoto.mutateAsync({ modeloId, fotoId });
    } catch (err) {
      setActionError(getModeloErrorMessage(err));
    } finally {
      setPendingFotoId(null);
    }
  }

  return (
    <div className="space-y-4">
      {actionError ? (
        <ErrorState title="Operação não concluída" description={actionError} />
      ) : null}
      {isLoading ? <LoadingState title="Carregando galeria..." /> : null}
      {error ? (
        <ErrorState
          title="Não foi possível carregar a galeria"
          description={getModeloErrorMessage(error)}
        />
      ) : null}
      {fotos && fotos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {fotos.map((foto) => (
            <GaleriaFotoCard
              key={foto.id}
              foto={foto}
              podeGerenciar={podeGerenciar}
              isSaving={pendingFotoId === foto.id && editarFoto.isPending}
              isRemoving={pendingFotoId === foto.id && removerFoto.isPending}
              onDefinirCapa={() => handleDefinirCapa(foto.id)}
              onRenomear={(identificacao) => handleRenomear(foto.id, identificacao)}
              onRemover={() => handleRemover(foto.id)}
            />
          ))}
        </div>
      ) : !isLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Nenhuma foto na galeria deste modelo.
        </p>
      ) : null}
      {podeGerenciar ? (
        <AdicionarFotoGaleriaForm isSubmitting={adicionarFoto.isPending} onSubmit={handleAdicionar} />
      ) : null}
    </div>
  );
}
