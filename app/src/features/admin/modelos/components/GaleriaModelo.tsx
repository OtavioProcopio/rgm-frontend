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

type DefinirErro = (mensagem: string | null) => void;

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

function ImagemDaFoto({ foto, onError }: { foto: FotoGaleria; onError: () => void }) {
  return (
    <img
      src={foto.publicUrl}
      alt={foto.identificacao}
      className="h-full w-full object-cover"
      onError={onError}
    />
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
      {imgError ? (
        <FalhaDaImagem />
      ) : (
        <ImagemDaFoto foto={foto} onError={() => setImgError(true)} />
      )}
    </button>
  );
}

function FalhaDaImagem() {
  return (
    <div className="flex h-full w-full items-center justify-center text-fg-muted">
      <ImageOff size={32} />
    </div>
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

type ComFotosProps = {
  fotos: FotoGaleria[];
  podeGerenciar: boolean;
  onAbrirCarousel: (indice: number) => void;
  onAdicionar: () => void;
};

function ComFotos({ fotos, podeGerenciar, onAbrirCarousel, onAdicionar }: ComFotosProps) {
  const [escolhida, setEscolhida] = useState<number | null>(null);
  const indiceAtivo = indiceDaFotoAtiva(fotos, escolhida);
  const ativa = fotos[indiceAtivo];
  return (
    <>
      <FotoGrande key={ativa.id} foto={ativa} onAmpliar={() => onAbrirCarousel(indiceAtivo)} />
      <Miniaturas
        fotos={fotos}
        indiceAtivo={indiceAtivo}
        podeGerenciar={podeGerenciar}
        onEscolher={setEscolhida}
        onAbrir={onAbrirCarousel}
        onAdicionar={onAdicionar}
      />
    </>
  );
}

type Galeria = {
  data?: FotoGaleria[];
  isLoading: boolean;
  error: unknown;
  refetch: () => unknown;
};

type ConteudoProps = {
  galeria: Galeria;
  codigo: string;
  podeGerenciar: boolean;
  onAbrirCarousel: (indice: number) => void;
  onAdicionar: () => void;
};

function FotosOuVazio({ galeria, codigo, ...resto }: ConteudoProps) {
  const { data: fotos, isLoading, error } = galeria;
  if (fotos && fotos.length > 0) return <ComFotos fotos={fotos} {...resto} />;
  if (isLoading || error) return null;
  return (
    <SemFotos codigo={codigo} podeGerenciar={resto.podeGerenciar} onAdicionar={resto.onAdicionar} />
  );
}

/** Executa uma ação sobre uma foto, marcando-a como pendente e reportando falhas. */
function useExecutorDeFoto(definirErro: DefinirErro) {
  const [pendingFotoId, setPendingFotoId] = useState<string | null>(null);

  async function executar(fotoId: string, acao: () => Promise<unknown>): Promise<void> {
    definirErro(null);
    setPendingFotoId(fotoId);
    try {
      await acao();
    } catch (err) {
      definirErro(getModeloErrorMessage(err));
    } finally {
      setPendingFotoId(null);
    }
  }

  return { pendingFotoId, executar };
}

function useAcoesDeFoto(modeloId: string, definirErro: DefinirErro) {
  const editarFoto = useEditarFotoGaleria();
  const removerFoto = useRemoverFotoGaleria();
  const { pendingFotoId, executar } = useExecutorDeFoto(definirErro);

  const editar = (fotoId: string, payload: { principal: true } | { identificacao: string }) =>
    executar(fotoId, () => editarFoto.mutateAsync({ modeloId, fotoId, payload }));

  return {
    pendingFotoId,
    isSaving: editarFoto.isPending,
    isRemoving: removerFoto.isPending,
    definirCapa: (fotoId: string) => editar(fotoId, { principal: true }),
    renomear: (fotoId: string, identificacao: string) => editar(fotoId, { identificacao }),
    remover: (fotoId: string) =>
      executar(fotoId, () => removerFoto.mutateAsync({ modeloId, fotoId })),
  };
}

function useAdicaoDeFoto(modeloId: string, definirErro: DefinirErro) {
  const adicionarFoto = useAdicionarFotoGaleria();
  const [aberto, setAberto] = useState(false);

  async function adicionar(file: File, identificacao: string): Promise<void> {
    definirErro(null);
    try {
      await adicionarFoto.mutateAsync({ modeloId, file, identificacao });
      setAberto(false);
    } catch (err) {
      definirErro(getModeloErrorMessage(err));
    }
  }

  return { aberto, setAberto, adicionar, isPending: adicionarFoto.isPending };
}

type EstadoProps = { actionError: string | null; galeria: Galeria };

function EstadoDaGaleria({ actionError, galeria }: EstadoProps) {
  const { isLoading, error, refetch } = galeria;
  return (
    <>
      {actionError ? <ErrorState title="Operação não concluída" description={actionError} /> : null}
      {isLoading ? <LoadingState title="Carregando galeria..." /> : null}
      {error ? <GaleriaErro error={error} onRetry={() => void refetch()} /> : null}
    </>
  );
}

type CarouselProps = {
  fotos: FotoGaleria[];
  indice: number | null;
  podeGerenciar: boolean;
  acoes: ReturnType<typeof useAcoesDeFoto>;
  onClose: () => void;
};

function CarouselDaGaleria({ fotos, indice, podeGerenciar, acoes, onClose }: CarouselProps) {
  if (indice === null || fotos.length === 0) return null;
  return (
    <GaleriaCarousel
      fotos={fotos}
      initialIndex={indice}
      podeGerenciar={podeGerenciar}
      pendingFotoId={acoes.pendingFotoId}
      isSavingGlobal={acoes.isSaving}
      isRemovingGlobal={acoes.isRemoving}
      onDefinirCapa={acoes.definirCapa}
      onRenomear={acoes.renomear}
      onRemover={acoes.remover}
      onClose={onClose}
    />
  );
}

function CabecalhoDoDialog({ bloqueado, onClose }: { bloqueado: boolean; onClose: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-base font-semibold text-fg">Adicionar foto à galeria</h3>
      <button
        type="button"
        disabled={bloqueado}
        onClick={onClose}
        className="rounded-md p-1 text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Fechar"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function DialogAdicionar({ adicao }: { adicao: ReturnType<typeof useAdicaoDeFoto> }) {
  const { aberto, setAberto, adicionar, isPending } = adicao;
  if (!aberto) return null;
  const fechar = (): void => setAberto(false);
  return (
    <Dialog titulo="Adicionar foto à galeria" bloqueado={isPending} onClose={fechar}>
      <div className="p-5">
        <CabecalhoDoDialog bloqueado={isPending} onClose={fechar} />
        <AdicionarFotoGaleriaForm isSubmitting={isPending} onSubmit={adicionar} onCancel={fechar} />
      </div>
    </Dialog>
  );
}

export function GaleriaModelo({ modeloId, codigo, podeGerenciar }: Props) {
  const galeria = useGaleriaModelo(modeloId);
  const [actionError, setActionError] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState<number | null>(null);
  const acoes = useAcoesDeFoto(modeloId, setActionError);
  const adicao = useAdicaoDeFoto(modeloId, setActionError);

  return (
    <div className="space-y-4">
      <EstadoDaGaleria actionError={actionError} galeria={galeria} />
      <FotosOuVazio
        galeria={galeria}
        codigo={codigo}
        podeGerenciar={podeGerenciar}
        onAbrirCarousel={setCarouselIndex}
        onAdicionar={() => adicao.setAberto(true)}
      />
      <DialogAdicionar adicao={adicao} />
      <CarouselDaGaleria
        fotos={galeria.data ?? []}
        indice={carouselIndex}
        podeGerenciar={podeGerenciar}
        acoes={acoes}
        onClose={() => setCarouselIndex(null)}
      />
    </div>
  );
}
