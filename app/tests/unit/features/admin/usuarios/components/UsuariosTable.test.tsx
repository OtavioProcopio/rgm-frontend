/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { UsuariosTable } from '@/features/admin/usuarios/components/UsuariosTable';

vi.mock('@/features/admin/usuarios/components/UsuarioActionsMenu', () => ({
  UsuarioActionsMenu: () => <div data-testid="actions-menu" />,
}));
vi.mock('@/features/admin/usuarios/components/UsuarioPerfilBadge', () => ({
  UsuarioPerfilBadge: ({ perfil }: { perfil: string }) => <span>{perfil}</span>,
}));
vi.mock('@/features/admin/usuarios/components/UsuarioStatusBadge', () => ({
  UsuarioStatusBadge: ({ ativo }: { ativo: boolean }) => <span>{ativo ? 'Ativo' : 'Inativo'}</span>,
}));

const usuario = {
  id: '1',
  nome: 'João Silva',
  email: 'j@j.com',
  perfil: 'OPERADOR' as const,
  ativo: true,
  criadoEm: '2024-01-01T00:00:00Z',
  atualizadoEm: '2024-01-01T00:00:00Z',
};
const COLUNAS = ['Nome', 'E-mail', 'Perfil', 'Status', 'Criado em', 'Ações'];
const MOLDURA_QUE_ROLA = ['overflow-x-auto', 'border', 'border-line'];
const CABECALHO = ['bg-surface-muted', 'text-fg-muted'];
const CORPO = ['divide-line', 'bg-surface'];
const TEXTO_PRINCIPAL = 'text-fg';
const TEXTO_SECUNDARIO = 'text-fg-muted';

const classes = (elemento: Element) => elemento.className.split(' ');

/** Mostra a lista com um usuário e devolve a tabela (a versão de tela larga). */
function abrirTabela() {
  const { container } = render(
    <UsuariosTable
      usuarios={[usuario]}
      onAtivar={vi.fn()}
      onDesativar={vi.fn()}
      onExcluir={vi.fn()}
    />,
  );
  return container.querySelector('table')!;
}

afterEach(cleanup);

describe('UsuariosTable na lista de tela estreita', () => {
  it('deve manter a altura da linha do perfil no cartão do usuário quando o selo é mais baixo', () => {
    // Arrange
    const alturaDoSeloAntigo = 'min-h-6';

    // Act
    const { container } = render(
      <UsuariosTable
        usuarios={[usuario]}
        onAtivar={vi.fn()}
        onDesativar={vi.fn()}
        onExcluir={vi.fn()}
      />,
    );

    // Assert
    const cartao = container.querySelector('article')!;
    const linhaDoPerfil = within(cartao).getByText(usuario.perfil).parentElement!;
    expect(classes(linhaDoPerfil)).toContain(alturaDoSeloAntigo);
  });
});

describe('UsuariosTable', () => {
  it('renders usuario items', () => {
    const { container } = render(
      <UsuariosTable
        usuarios={[usuario]}
        onAtivar={vi.fn()}
        onDesativar={vi.fn()}
        onExcluir={vi.fn()}
      />,
    );
    expect(within(container).getAllByText('João Silva').length).toBeGreaterThan(0);
  });

  it('renders empty when no usuarios', () => {
    const { container } = render(
      <UsuariosTable usuarios={[]} onAtivar={vi.fn()} onDesativar={vi.fn()} onExcluir={vi.fn()} />,
    );
    expect(within(container).queryByText('João Silva')).toBeNull();
  });
});

describe('UsuariosTable — peça de tabela', () => {
  it('deve rolar na horizontal dentro da moldura com borda quando a tabela é exibida', () => {
    // Act
    const moldura = abrirTabela().parentElement!;

    // Assert
    expect(classes(moldura)).toEqual(expect.arrayContaining(MOLDURA_QUE_ROLA));
  });

  it('deve usar a superfície suave e o texto secundário quando o cabeçalho é exibido', () => {
    // Act
    const cabecalho = abrirTabela().querySelector('thead')!;

    // Assert
    expect(classes(cabecalho)).toEqual(expect.arrayContaining(CABECALHO));
  });

  it('deve usar a superfície e a divisória do tema quando o corpo é exibido', () => {
    // Act
    const corpo = abrirTabela().querySelector('tbody')!;

    // Assert
    expect(classes(corpo)).toEqual(expect.arrayContaining(CORPO));
  });

  it.each(COLUNAS)('deve marcar o cabeçalho %s como cabeçalho de coluna', (coluna) => {
    // Act
    const celula = within(abrirTabela()).getByRole('columnheader', { name: coluna });

    // Assert
    expect(celula.getAttribute('scope')).toBe('col');
  });

  it('deve usar o texto principal quando a célula mostra o nome', () => {
    // Act
    const celula = within(abrirTabela()).getByText(usuario.nome);

    // Assert
    expect(classes(celula)).toContain(TEXTO_PRINCIPAL);
  });

  it('deve usar o texto secundário quando a célula mostra o e-mail', () => {
    // Act
    const celula = within(abrirTabela()).getByText(usuario.email);

    // Assert
    expect(classes(celula)).toContain(TEXTO_SECUNDARIO);
  });
});
