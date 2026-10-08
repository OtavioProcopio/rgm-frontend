import { ChevronDown, LogOut, User } from 'lucide-react';

import { useAuth } from '@/app/providers/authContext';
import type { AuthUser } from '@/features/auth/types/authTypes';
import { Menu, MenuItem, MenuLink, MenuSeparator, MenuTitulo } from '@/shared/components/Menu/Menu';
import { OPCOES_DE_TEMA } from '@/shared/components/ThemeToggle/opcoesDeTema';
import { useTema } from '@/shared/hooks/useTema';
import { rotuloDoPerfil } from '@/shared/lib/rotulos';

function BotaoDoUsuario({ nome }: { nome?: string }) {
  return (
    <>
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-info-soft text-info-fg">
        <User aria-hidden="true" size={16} />
      </span>
      {nome ? <span className="hidden sm:inline">{nome}</span> : null}
      <ChevronDown aria-hidden="true" size={16} />
    </>
  );
}

function DadosDoUsuario({ user }: { user: AuthUser }) {
  return (
    <>
      <MenuTitulo>
        <div className="font-semibold">{user.nome}</div>
        <div className="text-fg-muted">{rotuloDoPerfil[user.perfil]}</div>
      </MenuTitulo>
      <MenuSeparator />
      <MenuLink to="/app/perfil" icone={<User aria-hidden="true" size={16} />}>
        Meu perfil
      </MenuLink>
    </>
  );
}

function OpcoesDeTema() {
  const { preferencia, escolher } = useTema();

  return (
    <>
      <MenuTitulo>
        <span className="text-xs text-fg-muted">Tema</span>
      </MenuTitulo>
      {OPCOES_DE_TEMA.map(({ preferencia: valor, rotulo, Icone }) => (
        <MenuItem
          key={valor}
          escolhaUnica
          marcado={preferencia === valor}
          icone={<Icone aria-hidden="true" size={16} />}
          onSelect={() => escolher(valor)}
        >
          {rotulo}
        </MenuItem>
      ))}
    </>
  );
}

export function MenuDoUsuario() {
  const { user, logout } = useAuth();
  const rotuloDoBotao = user ? `Menu do usuário: ${user.nome}` : 'Menu do usuário';

  return (
    <Menu
      rotuloDoMenu="Menu do usuário"
      rotuloDoBotao={rotuloDoBotao}
      botao={<BotaoDoUsuario nome={user?.nome} />}
    >
      {user ? <DadosDoUsuario user={user} /> : null}
      <OpcoesDeTema />
      <MenuSeparator />
      <MenuItem icone={<LogOut aria-hidden="true" size={16} />} onSelect={logout}>
        Sair
      </MenuItem>
    </Menu>
  );
}
