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
  responsavelIds: string[];
};

export type AtividadeSolicitacao = {
  id: string;
  solicitacaoId: string;
  tipo: TipoAtividadeSolicitacao;
  deStatus: StatusSolicitacao | null;
  paraStatus: StatusSolicitacao | null;
  comentario: string | null;
  autorUsuarioId: string;
  autorNome: string;
  criadaEm: string;
};

export type SolicitacoesFilters = {
  page: number;
  size: number;
  status?: StatusSolicitacao;
  modeloId?: string;
  tipo?: TipoSolicitacao;
  prioridade?: PrioridadeSolicitacao;
  criadaEmInicio?: string;
  criadaEmFim?: string;
  abertaPorUsuarioId?: string;
  responsavelId?: string;
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
  tipo: TipoSolicitacao;
};

export type TriarSolicitacaoRequest = {
  prioridade: PrioridadeSolicitacao;
  responsavelIds: string[];
};

export type EnviarParaValidacaoRequest = {
  comentario: string;
};

export type EncerrarSolicitacaoRequest = {
  concluir: boolean;
  comentario: string;
};

export type CancelarSolicitacaoRequest = {
  motivo: string;
};

export type DevolverSolicitacaoRequest = {
  motivo: string;
  prioridade?: PrioridadeSolicitacao;
};

export type ComentarioRequest = {
  comentario: string;
};

export type AlterarResponsaveisRequest = {
  responsavelIds: string[];
};

export type PontoDeSerie = {
  periodo: string;
  total: number;
  abertas: number;
  concluidas: number;
  canceladas: number;
  slaMediaHoras: number;
};

export type HistoricoMetricas = {
  series: PontoDeSerie[];
  slaGlobalMediaHoras: number;
  periodoLabel: string;
};

export type MetricasResponse = {
  totalUsuarios: number;
  totalModelos: number;
  totalSolicitacoes: number;
  solicitacoesPorStatus: Record<StatusSolicitacao, number>;
  solicitacoesAbertas: number;
  solicitacoesPendentes: number;
  solicitacoesConcluidas: number;
  tempoMedioResolucaoSegundos: number;
};

export type OrdenacaoMetricaModelo = 'TEMPO_RESOLUCAO' | 'INTERVALO';
export type DirecaoOrdenacao = 'asc' | 'desc';

export type MetricaPorModelo = {
  modeloId: string;
  codigo: string;
  tempoMedioResolucaoSegundos: number;
  intervaloMedioSegundos: number | null;
};

export type MetricasPorModeloFilters = {
  sort: OrdenacaoMetricaModelo;
  dir: DirecaoOrdenacao;
  page: number;
  size: number;
};

