import { useState } from 'react';
import { ImageOff, Plus, X } from 'lucide-react';

import { Button } from '@/shared/components/Button/Button';
import { Dialog } from '@/shared/components/Dialog/Dialog';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';

import { AdicionarFotoGaleriaForm } from './AdicionarFotoGaleriaForm';
import { GaleriaCarousel } from './GaleriaCarousel';
import { GaleriaFotoThumb } from './GaleriaFotoThumb';
import { useAdicionarFotoGaleria } from '../hooks/useAdicionarFotoGaleria';
import { useEditarFotoGaleria } from '../hooks/useEditarFotoGaleria';
import { useGaleriaModelo } from '../hooks/useGaleriaModelo';
import { useRemoverFotoGaleria } from '../hooks/useRemoverFotoGaleria';
import { getModeloErrorMessage } from '../lib/modeloMessages';
import type { FotoGaleria } from '../types/galeriaTypes';

const MAX_MINIATURAS = 6;
const BLOCO_GRANDE = 'aspect-[4/3] w-full overflow-hidden rounded-lg';

type Props = {
  modeloId: string;
  codigo: string;
  podeGerenciar: boolean;
};

function indiceDaFotoAtiva(fotos: FotoGaleria[], escolhida: number | null): number {
  if (escolhida !== null) return Math.min(escolhida, fotos.length - 1);
  return Math.max(
    0,
    fotos.findIndex((foto) => foto.principal),
  );
}

function BotaoAdicionar({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" className="self-center" onClick={onClick}>
      <Plus size={16} className="mr-1.5 -ml-0.5" /> Adicionar foto
    </Button>
  );
}

function GaleriaErro({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div className="space-y-3">
      <ErrorState
        title="Não foi possível carregar a galeria"
        description={getModeloErrorMessage(error)}
      />
      <Button type="button" variant="secondary" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  );
}

function FotoGrande({ foto, onAmpliar }: { foto: FotoGaleria; onAmpliar: () => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={onAmpliar}
      aria-label={`Ampliar foto: ${foto.identificacao}`}
      className={`${BLOCO_GRANDE} block bg-surface-muted`}
    >
      {!imgError ? (
        <img
          src={foto.publicUrl}
          alt={foto.identificacao}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-fg-muted">
          <ImageOff size={32} />
        </div>
      )}
    </button>
  );
}

type SemFotosProps = { codigo: string; podeGerenciar: boolean; onAdicionar: () => void };

function SemFotos({ codigo, podeGerenciar, onAdicionar }: SemFotosProps) {
  return (
    <div className="space-y-3">
      <div className={`${BLOCO_GRANDE} flex items-center justify-center bg-surface-muted`}>
        <span className="text-5xl font-bold text-fg-muted">{codigo.slice(0, 2).toUpperCase()}</span>
      </div>
      <p className="sr-only">Nenhuma foto na galeria deste modelo</p>
      {podeGerenciar ? (
        <div className="flex justify-center">
          <BotaoAdicionar onClick={onAdicionar} />
        </div>
      ) : null}
    </div>
  );
}

type MiniaturasProps = {
  fotos: FotoGaleria[];
  indiceAtivo: number;
  podeGerenciar: boolean;
  onEscolher: (indice: number) => void;
  onAbrir: (indice: number) => void;
  onAdicionar: () => void;
};

function Miniaturas({
  fotos,
  indiceAtivo,
  podeGerenciar,
  onEscolher,
  onAbrir,
  onAdicionar,
}: MiniaturasProps) {
  const resto = fotos.length - MAX_MINIATURAS;

  return (
    <div className="flex flex-wrap gap-2">
      {fotos.slice(0, MAX_MINIATURAS).map((foto, i) => {
        const ehMais = resto > 0 && i === MAX_MINIATURAS - 1;
        return (
          <GaleriaFotoThumb
            key={foto.id}
            foto={foto}
            ativa={i === indiceAtivo}
            overlayCount={ehMais ? resto : undefined}
            onClick={() => (ehMais ? onAbrir(i) : onEscolher(i))}
          />
        );
      })}
      {podeGerenciar ? <BotaoAdicionar onClick={onAdicionar} /> : null}
    </div>
  );
}

export function GaleriaModelo({ modeloId, codigo, podeGerenciar }: Props) {
  const { data: fotos, isLoading, error, refetch } = useGaleriaModelo(modeloId);
  const [escolhida, setEscolhida] = useState<number | null>(null);
  const adicionarFoto = useAdicionarFotoGaleria();
  const editarFoto = useEditarFotoGaleria();
  const removerFoto = useRemoverFotoGaleria();
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingFotoId, setPendingFotoId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState<number | null>(null);

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
  const indiceAtivo = temFotos ? indiceDaFotoAtiva(fotos, escolhida) : 0;
  const abrirAdicionar = () => setShowAddModal(true);

  return (
    <div className="space-y-4">
      {actionError ? <ErrorState title="Operação não concluída" description={actionError} /> : null}
      {isLoading ? <LoadingState title="Carregando galeria..." /> : null}
      {error ? <GaleriaErro error={error} onRetry={() => void refetch()} /> : null}

      {temFotos ? (
        <>
          <FotoGrande
            key={fotos[indiceAtivo].id}
            foto={fotos[indiceAtivo]}
            onAmpliar={() => setCarouselIndex(indiceAtivo)}
          />
          <Miniaturas
            fotos={fotos}
            indiceAtivo={indiceAtivo}
            podeGerenciar={podeGerenciar}
            onEscolher={setEscolhida}
            onAbrir={setCarouselIndex}
            onAdicionar={abrirAdicionar}
          />
        </>
      ) : !isLoading && !error ? (
        <SemFotos codigo={codigo} podeGerenciar={podeGerenciar} onAdicionar={abrirAdicionar} />
      ) : null}

      {showAddModal ? (
        <Dialog
          titulo="Adicionar foto à galeria"
          bloqueado={adicionarFoto.isPending}
          onClose={() => setShowAddModal(false)}
        >
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-fg">Adicionar foto à galeria</h3>
              <button
                type="button"
                disabled={adicionarFoto.isPending}
                onClick={() => setShowAddModal(false)}
                className="rounded-md p-1 text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg disabled:cursor-not-allowed disabled:opacity-50"
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
        </Dialog>
      ) : null}

      {carouselIndex !== null && temFotos ? (
        <GaleriaCarousel
          fotos={fotos}
          initialIndex={carouselIndex}
          podeGerenciar={podeGerenciar}
          pendingFotoId={pendingFotoId}
          isSavingGlobal={editarFoto.isPending}
          isRemovingGlobal={removerFoto.isPending}
          onDefinirCapa={handleDefinirCapa}
          onRenomear={handleRenomear}
          onRemover={handleRemover}
          onClose={() => setCarouselIndex(null)}
        />
      ) : null}
    </div>
  );
}
