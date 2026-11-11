import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

import { Button } from '@/shared/components/Button/Button';
import { cn } from '@/shared/lib/cn';

type Props = {
  descricao: string;
  codigo: string;
  /** Endereços das fotos, a capa primeiro; vazio quando o modelo não tem foto. */
  fotos: string[];
  /** As fotos extras ainda estão chegando: só a capa está disponível. */
  carregandoFotos: boolean;
  erroNasFotos: boolean;
  onTentarFotos: () => void;
};

function FotoGrande({ url, alt }: { url: string; alt: string }) {
  const [carregada, setCarregada] = useState(false);
  const imagem = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imagem.current?.complete) setCarregada(true);
  }, []);

  return (
    <img
      ref={imagem}
      src={url}
      alt={alt}
      onLoad={() => setCarregada(true)}
      data-carregada={carregada}
      className={cn(
        'h-full w-full object-contain transition-opacity duration-300 motion-reduce:transition-none',
        carregada ? 'opacity-100' : 'opacity-0',
      )}
    />
  );
}

const BOTAO_DA_SETA =
  'absolute top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-scrim text-on-solid transition hover:brightness-125';

/**
 * A foto grande do destaque e a faixa de miniaturas. Clicar numa miniatura, as setas sobre a foto
 * e as setas do teclado dentro da faixa trocam a foto, com transição suave (sem ela para quem pede
 * movimento reduzido). Trocar de foto não faz requisição.
 */
export function GaleriaDoDestaque({
  descricao,
  codigo,
  fotos,
  carregandoFotos,
  erroNasFotos,
  onTentarFotos,
}: Props) {
  const [indice, setIndice] = useState(0);
  const miniaturas = useRef<(HTMLButtonElement | null)[]>([]);
  const total = fotos.length;
  const atual = total > 0 ? Math.min(indice, total - 1) : 0;

  function ir(destino: number, moverFoco = false) {
    const proximo = ((destino % total) + total) % total;
    setIndice(proximo);
    if (moverFoco) miniaturas.current[proximo]?.focus();
  }

  function aoApertar(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key === 'ArrowLeft') ir(atual - 1, true);
    else if (evento.key === 'ArrowRight') ir(atual + 1, true);
    else return;
    evento.preventDefault();
  }

  return (
    <div className="space-y-3">
      <div className="relative flex aspect-[16/10] max-h-[46vh] w-full items-center justify-center overflow-hidden rounded-md border border-line bg-surface-muted">
        {total > 0 ? (
          <FotoGrande
            key={fotos[atual]}
            url={fotos[atual]}
            alt={`${descricao}, foto ${atual + 1} de ${total}`}
          />
        ) : (
          <div className="text-center text-fg-muted">
            <p aria-hidden="true" className="text-6xl font-bold">
              {codigo.slice(0, 2)}
            </p>
            <p className="text-sm">Sem foto cadastrada</p>
          </div>
        )}
        {total > 1 ? (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              className={cn(BOTAO_DA_SETA, 'left-3')}
              onClick={() => ir(atual - 1)}
            >
              <ChevronLeft aria-hidden="true" size={20} />
            </button>
            <button
              type="button"
              aria-label="Próxima foto"
              className={cn(BOTAO_DA_SETA, 'right-3')}
              onClick={() => ir(atual + 1)}
            >
              <ChevronRight aria-hidden="true" size={20} />
            </button>
          </>
        ) : null}
      </div>

      {total > 0 ? (
        <p className="text-xs text-fg-muted">
          Foto {atual + 1} de {total}
          {atual === 0 ? ' — capa' : ''}
        </p>
      ) : null}

      {total > 1 ? (
        <div
          role="group"
          aria-label="Fotos do modelo"
          data-faixa-de-fotos=""
          onKeyDown={aoApertar}
          className="flex gap-2 overflow-x-auto p-1"
        >
          {fotos.map((url, posicao) => (
            <button
              key={url}
              ref={(elemento) => {
                miniaturas.current[posicao] = elemento;
              }}
              type="button"
              tabIndex={posicao === atual ? 0 : -1}
              aria-label={`Foto ${posicao + 1} de ${total}${posicao === 0 ? ' (capa)' : ''}`}
              aria-current={posicao === atual ? 'true' : undefined}
              onClick={() => ir(posicao)}
              className={cn(
                'h-16 w-20 shrink-0 overflow-hidden rounded-md border-2 bg-surface-muted',
                posicao === atual ? 'border-accent' : 'border-line hover:border-line-strong',
              )}
            >
              <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {carregandoFotos && total <= 1 ? (
        <p role="status" className="text-xs text-fg-muted">
          Carregando as outras fotos…
        </p>
      ) : null}
      {erroNasFotos ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-danger-fg">
          <span>Não foi possível carregar as outras fotos.</span>
          <Button variant="secondary" size="sm" onClick={onTentarFotos}>
            Tentar novamente
          </Button>
        </div>
      ) : null}
    </div>
  );
}
