import type { ReactNode } from 'react';
import { Ellipsis } from 'lucide-react';

import { Menu, MenuItem, MenuLink, MenuSeparator } from '@/shared/components/Menu/Menu';

export type AcaoDoMenu = {
  rotulo: string;
  icone?: ReactNode;
  onSelect?: () => void;
  to?: string;
  perigo?: boolean;
  desabilitada?: boolean;
};

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  maisAcoes?: AcaoDoMenu[];
};

function ItemDaAcao({ acao }: { acao: AcaoDoMenu }) {
  if (acao.to) {
    return (
      <MenuLink to={acao.to} icone={acao.icone}>
        {acao.rotulo}
      </MenuLink>
    );
  }
  return (
    <MenuItem
      onSelect={acao.onSelect}
      icone={acao.icone}
      perigo={acao.perigo}
      desabilitado={acao.desabilitada}
    >
      {acao.rotulo}
    </MenuItem>
  );
}

function MenuDeAcoes({ acoes }: { acoes: AcaoDoMenu[] }) {
  const comuns = acoes.filter((acao) => !acao.perigo);
  const perigosas = acoes.filter((acao) => acao.perigo);

  return (
    <Menu
      rotuloDoMenu="Mais ações"
      botao={
        <>
          <Ellipsis aria-hidden="true" size={16} />
          Mais ações
        </>
      }
    >
      {comuns.map((acao) => (
        <ItemDaAcao key={acao.rotulo} acao={acao} />
      ))}
      {comuns.length > 0 && perigosas.length > 0 ? <MenuSeparator /> : null}
      {perigosas.map((acao) => (
        <ItemDaAcao key={acao.rotulo} acao={acao} />
      ))}
    </Menu>
  );
}

export function PageHeader({ title, description, actions, maisAcoes = [] }: PageHeaderProps) {
  const temMaisAcoes = maisAcoes.length > 0;

  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-fg">{title}</h1>
        {description ? <p className="mt-1 text-sm text-fg-muted">{description}</p> : null}
      </div>
      {actions || temMaisAcoes ? (
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          {temMaisAcoes ? <MenuDeAcoes acoes={maisAcoes} /> : null}
        </div>
      ) : null}
    </header>
  );
}
