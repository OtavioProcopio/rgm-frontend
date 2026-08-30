export type TipoModelo =
  | 'PLACA_ALUMINIO'
  | 'MADEIRA_E_3D'
  | 'ALUMINIO_E_3D'
  | 'RESINA'
  | 'COQUILHA_ACO';

export const TIPO_MODELO_LABELS: Record<TipoModelo, string> = {
  PLACA_ALUMINIO: 'Placa Alumínio',
  MADEIRA_E_3D: 'Madeira e 3D',
  ALUMINIO_E_3D: 'Alumínio e 3D',
  RESINA: 'Resina',
  COQUILHA_ACO: 'Coquilha em Aço',
};

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

