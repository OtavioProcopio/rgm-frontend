import { Info, Pencil } from 'lucide-react';
import { useId } from 'react';

import { Button } from '@/shared/components/Button/Button';

import { instrucaoParaExibir } from '../lib/instrucaoParaExibir';
import type { Solicitacao } from '../types/solicitacaoTypes';

type Props = {
  solicitacao: Pick<Solicitacao, 'status' | 'instrucao'>;
  /** Presente só quando a API permite corrigir a instrução. */
  aoEditar?: (() => void) | null;
};

/**
 * O que precisa ser feito, em destaque no topo do detalhe. Mostra a instrução inteira (é o
 * conteúdo principal, não se recolhe) ou, nas triadas antes de o campo existir, o aviso de que
 * não há registro.
 */
export function InstrucaoDaSolicitacao({ solicitacao, aoEditar }: Props) {
  const tituloId = useId();
  const exibicao = instrucaoParaExibir(solicitacao);

  if (exibicao.tipo === 'nenhuma') return null;

  if (exibicao.tipo === 'semRegistro') {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-surface-muted px-4 py-3">
        <p className="flex items-start gap-2 text-sm text-fg-muted">
          <Info aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
          <span>
            Sem instrução registrada. Esta solicitação foi triada antes deste campo existir.
          </span>
        </p>
        {aoEditar ? (
          <Button variant="secondary" onClick={aoEditar}>
            Adicionar instrução
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <section
      aria-labelledby={tituloId}
      className="rounded-md border border-l-4 border-info bg-info-soft p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id={tituloId} className="text-sm font-semibold text-info-fg">
          O que precisa ser feito
        </h3>
        {aoEditar ? (
          <Button
            variant="secondary"
            size="sm"
            className="pointer-coarse:min-h-11"
            aria-label="Editar o que precisa ser feito"
            onClick={aoEditar}
          >
            <Pencil aria-hidden="true" size={14} className="mr-1.5" />
            Editar
          </Button>
        ) : null}
      </div>
      <p className="mt-2 whitespace-pre-line break-words text-sm text-info-fg">{exibicao.texto}</p>
    </section>
  );
}
