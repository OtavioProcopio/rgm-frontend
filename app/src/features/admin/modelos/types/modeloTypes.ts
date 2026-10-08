export type TipoModelo =
  'PLACA_ALUMINIO' | 'MADEIRA_E_3D' | 'ALUMINIO_E_3D' | 'RESINA' | 'COQUILHA_ACO';

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
};

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
