import { Button } from '@/shared/components/Button/Button';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

export function AdminMaquinasPage() {
  return (
    <section>
      <PageHeader
        title="Máquinas"
        description="O CRUD de máquinas será implementado na próxima etapa."
        actions={<Button disabled>Nova máquina</Button>}
      />
      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
        Esta área será usada para gerenciar máquinas disponíveis para os modelos.
      </div>
    </section>
  );
}
