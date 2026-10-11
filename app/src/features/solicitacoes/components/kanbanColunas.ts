import type { ColumnConfig } from './KanbanColumn';

export const COLUMNS: ColumnConfig[] = [
  { status: 'A_FAZER', label: 'A Fazer', rotuloCurto: 'A fazer', pontoClass: 'bg-fg-muted' },
  {
    status: 'EM_ANDAMENTO',
    label: 'Em Andamento',
    rotuloCurto: 'Andamento',
    pontoClass: 'bg-info',
  },
  {
    status: 'EM_VALIDACAO',
    label: 'Em Validação',
    rotuloCurto: 'Validação',
    pontoClass: 'bg-warning',
  },
  { status: 'CONCLUIDA', label: 'Concluída', rotuloCurto: 'Concluída', pontoClass: 'bg-success' },
  { status: 'CANCELADA', label: 'Cancelada', rotuloCurto: 'Cancelada', pontoClass: 'bg-danger' },
];
