export type Tom = 'ok' | 'atencao' | 'ruim' | 'neutro';

export type Leitura = { tom: Tom; texto: string };

export type TempoMedio = {
  segundos: number;
  amostra: { usados: number; total: number } | null;
};

/** Acima deste total de itens a média usa só parte deles, e a tela avisa. */
export const LIMITE_DA_AMOSTRA = 100;

/** Abaixo disto o percentual oscila demais; mostra-se a diferença absoluta. */
const ANTERIOR_MINIMO_PARA_PERCENTUAL = 5;
const LIMITE_DE_ATRASO_PERCENTUAL = 10;
const SEM_DADOS_ANTERIOR = 'sem dados no período anterior';

function comSinal(valor: number, sufixo: string): string {
  const sinal = valor > 0 ? '+' : '−';
  return `${sinal}${Math.abs(valor)}${sufixo} contra o período anterior`;
}

function leituraDaDiferenca(diferenca: number, sufixo: string): Leitura {
  if (diferenca === 0) return { tom: 'neutro', texto: 'igual ao período anterior' };
  return { tom: diferenca > 0 ? 'ok' : 'atencao', texto: comSinal(diferenca, sufixo) };
}

/** Variação de concluídas contra o período anterior, sem nunca dividir por zero. */
export function variacaoDeConcluidas(atual: number, anterior: number): Leitura {
  if (anterior === 0) return { tom: 'neutro', texto: SEM_DADOS_ANTERIOR };
  if (anterior < ANTERIOR_MINIMO_PARA_PERCENTUAL) return leituraDaDiferenca(atual - anterior, '');
  return leituraDaDiferenca(Math.round(((atual - anterior) / anterior) * 100), '%');
}

export function leituraDoAtraso(atrasadas: number, abertas: number): Leitura {
  if (atrasadas === 0) return { tom: 'ok', texto: 'Em dia' };
  if (abertas === 0) return { tom: 'ruim', texto: 'Ruim' };
  const percentual = (atrasadas / abertas) * 100;
  const texto = `${Math.round(percentual)}% das abertas`;
  if (percentual > LIMITE_DE_ATRASO_PERCENTUAL) return { tom: 'ruim', texto: `Ruim · ${texto}` };
  return { tom: 'atencao', texto: `Atenção · ${texto}` };
}

export function leituraDoTempoMedio(
  atualSegundos: number | null,
  anteriorSegundos: number | null,
): Leitura {
  if (atualSegundos === null) return { tom: 'neutro', texto: 'sem conclusões no período' };
  if (anteriorSegundos === null) return { tom: 'neutro', texto: SEM_DADOS_ANTERIOR };
  if (atualSegundos < anteriorSegundos)
    return { tom: 'ok', texto: 'Melhor que o período anterior' };
  if (atualSegundos === anteriorSegundos)
    return { tom: 'neutro', texto: 'Igual ao período anterior' };
  return { tom: 'ruim', texto: 'Pior que o período anterior' };
}

export type PaginaDeConcluidas = {
  content: { tempoResolucaoSegundos?: number | null }[];
  totalElements: number;
};

export type ResumoDoPeriodo = {
  concluidas: { atual: number; anterior: number } | undefined;
  tempoMedio: { atual: TempoMedio | null; anterior: TempoMedio | null } | undefined;
};

/** Média dos tempos de resolução disponíveis; `null` quando nenhum item tem tempo. */
export function tempoMedioDeResolucao(
  itens: { tempoResolucaoSegundos?: number | null }[],
  total: number,
): TempoMedio | null {
  const tempos = itens
    .map((item) => item.tempoResolucaoSegundos)
    .filter((tempo): tempo is number => typeof tempo === 'number');
  if (tempos.length === 0) return null;
  const soma = tempos.reduce((acumulado, tempo) => acumulado + tempo, 0);
  const amostra = total > LIMITE_DA_AMOSTRA ? { usados: tempos.length, total } : null;
  return { segundos: Math.round(soma / tempos.length), amostra };
}

function tempoMedioDaPagina(pagina: PaginaDeConcluidas): TempoMedio | null {
  return tempoMedioDeResolucao(pagina.content, pagina.totalElements);
}

/** Concluídas e tempo médio dos dois períodos; tudo `undefined` enquanto falta uma página. */
export function resumoDasPaginas(
  atual: PaginaDeConcluidas | undefined,
  anterior: PaginaDeConcluidas | undefined,
): ResumoDoPeriodo {
  if (!atual || !anterior) return { concluidas: undefined, tempoMedio: undefined };
  return {
    concluidas: { atual: atual.totalElements, anterior: anterior.totalElements },
    tempoMedio: { atual: tempoMedioDaPagina(atual), anterior: tempoMedioDaPagina(anterior) },
  };
}
