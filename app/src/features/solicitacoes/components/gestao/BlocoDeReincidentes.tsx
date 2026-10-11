import { Link } from 'react-router';

import { caminhoDoModelo } from '../../lib/caminhosDaGestao';
import type { ModeloReincidente } from '../../types/solicitacaoTypes';
import { Bloco } from './Bloco';

type Props = { reincidentes: ModeloReincidente[]; dias: number };

export function BlocoDeReincidentes({ reincidentes, dias }: Props) {
  return (
    <Bloco
      titulo="Modelos reincidentes"
      descricao={`Com 3 ou mais reparos nos últimos ${dias} dias`}
    >
      {reincidentes.length === 0 ? (
        <p className="text-sm text-fg-muted">Nenhum modelo reincidente no período.</p>
      ) : (
        <ul className="space-y-1">
          {reincidentes.map((m) => (
            <li key={m.modeloId}>
              <Link
                to={caminhoDoModelo(m.modeloId)}
                className="flex flex-wrap items-center justify-between gap-x-3 rounded-md py-1 text-sm hover:bg-surface-muted pointer-coarse:min-h-11"
              >
                <span className="font-medium text-fg">
                  {m.codigo} v{m.versao}
                  {m.maquina ? ` · ${m.maquina}` : ''}
                </span>
                <span className="tabular-nums text-fg-muted">{m.solicitacoes} reparos</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Bloco>
  );
}
