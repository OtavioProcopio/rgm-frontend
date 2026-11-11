import type { ModelosFilters } from '@/features/admin/modelos/types/modeloTypes';

/** Modelos por bloco: o tamanho da página que a lista pede e que a posição divide. */
export const TAMANHO_DO_BLOCO = 20;

/** Menor busca que o servidor aceita. */
export const BUSCA_MINIMA = 2;

export type FiltrosDoCatalogo = {
  tipo: string;
  maquina: string;
  q: string;
  inativos: boolean;
  /** O modelo em destaque; vazio até a lista dizer qual é o primeiro. */
  modelo: string;
};

export const FILTROS_PADRAO: FiltrosDoCatalogo = {
  tipo: '',
  maquina: '',
  q: '',
  inativos: false,
  modelo: '',
};

/** Lê os filtros do endereço; o que não existe ou vem em branco volta ao padrão. */
export function lerFiltros(params: URLSearchParams): FiltrosDoCatalogo {
  return {
    tipo: params.get('tipo')?.trim() ?? '',
    maquina: params.get('maquina')?.trim() ?? '',
    q: params.get('q') ?? '',
    inativos: params.get('inativos') === '1',
    modelo: params.get('modelo')?.trim() ?? '',
  };
}

/** Escreve só o que difere do padrão, para o endereço ficar curto. */
export function escreverFiltros(filtros: FiltrosDoCatalogo): URLSearchParams {
  const params = new URLSearchParams();
  if (filtros.tipo) params.set('tipo', filtros.tipo);
  if (filtros.maquina) params.set('maquina', filtros.maquina);
  if (filtros.q) params.set('q', filtros.q);
  if (filtros.inativos) params.set('inativos', '1');
  if (filtros.modelo) params.set('modelo', filtros.modelo);
  return params;
}

/** A busca só vale a partir de 2 caracteres, depois de aparada. */
export function buscaValida(q: string): string {
  const aparada = q.trim();
  return aparada.length >= BUSCA_MINIMA ? aparada : '';
}

/** O que a busca de 1 caractere pede: avisar em vez de filtrar. */
export function buscaCurtaDemais(q: string): boolean {
  const aparada = q.trim();
  return aparada.length > 0 && aparada.length < BUSCA_MINIMA;
}

/** Filtros do servidor: máquina por igualdade, só ativos salvo se pedir os inativos. */
export function paraConsulta(
  filtros: FiltrosDoCatalogo,
): Omit<ModelosFilters, 'page' | 'size' | 'ordem'> {
  const q = buscaValida(filtros.q);
  return {
    ...(filtros.tipo ? { tipo: filtros.tipo } : {}),
    ...(filtros.maquina ? { maquina: filtros.maquina, maquinaExata: true } : {}),
    ...(q ? { q } : {}),
    ...(filtros.inativos ? {} : { ativo: true }),
  };
}

/** Algum filtro além do padrão (o modelo em destaque não conta). */
export function temFiltro(filtros: FiltrosDoCatalogo): boolean {
  return Boolean(filtros.tipo || filtros.maquina || buscaValida(filtros.q) || filtros.inativos);
}
