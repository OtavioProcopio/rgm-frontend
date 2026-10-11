import { Link } from 'react-router';

import { caminhoDaFaixa, type FaixaDeIdade } from '../../lib/caminhosDaGestao';
import type { IndicadoresDeGestao } from '../../types/solicitacaoTypes';
import { Bloco } from './Bloco';

const FAIXAS: { chave: FaixaDeIdade; rotulo: string }[] = [
  { chave: 'menosDeUmDia', rotulo: 'Menos de 1 dia' },
  { chave: 'umATresDias', rotulo: '1 a 3 dias' },
  { chave: 'maisDeTresDias', rotulo: 'Mais de 3 dias' },
];

type Props = { backlog: IndicadoresDeGestao['backlog'] };

export function BlocoDeBacklog({ backlog }: Props) {
  const agora = new Date();
  return (
    <Bloco titulo="Idade das abertas" descricao={`${backlog.abertas} abertas agora`}>
      <ul className="space-y-1">
        {FAIXAS.map(({ chave, rotulo }) => (
          <li key={chave}>
            <Link
              to={caminhoDaFaixa(chave, agora)}
              className="flex justify-between gap-3 rounded-md py-1 text-sm hover:bg-surface-muted pointer-coarse:min-h-11"
            >
              <span className="text-fg">{rotulo}</span>
              <span className="tabular-nums text-fg-muted">{backlog[chave]}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm text-fg-muted">{backlog.semResponsavel} aberta(s) sem responsável.</p>
    </Bloco>
  );
}
