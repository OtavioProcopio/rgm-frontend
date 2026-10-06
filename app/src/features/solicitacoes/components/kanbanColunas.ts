import type { StatusSolicitacao } from '../types/solicitacaoTypes';
import type { ColumnConfig } from './KanbanColumn';

export const COLUMNS: ColumnConfig[] = [
  {
    status: 'A_FAZER',
    label: 'A Fazer',
    headerClass: 'bg-slate-600 text-white',
    accentClass: 'bg-slate-50 dark:bg-slate-900/40',
  },
  {
    status: 'EM_ANDAMENTO',
    label: 'Em Andamento',
    headerClass: 'bg-sky-600 text-white',
    accentClass: 'bg-sky-50/60 dark:bg-sky-950/20',
  },
  {
    status: 'EM_VALIDACAO',
    label: 'Em Validação',
    headerClass: 'bg-amber-500 text-white',
    accentClass: 'bg-amber-50/60 dark:bg-amber-950/20',
  },
  {
    status: 'CONCLUIDA',
    label: 'Concluída',
    headerClass: 'bg-emerald-600 text-white',
    accentClass: 'bg-emerald-50/60 dark:bg-emerald-950/20',
  },
  {
    status: 'CANCELADA',
    label: 'Cancelada',
    headerClass: 'bg-red-600 text-white',
    accentClass: 'bg-red-50/60 dark:bg-red-950/20',
  },
];

export const TAB_ACCENT: Record<StatusSolicitacao, string> = {
  A_FAZER: 'border-b-slate-600 text-slate-700 dark:text-slate-200',
  EM_ANDAMENTO: 'border-b-sky-600 text-sky-700 dark:text-sky-300',
  EM_VALIDACAO: 'border-b-amber-500 text-amber-700 dark:text-amber-300',
  CONCLUIDA: 'border-b-emerald-600 text-emerald-700 dark:text-emerald-300',
  CANCELADA: 'border-b-red-600 text-red-700 dark:text-red-300',
};
