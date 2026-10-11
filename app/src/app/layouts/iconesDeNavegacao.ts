import {
  BarChart2,
  LayoutDashboard,
  PackageSearch,
  Ticket,
  Users,
  type LucideIcon,
} from 'lucide-react';

import type { DestinoDeNavegacao } from '@/shared/lib/navegacao';

/** Ícone de cada destino de navegação; a barra lateral e a barra de abas leem daqui. */
export const ICONES_DE_NAVEGACAO: Record<DestinoDeNavegacao['id'], LucideIcon> = {
  dashboard: BarChart2,
  solicitacoes: Ticket,
  modelos: PackageSearch,
  admin: LayoutDashboard,
  usuarios: Users,
};
