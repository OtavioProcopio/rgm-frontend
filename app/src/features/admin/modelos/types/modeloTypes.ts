export type Modelo = {
  id: string;
  codigo: string;
  versao: number;
  descricao: string;
  observacoes: string | null;
  fotoUrl: string | null;
  ativo: boolean;
  maquina: string;
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
  defineFotoCapa: boolean;
  executadoPorUsuarioId: string | null;
  solicitacaoRelacionadaId: string | null;
  criadoEm: string;
};

export type ModelosFilters = {
  page: number;
  size: number;
  ativo?: boolean;
  codigo?: string;
};

export type CriarModeloRequest = {
  codigo: string;
  descricao: string;
  observacoes?: string;
  maquina: string;
};

export type EditarModeloRequest = {
  codigo: string;
  descricao: string;
  observacoes?: string;
  maquina: string;
};

export type FotoCapaUploadRequest = {
  evidenciaId: string;
};
