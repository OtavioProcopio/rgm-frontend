import { Link } from 'react-router';

import { formatarDuracao } from '@/shared/lib/duracao';

import { caminhoDaMaquina } from '../../lib/caminhosDaGestao';
import type { MaquinaDeGestao } from '../../types/solicitacaoTypes';
import { Bloco } from './Bloco';

type Props = { maquinas: MaquinaDeGestao[] };

export function BlocoPorMaquina({ maquinas }: Props) {
  return (
    <Bloco titulo="Por máquina" descricao="Abertas, em atraso e tempo médio de resolução">
      {maquinas.length === 0 ? (
        <p className="text-sm text-fg-muted">Nenhuma máquina com solicitações no período.</p>
      ) : (
        <ul className="space-y-1">
          {maquinas.map((m) => (
            <li key={m.maquina}>
              <Link
                to={caminhoDaMaquina(m.maquina)}
                className="flex flex-wrap items-center justify-between gap-x-3 rounded-md py-1 text-sm hover:bg-surface-muted pointer-coarse:min-h-11"
              >
                <span className="font-medium text-fg">{m.maquina}</span>
                <span className="tabular-nums text-fg-muted">
                  {m.abertas} abertas · {m.emAtraso} em atraso ·{' '}
                  {m.tempoMedioResolucaoSegundos === null
                    ? 'sem dados'
                    : formatarDuracao(m.tempoMedioResolucaoSegundos * 1000)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Bloco>
  );
}
