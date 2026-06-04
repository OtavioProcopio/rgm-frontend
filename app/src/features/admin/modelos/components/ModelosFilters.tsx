type ModelosFiltersProps = {
  codigo?: string;
  ativo?: boolean;
  onCodigoChange: (codigo?: string) => void;
  onAtivoChange: (ativo?: boolean) => void;
};

export function ModelosFilters({
  ativo,
  codigo,
  onAtivoChange,
  onCodigoChange,
}: ModelosFiltersProps) {
  return (
    <div className="mb-4 grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-2">
      <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        <span>Código</span>
        <input
          value={codigo ?? ''}
          onChange={(event) => onCodigoChange(event.target.value || undefined)}
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          placeholder="Buscar por código"
        />
      </label>
      <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        <span>Status</span>
        <select
          value={ativo === undefined ? '' : String(ativo)}
          onChange={(event) =>
            onAtivoChange(event.target.value ? event.target.value === 'true' : undefined)
          }
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
      </label>
    </div>
  );
}
