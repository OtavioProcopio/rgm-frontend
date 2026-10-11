export type StatusSolicitacao =
  'A_FAZER' | 'EM_ANDAMENTO' | 'EM_VALIDACAO' | 'CONCLUIDA' | 'CANCELADA';
export type PrioridadeSolicitacao = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
export type TipoSolicitacao = 'REPARO' | 'INSPECAO' | 'REENGENHARIA' | 'CRIACAO';
export type TipoAtividadeSolicitacao =
  'ABERTURA' | 'ATRIBUICAO' | 'MUDANCA_STATUS' | 'COMENTARIO' | 'EVIDENCIA_ADICIONADA';

export type Solicitacao = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: TipoSolicitacao;
  status: StatusSolicitacao;
  prioridade: PrioridadeSolicitacao | null;
  /** Nulo enquanto uma solicitação CRIACAO ainda não foi concluída (o modelo ainda não existe). */
  modeloId: string | null;
  /**
   * Código e máquina do modelo: o backend v1.6 os preenche para toda solicitação com modelo; em
   * CRIACAO sem modelo são os dados informados na abertura.
   */
  modeloCodigo?: string | null;
  modeloMaquina?: string | null;
  /** Versão do modelo do cadastro; vem na listagem e no detalhe a partir do backend v1.6. */
  modeloVersao?: number | null;
  modeloObservacoes?: string | null;
  abertaPorUsuarioId: string;
  comentarioFinal: string | null;
  criadaEm: string;
  atualizadaEm: string;
  concluidaEm: string | null;
  canceladaEm: string | null;
  responsavelIds: string[];
  /** Prazo de SLA calculado pela API a partir da abertura. Ausente sem prioridade e em eventos. */
  prazoLimite?: string | null;
  /** Negativo quando o prazo já venceu; nulo em solicitação encerrada. */
  tempoRestanteSegundos?: number | null;
  /** Em aberto: prazo vencido. Concluída: concluída depois do prazo. Cancelada: sempre falso. */
  atrasada?: boolean;
  tempoResolucaoSegundos?: number | null;
  /** Só vem no detalhe, a partir da v1.6.0 do backend. Ausente em listagens e eventos. */
  acoesPermitidas?: string[] | null;
  /** Só vêm quando a API os informa (issue rgm-backend#114); ausentes na v1.5.0. */
  responsaveis?: { id: string; nome: string }[] | null;
  abertaPorNome?: string | null;
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
  maquina?: string;
  atrasada?: boolean;
  /** Só A Fazer, Em Andamento e Em Validação. */
  emAberto?: boolean;
  /** A que data `dataInicio` e `dataFim` se referem; `CONCLUSAO` cobre também o cancelamento. */
  tipoData?: 'CRIACAO' | 'CONCLUSAO';
  dataInicio?: string;
  dataFim?: string;
  /** Ordenação da API; o backend antigo a ignora e mantém a ordem de sempre. */
  sort?: 'criadaEm' | 'prazoLimite' | 'prioridade' | 'concluidaEm';
  dir?: 'asc' | 'desc';
  /** Busca textual (título, descrição e código do modelo), de 2 a 100 caracteres. */
  q?: string;
};

export type AbrirSolicitacaoRequest = {
  titulo: string;
  descricao: string;
  tipo: TipoSolicitacao;
  /** Obrigatório para todos os tipos exceto CRIACAO. */
  modeloId?: string;
  /** Usados apenas quando tipo === 'CRIACAO', em vez de modeloId. */
  modeloCodigo?: string;
  modeloMaquina?: string;
  modeloObservacoes?: string;
};

