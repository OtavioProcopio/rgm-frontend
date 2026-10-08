import { useState } from 'react';

import { Button } from '@/shared/components/Button/Button';

import { DialogoDaAcao } from '../actions/DialogoDaAcao';
import { useAcoesPermitidas } from '../hooks/useAcoesPermitidas';
import { botoesDeAcao, type AcaoSolicitacao } from '../lib/acoesSolicitacao';
import type { Solicitacao } from '../types/solicitacaoTypes';

type Props = { solicitacao: Solicitacao };

/** Ações que o usuário pode executar sobre a solicitação; a ação escolhida abre em diálogo. */
export function SolicitacaoAcoes({ solicitacao }: Props) {
  const acoesDe = useAcoesPermitidas();
  const [acaoAberta, setAcaoAberta] = useState<AcaoSolicitacao | null>(null);

  const acoes = acoesDe(solicitacao);
  const botoes = botoesDeAcao(acoes);
  // A ação aberta fica até fechar: depois de feita, ela pode deixar de ser permitida e
  // ainda ter um aviso a mostrar (foto não enviada).
  if (botoes.length === 0 && !acaoAberta) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-fg-muted">Ações</h2>
      <div className="flex flex-wrap gap-2">
        {botoes.map((botao) => (
          <Button
            key={botao.acao}
            type="button"
            variant={botao.variante}
            onClick={() => setAcaoAberta(botao.acao)}
          >
            {botao.rotulo}
          </Button>
        ))}
      </div>
      {acaoAberta ? (
        <DialogoDaAcao
          acao={acaoAberta}
          solicitacao={solicitacao}
          onClose={() => setAcaoAberta(null)}
        />
      ) : null}
    </div>
  );
}
