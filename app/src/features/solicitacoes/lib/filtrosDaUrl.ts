import {
  rotuloDaPrioridade,
  rotuloDoStatus,
  rotuloDoTipoDeSolicitacao,
} from '@/shared/lib/rotulos';

import { termoDeBusca } from './buscaTextual';
import type {
  PrioridadeSolicitacao,
  SolicitacoesFilters,
  StatusSolicitacao,
  TipoSolicitacao,
} from '../types/solicitacaoTypes';

export type FiltrosDaUrl = Partial<
  Pick<
    SolicitacoesFilters,
    | 'status'
    | 'tipo'
    | 'prioridade'
    | 'atrasada'
    | 'emAberto'
    | 'maquina'
    | 'q'
    | 'modeloId'
    | 'responsavelId'
    | 'criadaEmInicio'
    | 'criadaEmFim'
  >
>;

const STATUS_VALIDOS = Object.keys(rotuloDoStatus) as StatusSolicitacao[];
const TIPOS_VALIDOS = Object.keys(rotuloDoTipoDeSolicitacao) as TipoSolicitacao[];
const PRIORIDADES_VALIDAS = Object.keys(rotuloDaPrioridade) as PrioridadeSolicitacao[];

/** Devolve o valor só se estiver na lista fechada; o resto nunca vai para a API. */
function valorDaLista<T extends string>(
  valor: string | null,
  validos: readonly T[],
): T | undefined {
  return validos.find((item) => item === valor);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INSTANTE_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

function deFormato(valor: string | null, formato: RegExp): string | undefined {
  return valor !== null && formato.test(valor) ? valor : undefined;
}

function verdadeiroExato(valor: string | null): true | undefined {
  return valor === 'true' ? true : undefined;
}

/** Lê os filtros da URL; `maquina` sozinha não conta como filtro do painel. */
export function lerFiltrosDaUrl(params: URLSearchParams): {
  filtros: FiltrosDaUrl;
  temFiltroDoPainel: boolean;
} {
  const painel: FiltrosDaUrl = {
    status: valorDaLista(params.get('status'), STATUS_VALIDOS),
    tipo: valorDaLista(params.get('tipo'), TIPOS_VALIDOS),
    prioridade: valorDaLista(params.get('prioridade'), PRIORIDADES_VALIDAS),
    atrasada: verdadeiroExato(params.get('atrasada')),
    emAberto: verdadeiroExato(params.get('emAberto')),
    modeloId: deFormato(params.get('modeloId'), UUID),
    responsavelId: deFormato(params.get('responsavelId'), UUID),
    criadaEmInicio: deFormato(params.get('criadaEmInicio'), INSTANTE_ISO),
    criadaEmFim: deFormato(params.get('criadaEmFim'), INSTANTE_ISO),
  };
  const maquina = params.get('maquina') || undefined;
  const q = termoDeBusca(params.get('q'));
  const filtros = Object.fromEntries(
    Object.entries({ ...painel, maquina, q }).filter(([, valor]) => valor !== undefined),
  ) as FiltrosDaUrl;
  const temFiltroDoPainel = Object.values(painel).some((valor) => valor !== undefined);
  return { filtros, temFiltroDoPainel };
}
