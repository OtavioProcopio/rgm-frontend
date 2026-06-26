import { useModelos } from '@/features/admin/modelos/hooks/useModelos';
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
  const { data: modelosData } = useModelos({ page: 0, size: 100, ativo: true });

  const modeloOptions =
    modelosData?.content.map((m) => ({ value: m.id, label: m.codigo })) ?? [];

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as StatusSolicitacao | '';
    onChange({ ...filters, page: 0, status: value || undefined });
  }

  function handleModeloChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onChange({ ...filters, page: 0, modeloId: e.target.value || undefined });
  }

  return (
    <div className="mb-5 flex flex-wrap gap-4">
      <div className="w-full sm:w-56">
        <Select
          label="Status"
          options={statusOptions}
          placeholder="Todos os status"
          value={filters.status ?? ''}
          onChange={handleStatusChange}
        />
      </div>
      {modeloOptions.length > 0 && (
        <div className="w-full sm:w-64">
          <Select
            label="Modelo"
            options={modeloOptions}
            placeholder="Todos os modelos"
            value={filters.modeloId ?? ''}
            onChange={handleModeloChange}
          />
        </div>
      )}
    </div>
  );
}
