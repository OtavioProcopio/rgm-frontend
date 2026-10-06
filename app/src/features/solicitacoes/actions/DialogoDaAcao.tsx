import { useIsMutating } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/shared/components/Button/Button';
import { Dialog } from '@/shared/components/Dialog/Dialog';

import { rotuloDaAcao, type AcaoSolicitacao } from '../lib/acoesSolicitacao';
import type { Solicitacao } from '../types/solicitacaoTypes';
import { AcaoSolicitacaoAtiva } from './AcaoSolicitacaoAtiva';

type Props = {
  acao: AcaoSolicitacao;
  solicitacao: Solicitacao;
  /** Chamado quando o diálogo deve fechar: ação concluída, desistência ou descarte confirmado. */
  onClose: () => void;
};

/**
 * Diálogo modal de uma ação da solicitação, o mesmo no quadro e no detalhe. Montado
 * significa aberto. Não fecha durante o envio e pergunta antes de descartar o que foi
 * preenchido.
 */
export function DialogoDaAcao({ acao, solicitacao, onClose }: Props) {
  // Com o diálogo modal aberto, as únicas mutações possíveis são as da própria ação.
  const enviando = useIsMutating() > 0;
  const [alterado, setAlterado] = useState(false);
  const [perguntando, setPerguntando] = useState(false);
  const focoAntesDaPergunta = useRef<HTMLElement | null>(null);

  function desistir() {
    if (!alterado) {
      onClose();
      return;
    }
    focoAntesDaPergunta.current = document.activeElement as HTMLElement | null;
    setPerguntando(true);
  }

  // O formulário só volta a aceitar foco depois de reaparecer.
  useEffect(() => {
    if (!perguntando) focoAntesDaPergunta.current?.focus();
  }, [perguntando]);

  return (
    <Dialog
      titulo={`${rotuloDaAcao(acao)}: ${solicitacao.titulo}`}
      onClose={perguntando ? () => setPerguntando(false) : desistir}
      bloqueado={enviando}
    >
      {/* O formulário fica montado e oculto durante a pergunta, para manter o que foi preenchido. */}
      <div hidden={perguntando} onChange={() => setAlterado(true)}>
        <AcaoSolicitacaoAtiva
          acao={acao}
          solicitacao={solicitacao}
          onClose={onClose}
          onCancelar={desistir}
        />
      </div>
      {perguntando ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100">
          <h3 className="font-semibold">Descartar o que foi preenchido?</h3>
          <p className="mt-2">O que você preencheu nesta ação será perdido.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              autoFocus
              onClick={() => setPerguntando(false)}
            >
              Continuar editando
            </Button>
            <Button type="button" variant="danger" onClick={onClose}>
              Descartar
            </Button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
