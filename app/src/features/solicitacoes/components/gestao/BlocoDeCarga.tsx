import { Link } from 'react-router';

import { caminhoDoResponsavel } from '../../lib/caminhosDaGestao';
import type { IndicadoresDeGestao } from '../../types/solicitacaoTypes';
import { Bloco } from './Bloco';

type Props = { carga: IndicadoresDeGestao['carga'] };

export function BlocoDeCarga({ carga }: Props) {
  const soma = carga.responsaveis.reduce((total, r) => total + r.abertas, 0);
  const passaDoTotal = soma > carga.solicitacoesDistintas;
  return (
    <Bloco titulo="Carga por responsável" descricao="Solicitações abertas de cada pessoa">
      {carga.responsaveis.length === 0 ? (
        <p className="text-sm text-fg-muted">Nenhuma solicitação aberta com responsável.</p>
      ) : (
        <ul className="space-y-1">
          {carga.responsaveis.map((r) => (
            <li key={r.usuarioId}>
              <Link
                to={caminhoDoResponsavel(r.usuarioId)}
                className="flex justify-between gap-3 rounded-md py-1 text-sm hover:bg-surface-muted pointer-coarse:min-h-11"
              >
                <span className="text-fg">{r.nome}</span>
                <span className="tabular-nums text-fg-muted">{r.abertas}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {passaDoTotal ? (
        <p className="text-xs text-fg-muted">
          A soma ({soma}) passa de {carga.solicitacoesDistintas} solicitações porque um pedido com
          dois responsáveis conta para os dois.
        </p>
      ) : null}
    </Bloco>
  );
}
