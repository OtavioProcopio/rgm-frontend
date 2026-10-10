import type {
  MetricasResponse,
  PrioridadeSolicitacao,
  StatusSolicitacao,
  TipoSolicitacao,
} from '@/features/solicitacoes/types/solicitacaoTypes';
import {
  rotuloDaPrioridade,
  rotuloDoStatus,
  rotuloDoTipoDeSolicitacao,
} from '@/shared/lib/rotulos';

export type VisaoDaDistribuicao = 'status' | 'tipo' | 'prioridade';
export type ParteDaDistribuicao = { valor: string; rotulo: string };
export type ParteContada = ParteDaDistribuicao & { quantidade: number };
export type ConfiguracaoDaVisao = {
  id: VisaoDaDistribuicao;
  rotulo: string;
  /** Nome do parâmetro de URL da listagem. */
  parametro: 'status' | 'tipo' | 'prioridade';
  partes: ParteDaDistribuicao[];
};

const LISTAGEM = '/app/solicitacoes';

function partesDe<T extends string>(
  valores: T[],
  rotulos: Record<T, string>,
): ParteDaDistribuicao[] {
  return valores.map((valor) => ({ valor, rotulo: rotulos[valor] }));
}

// Só as abertas: concluída e cancelada não são trabalho a distribuir.
const STATUS_EM_ABERTO: StatusSolicitacao[] = ['A_FAZER', 'EM_ANDAMENTO', 'EM_VALIDACAO'];
const TIPOS: TipoSolicitacao[] = ['REPARO', 'INSPECAO', 'REENGENHARIA', 'CRIACAO'];
const PRIORIDADES: PrioridadeSolicitacao[] = ['URGENTE', 'ALTA', 'MEDIA', 'BAIXA'];

export const VISOES: ConfiguracaoDaVisao[] = [
  {
    id: 'status',
    rotulo: 'Status',
    parametro: 'status',
    partes: partesDe(STATUS_EM_ABERTO, rotuloDoStatus),
  },
  {
    id: 'tipo',
    rotulo: 'Tipo',
    parametro: 'tipo',
    partes: partesDe(TIPOS, rotuloDoTipoDeSolicitacao),
  },
  {
    id: 'prioridade',
    rotulo: 'Prioridade',
    parametro: 'prioridade',
    partes: partesDe(PRIORIDADES, rotuloDaPrioridade),
  },
];

export function visaoPorId(id: VisaoDaDistribuicao): ConfiguracaoDaVisao {
  const visao = VISOES.find((candidata) => candidata.id === id);
  if (!visao) {
    throw new Error(`Visão desconhecida: "${id}". Esperado: status, tipo ou prioridade.`);
  }
  return visao;
}

/** Contagem da visão `status` vinda das métricas; `undefined` enquanto elas não chegam. */
export function partesPorStatus(
  metricas: MetricasResponse | undefined,
): ParteContada[] | undefined {
  if (!metricas) return undefined;
  return visaoPorId('status').partes.map((parte) => ({
    ...parte,
    quantidade: metricas.solicitacoesPorStatus[parte.valor as StatusSolicitacao],
  }));
}

/** Junta cada parte ao total da sua consulta; `undefined` enquanto algum total falta. */
export function partesPorConsulta(
  partes: ParteDaDistribuicao[],
  totais: Array<number | undefined>,
): ParteContada[] | undefined {
  const contados = totais.filter((total): total is number => total !== undefined);
  if (contados.length < partes.length) return undefined;
  return partes.map((parte, indice) => ({ ...parte, quantidade: contados[indice] }));
}

export function caminhoDoFiltro(visao: VisaoDaDistribuicao, valor: string): string {
  const { parametro } = visaoPorId(visao);
  return `${LISTAGEM}?emAberto=true&${parametro}=${encodeURIComponent(valor)}`;
}

export function caminhoDasAtrasadas(): string {
  return `${LISTAGEM}?atrasada=true&emAberto=true`;
}
