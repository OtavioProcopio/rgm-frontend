const ROTULO: string = 'Filtros';

function quantidadeValida(quantidade: number): number {
  const inteira: boolean = Number.isInteger(quantidade);
  return inteira && quantidade > 0 ? quantidade : 0;
}

export function resumoDeFiltros(quantidade: number): string {
  const total: number = quantidadeValida(quantidade);
  if (total === 0) return ROTULO;
  if (total === 1) return `${ROTULO} · 1 ativo`;
  return `${ROTULO} · ${total} ativos`;
}
