import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';

import type { ThemePreference } from '@/shared/lib/theme';

/** As três escolhas de tema, na ordem em que os menus as mostram. */
export const OPCOES_DE_TEMA: { preferencia: ThemePreference; rotulo: string; Icone: LucideIcon }[] =
  [
    { preferencia: 'system', rotulo: 'Sistema', Icone: Monitor },
    { preferencia: 'light', rotulo: 'Claro', Icone: Sun },
    { preferencia: 'dark', rotulo: 'Escuro', Icone: Moon },
  ];
