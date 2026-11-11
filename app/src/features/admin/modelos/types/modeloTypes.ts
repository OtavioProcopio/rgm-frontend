/** Nome de um tipo do catálogo (`GET /api/tipos-modelo`); os cinco de origem mantêm o identificador. */
export type TipoModelo = string;

/** O rótulo de cada tipo tem uma fonte só; este nome continua valendo para quem já o importa. */
export { rotuloDoTipoDeModelo as TIPO_MODELO_LABELS } from '@/shared/lib/rotulos';

export type Modelo = {
  id: string;
  codigo: string;
  versao: number;
  descricao: string;
  observacoes: string | null;
  fotoCapaUrl: string | null;
  ativo: boolean;
  maquina: string;
  tipo: TipoModelo | null;
  temPendenciaAberta: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

export type EventoModelo = {
  id: string;
  modeloId: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  estadoModeloDescricao: string | null;
  executadoPorUsuarioId: string | null;
  solicitacaoRelacionadaId: string | null;
  criadoEm: string;
};

export type ModelosFilters = {
  page: number;
  size: number;
  ativo?: boolean;
  codigo?: string;
  maquina?: string;
  descricao?: string;
  /** Catálogo: tipo exato do modelo. */
  tipo?: string;
  /** Catálogo: busca única por código ou descrição (sem acento), a partir de 2 caracteres. */
  q?: string;
  /** Catálogo: com `true`, `maquina` compara por igualdade em vez de "contém". */
  maquinaExata?: boolean;
  /** Catálogo: `CODIGO` ordena por código (versão maior primeiro); o padrão é por criação. */
  ordem?: 'CRIACAO' | 'CODIGO';
};

/** Quantos modelos cada tipo e cada máquina traria com os outros filtros (só os maiores que 0). */
export type ContagensDeModelos = {
  total: number;
  porTipo: { tipo: string; total: number }[];
  porMaquina: { maquina: string; total: number }[];
};

/** Posição (a partir de 1) do modelo na lista do filtro; nula se ele está fora do filtro. */
export type PosicaoDoModelo = { posicao: number | null; total: number };

/** Contagens do cadastro de modelos, calculadas pela API. */
export type ResumoDeModelos = {
  total: number;
  ativos: number;
  inativos: number;
  comPendenciaAberta: number;
  porMaquina: Array<{ maquina: string; quantidade: number }>;
};

/** Resumo das solicitações de um modelo, calculado pela API. */
export type ResumoDasSolicitacoesDoModelo = {
  total: number;
  emAberto: number;
  concluidas: number;
  canceladas: number;
  tempoMedioResolucaoSegundos: number | null;
  intervaloMedioSegundos: number | null;
};

export type CriarModeloRequest = {
  codigo: string;
  descricao: string;
  observacoes?: string;
  maquina: string;
  tipo?: TipoModelo;
};

export type EditarModeloRequest = {
  codigo: string;
  descricao: string;
  observacoes?: string;
  maquina: string;
  tipo?: TipoModelo;
};
