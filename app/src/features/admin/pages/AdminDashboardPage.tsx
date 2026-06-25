import { PackageSearch, Users } from 'lucide-react';

import { AdminCard } from '@/features/admin/components/AdminCard';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';

const adminCards = [
  {
    title: 'Usuários',
    description: 'Cadastre operadores, gestores e administradores do sistema.',
    href: '/app/admin/usuarios',
    icon: Users,
  },
  {
    title: 'Modelos',
    description: 'Cadastre e organize os modelos usados nas solicitações.',
    href: '/app/admin/modelos',
    icon: PackageSearch,
  },
];

export function AdminDashboardPage() {
  return (
    <section>
      <PageHeader
        title="Painel Administrativo"
        description="Configure a base operacional do sistema RGM."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {adminCards.map((card) => (
          <AdminCard key={card.href} {...card} />
        ))}
      </div>
    </section>
  );
}
