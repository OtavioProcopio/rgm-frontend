import { useState } from 'react';
import { Plus, X } from 'lucide-react';

import { Button } from '@/shared/components/Button/Button';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
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
  const [showAddModal, setShowAddModal] = useState(false);

  async function handleAdicionar(file: File, identificacao: string) {
    setActionError(null);
    try {
      await adicionarFoto.mutateAsync({ modeloId, file, identificacao });
      setShowAddModal(false);
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

  const temFotos = !!fotos && fotos.length > 0;

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
      {temFotos ? (
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
          {podeGerenciar ? <AdicionarFotoTile onClick={() => setShowAddModal(true)} /> : null}
        </div>
      ) : !isLoading ? (
        <EmptyState
          title="Nenhuma foto na galeria deste modelo"
          description={
            podeGerenciar
              ? 'Adicione fotos para apresentar o estado atual do ferramental.'
              : undefined
          }
        />
      ) : null}
      {podeGerenciar && !temFotos ? (
        <div className="flex justify-center">
          <Button type="button" onClick={() => setShowAddModal(true)}>
            <Plus size={16} className="mr-1.5 -ml-0.5" /> Adicionar foto
          </Button>
        </div>
      ) : null}

      {showAddModal ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Adicionar foto à galeria"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                Adicionar foto à galeria
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>
            <AdicionarFotoGaleriaForm
              isSubmitting={adicionarFoto.isPending}
              onSubmit={handleAdicionar}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AdicionarFotoTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition-colors hover:border-sky-400 hover:bg-sky-50 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-sky-500 dark:hover:bg-sky-950/30 dark:hover:text-sky-400"
    >
      <Plus size={24} />
      <span className="text-sm font-medium">Adicionar foto</span>
    </button>
  );
}
