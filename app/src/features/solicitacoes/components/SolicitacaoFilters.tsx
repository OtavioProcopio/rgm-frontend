import { useMaquinaOptions } from '@/features/admin/modelos/hooks/useMaquinaOptions';
import { useModelos } from '@/features/admin/modelos/hooks/useModelos';
import { Select } from '@/shared/components/Select/Select';
import { Input } from '@/shared/components/Input/Input';

import type {
  PrioridadeSolicitacao,
  SolicitacoesFilters,
  StatusSolicitacao,
  TipoSolicitacao,
} from '../types/solicitacaoTypes';

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

const tipoOptions = [
  { value: 'REPARO', label: 'Reparo' },
  { value: 'INSPECAO', label: 'Inspeção' },
  { value: 'REENGENHARIA', label: 'Reengenharia' },
  { value: 'CRIACAO', label: 'Criação de modelo' },
];

const prioridadeOptions = [
  { value: 'BAIXA', label: 'Baixa' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
];

export function SolicitacaoFilters({ filters, onChange }: Props) {
  const { data: modelosData } = useModelos({ page: 0, size: 100, ativo: true });
  const { options: maquinaOptions } = useMaquinaOptions(filters.maquina);

  const modeloOptions =
    modelosData?.content.map((m) => ({ value: m.id, label: m.codigo })) ?? [];

  function handleMaquinaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onChange({ ...filters, page: 0, maquina: e.target.value || undefined });
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as StatusSolicitacao | '';
    onChange({ ...filters, page: 0, status: value || undefined });
  }

  function handleModeloChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onChange({ ...filters, page: 0, modeloId: e.target.value || undefined });
  }

  function handleTipoChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as TipoSolicitacao | '';
    onChange({ ...filters, page: 0, tipo: value || undefined });
  }

  function handlePrioridadeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as PrioridadeSolicitacao | '';
    onChange({ ...filters, page: 0, prioridade: value || undefined });
  }

  function handleInicioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange({
      ...filters,
      page: 0,
      criadaEmInicio: val ? `${val}T00:00:00Z` : undefined,
    });
  }

  function handleFimChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange({
      ...filters,
      page: 0,
      criadaEmFim: val ? `${val}T23:59:59Z` : undefined,
    });
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
      <div className="w-full sm:w-48">
        <Select
          label="Tipo"
          options={tipoOptions}
          placeholder="Todos os tipos"
          value={filters.tipo ?? ''}
          onChange={handleTipoChange}
        />
      </div>
      <div className="w-full sm:w-48">
        <Select
          label="Prioridade"
          options={prioridadeOptions}
          placeholder="Todas as prioridades"
          value={filters.prioridade ?? ''}
          onChange={handlePrioridadeChange}
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
      {maquinaOptions.length > 0 && (
        <div className="w-full sm:w-56">
          <Select
            label="Máquina"
            options={maquinaOptions}
            placeholder="Todas as máquinas"
            value={filters.maquina ?? ''}
            onChange={handleMaquinaChange}
          />
        </div>
      )}
      <div className="w-full sm:w-44">
        <Input
          type="date"
          label="Criada a partir de"
          value={filters.criadaEmInicio ? filters.criadaEmInicio.split('T')[0] : ''}
          onChange={handleInicioChange}
        />
      </div>
      <div className="w-full sm:w-44">
        <Input
          type="date"
          label="Criada até"
          value={filters.criadaEmFim ? filters.criadaEmFim.split('T')[0] : ''}
          onChange={handleFimChange}
        />
      </div>
    </div>
  );
}
