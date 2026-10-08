import type { ComponentType } from 'react';
import { Link } from 'react-router';

import { Card } from '@/shared/components/Card/Card';

type AdminCardProps = {
  title: string;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string; size?: number }>;
};

export function AdminCard({ description, href, icon: Icon, title }: AdminCardProps) {
  return (
    <Card className="transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md">
      <Link to={href} className="block h-full rounded-xl p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-surface-muted text-accent">
          <Icon size={22} />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-fg">{title}</h2>
        <p className="mt-2 min-h-12 text-sm leading-6 text-fg-muted">{description}</p>
        <span className="mt-5 inline-flex text-sm font-medium text-accent">Acessar</span>
      </Link>
    </Card>
  );
}
