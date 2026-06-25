export type StatusSolicitacao =
  | 'A_FAZER'
  | 'EM_ANDAMENTO'
  | 'EM_VALIDACAO'
  | 'CONCLUIDA'
  | 'CANCELADA';
export type PrioridadeSolicitacao = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
export type TipoSolicitacao = 'REPARO' | 'INSPECAO' | 'REENGENHARIA';
export type TipoAtividadeSolicitacao =
  | 'ABERTURA'
  | 'ATRIBUICAO'
  | 'MUDANCA_STATUS'
  | 'COMENTARIO'
  | 'EVIDENCIA_ADICIONADA';

export type Solicitacao = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: TipoSolicitacao;
  status: StatusSolicitacao;
  prioridade: PrioridadeSolicitacao | null;
  modeloId: string;
  abertaPorUsuarioId: string;
  comentarioFinal: string | null;
  criadaEm: string;
  atualizadaEm: string;
  concluidaEm: string | null;
  canceladaEm: string | null;
};

export type AtividadeSolicitacao = {
  id: string;
  solicitacaoId: string;
  tipo: TipoAtividadeSolicitacao;
  deStatus: StatusSolicitacao | null;
  paraStatus: StatusSolicitacao | null;
  comentario: string | null;
  autorUsuarioId: string;
  criadaEm: string;
};

export type SolicitacoesFilters = {
  page: number;
  size: number;
  status?: StatusSolicitacao;
  modeloId?: string;
};

export type AbrirSolicitacaoRequest = {
  titulo: string;
  descricao: string;
  tipo: TipoSolicitacao;
  modeloId: string;
};

export type EditarSolicitacaoRequest = {
  titulo: string;
  descricao: string;
};

export type TriarSolicitacaoRequest = {
  prioridade: PrioridadeSolicitacao;
  responsavelIds: string[];
};

export type EncerrarSolicitacaoRequest = {
  concluir: boolean;
  comentario: string;
};

export type CancelarSolicitacaoRequest = {
  motivo: string;
};

export type DevolverSolicitacaoRequest = {
  motivo?: string;
  prioridade?: PrioridadeSolicitacao;
};

export type ComentarioRequest = {
  comentario: string;
};

export type MetricasResponse = {
  totalUsuarios: number;
  totalMaquinas: number;
  totalModelos: number;
  totalSolicitacoes: number;
  solicitacoesPorStatus: Record<StatusSolicitacao, number>;
  solicitacoesAbertas: number;
  solicitacoesPendentes: number;
  solicitacoesConcluidas: number;
  tempoMedioResolucaoMinutos: number;
};

