import { DIA_MS } from '@/shared/lib/duracao';

const LISTAGEM = '/app/solicitacoes';

function caminho(params: Record<string, string>): string {
  return `${LISTAGEM}?${new URLSearchParams(params).toString()}`;
}

export type FaixaDeIdade = 'menosDeUmDia' | 'umATresDias' | 'maisDeTresDias';

/**
 * Lista filtrada pela faixa de idade do trabalho em aberto. O corte é o instante do
 * clique: as faixas do backend são medidas no instante da consulta.
 */
export function caminhoDaFaixa(faixa: FaixaDeIdade, agora: Date): string {
  const corte = (dias: number): string => new Date(agora.getTime() - dias * DIA_MS).toISOString();
  if (faixa === 'menosDeUmDia') return caminho({ emAberto: 'true', criadaEmInicio: corte(1) });
  if (faixa === 'umATresDias') {
    return caminho({ emAberto: 'true', criadaEmInicio: corte(3), criadaEmFim: corte(1) });
  }
  return caminho({ emAberto: 'true', criadaEmFim: corte(3) });
}

export const caminhoDaMaquina = (maquina: string): string => caminho({ maquina });

export const caminhoDoModelo = (modeloId: string): string => caminho({ modeloId });

export const caminhoDoResponsavel = (usuarioId: string): string =>
  caminho({ emAberto: 'true', responsavelId: usuarioId });
