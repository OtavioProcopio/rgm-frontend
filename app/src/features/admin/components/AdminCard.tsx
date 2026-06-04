import type { ComponentType } from 'react';
import { Link } from 'react-router';

type AdminCardProps = {
  title: string;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string; size?: number }>;
};

export function AdminCard({ description, href, icon: Icon, title }: AdminCardProps) {
  return (
    <Link
      to={href}
      className="group rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-700"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-sky-50 text-sky-700 transition group-hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300 dark:group-hover:bg-sky-900">
        <Icon size={22} />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {description}
      </p>
      <span className="mt-5 inline-flex text-sm font-medium text-sky-700 dark:text-sky-300">
        Acessar
      </span>
    </Link>
  );
}