/** O tipo é imutável após a abertura — não faz parte deste request. */
export type EditarSolicitacaoRequest = {
  titulo: string;
  descricao: string;
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

/** O que a tendência desenha por dia, venha do painel ou do histórico. */
export type PontoDaTendencia = Pick<
  PontoDeSerie,
  'periodo' | 'total' | 'abertas' | 'concluidas' | 'canceladas'
>;

export type DadosDaTendencia = {
  series: PontoDaTendencia[];
  periodoLabel: string;
  /** Verdadeiro quando concluídas contam no dia da conclusão (painel); falso no histórico. */
  porDataDoEvento: boolean;
};

export type HistoricoMetricas = {
  series: PontoDeSerie[];
  slaGlobalMediaHoras: number;
  periodoLabel: string;
};

export type PontoDaSerieDoPainel = {
  /** `dd/MM` por dia, ou `Sem N` por semana quando o período passa de 30 dias. */
  rotulo: string;
  criadas: number;
  concluidas: number;
  canceladas: number;
  abertasAoFimDoDia: number;
  atrasadasAoFimDoDia: number;
};

export type PeriodoAnteriorDoPainel = {
  inicio: string;
  fim: string;
  criadas: number;
  concluidas: number;
  canceladas: number;
  /** Segundos com 1 casa; `null` quando nada foi concluído no período. */
  tempoMedioResolucaoSegundos: number | null;
  serie: PontoDaSerieDoPainel[];
};

export type PeriodoAtualDoPainel = PeriodoAnteriorDoPainel & {
  abertasAgora: number;
  atrasadasAgora: number;
};

/** Resposta de `GET /solicitacoes/metricas/painel`. */
export type PainelPorPeriodo = {
  periodo: PeriodoAtualDoPainel;
  anterior: PeriodoAnteriorDoPainel;
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
  /** Abertas por tipo e por prioridade (inclui `SEM_PRIORIDADE`); somam `solicitacoesAbertas`. */
  emAbertoPorTipo: Record<TipoSolicitacao, number>;
  emAbertoPorPrioridade: Record<PrioridadeSolicitacao | 'SEM_PRIORIDADE', number>;
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

export type PrazoPorPrioridade = {
  prioridade: PrioridadeSolicitacao;
  concluidas: number;
  noPrazo: number;
  /** `null` quando a prioridade não teve concluídas no período. */
  percentualNoPrazo: number | null;
};

export type EtapaDoTempo = {
  amostras: number;
  /** `null` quando nenhuma solicitação passou pela etapa no período. */
  medianaSegundos: number | null;
  mediaSegundos: number | null;
};

export type MaquinaDeGestao = {
  maquina: string;
  abertas: number;
  emAtraso: number;
  tempoMedioResolucaoSegundos: number | null;
};

export type ModeloReincidente = {
  modeloId: string;
  codigo: string;
  versao: number;
  maquina: string | null;
  solicitacoes: number;
};

export type ResponsavelComCarga = { usuarioId: string; nome: string; abertas: number };

/** Resposta de `GET /solicitacoes/metricas/gestao?dias=7|30|90`. */
export type IndicadoresDeGestao = {
  dias: number;
  inicio: string;
  fim: string;
  prazo: {
    concluidasComPrioridade: number;
    noPrazo: number;
    percentualNoPrazo: number | null;
    concluidasSemPrioridade: number;
    porPrioridade: PrazoPorPrioridade[];
  };
  resolucao: {
    concluidas: number;
    medianaSegundos: number | null;
    p90Segundos: number | null;
  };
  backlog: {
    abertas: number;
    menosDeUmDia: number;
    umATresDias: number;
    maisDeTresDias: number;
    semResponsavel: number;
  };
  etapas: {
    esperaAteIniciar: EtapaDoTempo;
    execucao: EtapaDoTempo;
    esperaDeValidacao: EtapaDoTempo;
  };
  devolucao: { enviadasParaValidacao: number; devolucoes: number; taxa: number | null };
  porMaquina: MaquinaDeGestao[];
  reincidentes: ModeloReincidente[];
  carga: { solicitacoesDistintas: number; responsaveis: ResponsavelComCarga[] };
};
