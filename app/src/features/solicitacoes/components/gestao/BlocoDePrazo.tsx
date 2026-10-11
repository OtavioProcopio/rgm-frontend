import { AlertTriangle, CheckCircle2, Minus, XCircle } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { rotuloDaPrioridade } from '@/shared/lib/rotulos';

import { formatarPercentual, leituraDoPrazo } from '../../lib/leituraDoPrazo';
import type { Tom } from '../../lib/leituraDosIndicadores';
import type { IndicadoresDeGestao } from '../../types/solicitacaoTypes';
import { Bloco } from './Bloco';

const TOM: Record<Tom, { Icone: typeof Minus; classe: string }> = {
  ok: { Icone: CheckCircle2, classe: 'text-success-fg' },
  atencao: { Icone: AlertTriangle, classe: 'text-warning-fg' },
  ruim: { Icone: XCircle, classe: 'text-danger-fg' },
  neutro: { Icone: Minus, classe: 'text-fg-muted' },
};

type Props = { prazo: IndicadoresDeGestao['prazo']; dias: number };

export function BlocoDePrazo({ prazo, dias }: Props) {
  const leitura = leituraDoPrazo(prazo.percentualNoPrazo);
  const { Icone, classe } = TOM[leitura.tom];
  const semBase = prazo.percentualNoPrazo === null;

  return (
    <Bloco titulo="Prazo cumprido" descricao={`Concluídas nos últimos ${dias} dias`}>
      <p className="text-3xl font-bold tabular-nums text-fg">
        {formatarPercentual(prazo.percentualNoPrazo)}
      </p>
      <p className={cn('flex items-center gap-1.5 text-sm font-medium', classe)}>
        <Icone size={16} aria-hidden="true" />
        {leitura.texto}
      </p>
      {semBase ? null : (
        <p className="text-sm text-fg-muted">
          {prazo.noPrazo} de {prazo.concluidasComPrioridade} concluídas dentro do prazo
        </p>
      )}
      {prazo.concluidasSemPrioridade > 0 ? (
        <p className="text-xs text-fg-muted">
          {prazo.concluidasSemPrioridade} concluída(s) sem prioridade ficaram fora da conta.
        </p>
      ) : null}
      <ul className="space-y-1 text-sm">
        {prazo.porPrioridade.map((item) => (
          <li key={item.prioridade} className="flex justify-between gap-3">
            <span className="text-fg">{rotuloDaPrioridade[item.prioridade]}</span>
            <span className="tabular-nums text-fg-muted">
              {item.percentualNoPrazo === null
                ? 'sem concluídas'
                : `${formatarPercentual(item.percentualNoPrazo)} (${item.noPrazo} de ${item.concluidas})`}
            </span>
          </li>
        ))}
      </ul>
    </Bloco>
  );
}
