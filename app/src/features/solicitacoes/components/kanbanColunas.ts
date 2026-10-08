import type { ColumnConfig } from './KanbanColumn';

export const COLUMNS: ColumnConfig[] = [
  { status: 'A_FAZER', label: 'A Fazer', pontoClass: 'bg-fg-muted' },
  { status: 'EM_ANDAMENTO', label: 'Em Andamento', pontoClass: 'bg-info' },
  { status: 'EM_VALIDACAO', label: 'Em Validação', pontoClass: 'bg-warning' },
  { status: 'CONCLUIDA', label: 'Concluída', pontoClass: 'bg-success' },
  { status: 'CANCELADA', label: 'Cancelada', pontoClass: 'bg-danger' },
];
