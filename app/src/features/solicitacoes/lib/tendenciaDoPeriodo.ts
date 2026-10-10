import type { PontoDeSerie } from '../types/solicitacaoTypes';

const EIXO_MINIMO: number[] = [0, 1, 2];
const LIMITE_DO_TOPO_PAR = 10;
const LIMITE_DE_DIAS_DIARIOS = 30;

/** Até 10, o próximo par; acima, o menor 1-2-5 x 10^n: topo par e meio inteiro. */
function topoDoEixo(maximo: number): number {
  const teto: number = Math.ceil(maximo);
  if (teto <= LIMITE_DO_TOPO_PAR) return Math.max(2, teto + (teto % 2));
  const potencia: number = 10 ** Math.floor(Math.log10(teto));
  const mantissa: number = teto / potencia;
  if (mantissa <= 1) return potencia;
  if (mantissa <= 2) return 2 * potencia;
  if (mantissa <= 5) return 5 * potencia;
  return 10 * potencia;
}

export function marcasDoEixo(maximo: number): number[] {
  if (!(maximo > 0)) return [...EIXO_MINIMO];
  const topo: number = topoDoEixo(maximo);
  return [0, topo / 2, topo];
}

export function semMovimento(series: PontoDeSerie[]): boolean {
  return series.every((ponto) => ponto.abertas === 0 && ponto.concluidas === 0);
}

export function ehHoje(indice: number, total: number): boolean {
  return total > 0 && indice === total - 1;
}

/** Acima de 30 dias a API devolve pontos semanais. */
export function rotuloDoUltimoPonto(dias: number): 'Hoje' | 'Esta semana' {
  return dias > LIMITE_DE_DIAS_DIARIOS ? 'Esta semana' : 'Hoje';
}

function contar(quantidade: number, singular: string, plural: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}

/** A série é por data de criação: "abertas" são as criadas no dia que seguem abertas. */
export function rotuloDoPonto(ponto: PontoDeSerie): string {
  const criadas: string = contar(ponto.total, 'criada', 'criadas');
  const abertas: string = contar(ponto.abertas, 'ainda aberta', 'ainda abertas');
  const concluidas: string = contar(ponto.concluidas, 'concluída', 'concluídas');
  return `${ponto.periodo}: ${criadas}, ${abertas}, ${concluidas}`;
}
