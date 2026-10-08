import type { TipoModelo } from '@/features/admin/modelos/types/modeloTypes';
import type { PerfilUsuario } from '@/features/auth/types/authTypes';
import type { TipoEvidencia } from '@/features/evidencias/types/evidenciaTypes';
import type {
  PrioridadeSolicitacao,
  StatusSolicitacao,
  TipoAtividadeSolicitacao,
  TipoSolicitacao,
} from '@/features/solicitacoes/types/solicitacaoTypes';

export const rotuloDoStatus: Record<StatusSolicitacao, string> = {
  A_FAZER: 'A fazer',
  EM_ANDAMENTO: 'Em andamento',
  EM_VALIDACAO: 'Em validação',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

export const rotuloDoTipoDeSolicitacao: Record<TipoSolicitacao, string> = {
  REPARO: 'Reparo',
  INSPECAO: 'Inspeção',
  REENGENHARIA: 'Reengenharia',
  CRIACAO: 'Criação de modelo',
};

export const rotuloDaPrioridade: Record<PrioridadeSolicitacao, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
};

export const rotuloDoPerfil: Record<PerfilUsuario, string> = {
  ADMINISTRADOR: 'Administrador',
  GESTOR: 'Gestor',
  OPERADOR: 'Operador',
  EXTERNO: 'Externo',
};

export const rotuloDoTipoDeModelo: Record<TipoModelo, string> = {
  PLACA_ALUMINIO: 'Placa Alumínio',
  MADEIRA_E_3D: 'Madeira e 3D',
  ALUMINIO_E_3D: 'Alumínio e 3D',
  RESINA: 'Resina',
  COQUILHA_ACO: 'Coquilha em Aço',
};

export const rotuloDoTipoDeEvidencia: Record<TipoEvidencia, string> = {
  GERAL: 'Geral',
  ABERTURA: 'Abertura',
  INSTRUCAO_SERVICO: 'Instrução de serviço',
  SERVICO_REALIZADO: 'Serviço realizado',
  CONCLUSAO: 'Conclusão',
  DEVOLUCAO: 'Devolução',
};

export const rotuloDoTipoDeAtividade: Record<TipoAtividadeSolicitacao, string> = {
  ABERTURA: 'Solicitação aberta',
  ATRIBUICAO: 'Responsável atribuído',
  MUDANCA_STATUS: 'Status alterado',
  COMENTARIO: 'Comentário',
  EVIDENCIA_ADICIONADA: 'Evidência anexada',
};
