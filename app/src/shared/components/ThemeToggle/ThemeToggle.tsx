import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';

import { Menu, MenuItem } from '@/shared/components/Menu/Menu';
import { useTema } from '@/shared/hooks/useTema';
import type { ThemePreference } from '@/shared/lib/theme';

const OPCOES: { preferencia: ThemePreference; rotulo: string; Icone: LucideIcon }[] = [
  { preferencia: 'system', rotulo: 'Sistema', Icone: Monitor },
  { preferencia: 'light', rotulo: 'Claro', Icone: Sun },
  { preferencia: 'dark', rotulo: 'Escuro', Icone: Moon },
];

const CLASSE_DO_BOTAO = 'w-10 px-0 pointer-coarse:h-11 pointer-coarse:w-11';

export function ThemeToggle({ className }: { className?: string }) {
  const { preferencia, escolher } = useTema();
  const ativa = OPCOES.find((opcao) => opcao.preferencia === preferencia)!;
  const rotuloDoBotao = `Tema: ${ativa.rotulo}`;

  return (
    <Menu
      rotuloDoBotao={rotuloDoBotao}
      titulo={rotuloDoBotao}
      rotuloDoMenu="Tema"
      botao={<ativa.Icone aria-hidden="true" size={18} />}
      classeDoBotao={[CLASSE_DO_BOTAO, className].filter(Boolean).join(' ')}
    >
      {OPCOES.map(({ preferencia: valor, rotulo, Icone }) => (
        <MenuItem
          key={valor}
          escolhaUnica
          marcado={valor === preferencia}
          icone={<Icone aria-hidden="true" size={16} />}
          onSelect={() => escolher(valor)}
        >
          {rotulo}
        </MenuItem>
      ))}
    </Menu>
  );
}
