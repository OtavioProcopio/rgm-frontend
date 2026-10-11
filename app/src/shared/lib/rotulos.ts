import type { PerfilUsuario } from '@/features/auth/types/authTypes';
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

/** Nomes amigáveis dos cinco tipos de origem; os tipos cadastrados depois usam o próprio nome. */
export const rotuloDoTipoDeModelo: Record<string, string> = {
  PLACA_ALUMINIO: 'Placa Alumínio',
  MADEIRA_E_3D: 'Madeira e 3D',
  ALUMINIO_E_3D: 'Alumínio e 3D',
  RESINA: 'Resina',
  COQUILHA_ACO: 'Coquilha em Aço',
};

export const rotuloDoTipoDeAtividade: Record<TipoAtividadeSolicitacao, string> = {
  ABERTURA: 'Solicitação aberta',
  ATRIBUICAO: 'Responsável atribuído',
  MUDANCA_STATUS: 'Status alterado',
  COMENTARIO: 'Comentário',
  EVIDENCIA_ADICIONADA: 'Evidência anexada',
};

/** Nome amigável do tipo de modelo; cai no próprio nome quando o tipo foi cadastrado depois. */
export function nomeDoTipoDeModelo(tipo: string): string {
  return rotuloDoTipoDeModelo[tipo] ?? tipo;
}
