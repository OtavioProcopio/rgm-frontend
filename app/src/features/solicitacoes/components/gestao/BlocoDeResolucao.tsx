import { formatarDuracao } from '@/shared/lib/duracao';

import type { IndicadoresDeGestao } from '../../types/solicitacaoTypes';
import { Bloco } from './Bloco';

function duracao(segundos: number | null): string {
  return segundos === null ? 'sem dados' : formatarDuracao(segundos * 1000);
}

type Props = { resolucao: IndicadoresDeGestao['resolucao']; dias: number };

export function BlocoDeResolucao({ resolucao, dias }: Props) {
  return (
    <Bloco titulo="Tempo de resolução" descricao={`Concluídas nos últimos ${dias} dias`}>
      <dl className="grid grid-cols-2 gap-3">
        <div>
          <dt className="text-xs text-fg-muted">Caso típico (mediana)</dt>
          <dd className="text-2xl font-bold tabular-nums text-fg">
            {duracao(resolucao.medianaSegundos)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-fg-muted">Pior caso comum (p90)</dt>
          <dd className="text-2xl font-bold tabular-nums text-fg">
            {duracao(resolucao.p90Segundos)}
          </dd>
        </div>
      </dl>
      <p className="text-xs text-fg-muted">Com base em {resolucao.concluidas} concluída(s).</p>
    </Bloco>
  );
}
