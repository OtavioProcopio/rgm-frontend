import { Button } from '@/shared/components/Button/Button';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

export function AdminUsuariosPage() {
  return (
    <section>
      <PageHeader
        title="Usuários"
        description="O CRUD de usuários será implementado na próxima etapa."
        actions={<Button disabled>Novo usuário</Button>}
      />
      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
        Esta área será usada para cadastrar operadores, gestores e administradores.
      </div>
    </section>
  );
}
