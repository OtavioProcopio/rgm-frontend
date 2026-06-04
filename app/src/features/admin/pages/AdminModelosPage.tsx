import { Button } from '@/shared/components/Button/Button';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

export function AdminModelosPage() {
  return (
    <section>
      <PageHeader
        title="Modelos"
        description="O CRUD de modelos será implementado na próxima etapa."
        actions={<Button disabled>Novo modelo</Button>}
      />
      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
        Esta área será usada para cadastrar e organizar modelos usados nas solicitações.
      </div>
    </section>
  );
}
