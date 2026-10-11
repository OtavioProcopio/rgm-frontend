import { formatarDuracao } from '@/shared/lib/duracao';

import {
  ROTULO_DA_ETAPA,
  textoDoGargalo,
  type ChaveDaEtapa,
} from '../../lib/gargaloDasEtapas';
import { formatarPercentual } from '../../lib/leituraDoPrazo';
import type { IndicadoresDeGestao } from '../../types/solicitacaoTypes';
import { Bloco } from './Bloco';

const CHAVES: ChaveDaEtapa[] = ['esperaAteIniciar', 'execucao', 'esperaDeValidacao'];

type Props = {
  etapas: IndicadoresDeGestao['etapas'];
  devolucao: IndicadoresDeGestao['devolucao'];
  dias: number;
};

export function BlocoDeEtapas({ etapas, devolucao, dias }: Props) {
  return (
    <Bloco titulo="Onde o tempo se perde" descricao={`Tempo típico por etapa, ${dias} dias`}>
      <ul className="space-y-1 text-sm">
        {CHAVES.map((chave) => {
          const { medianaSegundos, amostras } = etapas[chave];
          return (
            <li key={chave} className="flex justify-between gap-3">
              <span className="text-fg">{ROTULO_DA_ETAPA[chave]}</span>
              <span className="tabular-nums text-fg-muted">
                {medianaSegundos === null
                  ? 'sem dados'
                  : `${formatarDuracao(medianaSegundos * 1000)} (${amostras})`}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-sm font-medium text-fg">{textoDoGargalo(etapas)}</p>
      <p className="text-sm text-fg-muted">
        {devolucao.enviadasParaValidacao === 0
          ? 'Nada foi enviado para validação no período.'
          : `${devolucao.devolucoes} devolvida(s) de ${devolucao.enviadasParaValidacao} enviada(s) para validação (${formatarPercentual(devolucao.taxa)}).`}
      </p>
    </Bloco>
  );
}
