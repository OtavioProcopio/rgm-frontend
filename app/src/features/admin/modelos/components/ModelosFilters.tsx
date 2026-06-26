import { Input } from '@/shared/components/Input/Input';
import { Select } from '@/shared/components/Select/Select';

type ModelosFiltersProps = {
  codigo?: string;
  ativo?: boolean;
  onCodigoChange: (codigo?: string) => void;
  onAtivoChange: (ativo?: boolean) => void;
};

const ativoOptions = [
  { value: 'true', label: 'Ativos' },
  { value: 'false', label: 'Inativos' },
];

export function ModelosFilters({
  ativo,
  codigo,
  onAtivoChange,
  onCodigoChange,
}: ModelosFiltersProps) {
  return (
    <div className="mb-4 grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-2">
      <Input
        label="Código"
        value={codigo ?? ''}
        onChange={(e) => onCodigoChange(e.target.value || undefined)}
        placeholder="Buscar por código"
      />
      <Select
        label="Status"
        options={ativoOptions}
        placeholder="Todos"
        value={ativo === undefined ? '' : String(ativo)}
        onChange={(e) => onAtivoChange(e.target.value ? e.target.value === 'true' : undefined)}
      />
    </div>
  );
}
