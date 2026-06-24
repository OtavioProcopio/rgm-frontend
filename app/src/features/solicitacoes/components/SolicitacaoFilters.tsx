import { Select } from '@/shared/components/Select/Select';

import type { SolicitacoesFilters, StatusSolicitacao } from '../types/solicitacaoTypes';

type Props = {
  filters: SolicitacoesFilters;
  onChange: (filters: SolicitacoesFilters) => void;
};

const statusOptions = [
  { value: 'A_FAZER', label: 'A fazer' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'EM_VALIDACAO', label: 'Em validação' },
  { value: 'CONCLUIDA', label: 'Concluída' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

export function SolicitacaoFilters({ filters, onChange }: Props) {
  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as StatusSolicitacao | '';
    onChange({
      ...filters,
      page: 0,
      status: value || undefined,
    });
  }

  return (
    <div className="mb-5 flex flex-wrap gap-4">
      <div className="w-full sm:w-56">
        <Select
          label="Status"
          options={statusOptions}
          placeholder="Todos"
          value={filters.status ?? ''}
          onChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
