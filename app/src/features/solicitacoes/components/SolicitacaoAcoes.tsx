import { useState } from 'react';

import { Button } from '@/shared/components/Button/Button';

import { AcaoSolicitacaoAtiva } from '../actions/AcaoSolicitacaoAtiva';
import { useAcoesPermitidas } from '../hooks/useAcoesPermitidas';
import { botoesDeAcao, type AcaoSolicitacao } from '../lib/acoesSolicitacao';
import type { Solicitacao } from '../types/solicitacaoTypes';

type Props = { solicitacao: Solicitacao };

/** Ações que o usuário pode executar sobre a solicitação, com o formulário da ação aberta. */
export function SolicitacaoAcoes({ solicitacao }: Props) {
  const acoesDe = useAcoesPermitidas();
  const [acaoAberta, setAcaoAberta] = useState<AcaoSolicitacao | null>(null);

  const acoes = acoesDe(solicitacao);
  const botoes = botoesDeAcao(acoes);
  if (botoes.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ações</h2>
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
      {acaoAberta && acoes.has(acaoAberta) ? (
        <AcaoSolicitacaoAtiva
          acao={acaoAberta}
          solicitacao={solicitacao}
          onClose={() => setAcaoAberta(null)}
        />
      ) : null}
    </div>
  );
}
