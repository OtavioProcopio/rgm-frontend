/**
 * @vitest-environment jsdom
 */
import type { ReactNode } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PageHeader, type AcaoDoMenu } from '@/shared/components/PageHeader/PageHeader';

afterEach(cleanup);

describe('PageHeader', () => {
  it('renders the title', () => {
    const { container } = render(<PageHeader title="Usuários" />);
    expect(within(container).getByText('Usuários')).toBeDefined();
  });

  it('renders description when provided', () => {
    const { container } = render(<PageHeader title="Usuários" description="Gerencie usuários." />);
    expect(within(container).getByText('Gerencie usuários.')).toBeDefined();
  });

  it('does not render description element when omitted', () => {
    const { container } = render(<PageHeader title="Usuários" />);
    expect(container.querySelector('p')).toBeNull();
  });

  it('renders actions slot when provided', () => {
    const { container } = render(<PageHeader title="Usuários" actions={<button>Novo</button>} />);
    expect(within(container).getByRole('button', { name: 'Novo' })).toBeDefined();
  });

  it('does not render actions wrapper when omitted', () => {
    const { container } = render(<PageHeader title="Usuários" />);
    expect(within(container).queryByRole('button')).toBeNull();
  });
});

const BOTAO = { name: 'Mais ações' };

function renderizar(maisAcoes?: AcaoDoMenu[], actions?: ReactNode): void {
  render(
    <MemoryRouter>
      <PageHeader title="Usuários" actions={actions} maisAcoes={maisAcoes} />
    </MemoryRouter>,
  );
}

function abrir(): void {
  fireEvent.click(screen.getByRole('button', BOTAO));
}

describe('PageHeader maisAcoes', () => {
  it('deve omitir o botão Mais ações quando maisAcoes não foi informado', () => {
    // Arrange
    renderizar();

    // Act
    const botao = screen.queryByRole('button', BOTAO);

    // Assert
    expect(botao).toBeNull();
  });

  it('deve omitir o botão Mais ações quando a lista está vazia', () => {
    // Arrange
    renderizar([]);

    // Act
    const botao = screen.queryByRole('button', BOTAO);

    // Assert
    expect(botao).toBeNull();
  });

  it('deve mostrar o botão Mais ações quando há uma ação', () => {
    // Arrange
    renderizar([{ rotulo: 'Exportar', onSelect: vi.fn<() => void>() }]);

    // Act
    const botao = screen.getByRole('button', BOTAO);

    // Assert
    expect(botao.textContent).toContain('Mais ações');
  });

  it('deve listar as ações com texto e ícone quando o menu abre', () => {
    // Arrange
    renderizar([
      { rotulo: 'Exportar', icone: <i data-testid="icone-exportar" /> },
      { rotulo: 'Importar' },
    ]);

    // Act
    abrir();

    // Assert
    const itens = screen.getAllByRole('menuitem').map((i) => i.textContent);
    expect(itens).toEqual(['Exportar', 'Importar']);
    expect(screen.getByTestId('icone-exportar')).toBeDefined();
  });

  it('deve deixar a ação de perigo por último depois de um separador quando ela vem antes', () => {
    // Arrange
    renderizar([
      { rotulo: 'Excluir tudo', perigo: true },
      { rotulo: 'Exportar' },
      { rotulo: 'Importar' },
    ]);

    // Act
    abrir();

    // Assert
    const menu = screen.getByRole('menu', { name: 'Mais ações' });
    const filhos = Array.from(menu.children).map((c) => c.getAttribute('role'));
    expect(filhos).toEqual(['menuitem', 'menuitem', 'separator', 'menuitem']);
    expect(menu.lastElementChild?.textContent).toBe('Excluir tudo');
  });

  it('deve omitir o separador quando só há ações de perigo', () => {
    // Arrange
    renderizar([{ rotulo: 'Excluir', perigo: true }]);

    // Act
    abrir();

    // Assert
    expect(screen.queryByRole('separator')).toBeNull();
  });

  it('deve chamar onSelect uma vez e fechar o menu quando a ação é escolhida', () => {
    // Arrange
    const onSelect = vi.fn<() => void>();
    renderizar([{ rotulo: 'Exportar', onSelect }]);
    abrir();

    // Act
    fireEvent.click(screen.getByRole('menuitem', { name: 'Exportar' }));

    // Assert
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith();
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('deve apontar o link para o destino quando a ação tem to', () => {
    // Arrange
    renderizar([{ rotulo: 'Histórico', to: '/historico' }]);

    // Act
    abrir();

    // Assert
    const link = screen.getByRole('menuitem', { name: 'Histórico' });
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/historico');
  });

  it('deve manter a ação desabilitada sem executar quando ela é escolhida', () => {
    // Arrange
    const onSelect = vi.fn<() => void>();
    renderizar([{ rotulo: 'Exportar', onSelect, desabilitada: true }]);
    abrir();

    // Act
    const item = screen.getByRole('menuitem', { name: 'Exportar' });
    fireEvent.click(item);

    // Assert
    expect((item as HTMLButtonElement).disabled).toBe(true);
    expect(onSelect).toHaveBeenCalledTimes(0);
  });

  it('deve posicionar Mais ações depois da ação principal quando ambas existem', () => {
    // Arrange
    renderizar([{ rotulo: 'Exportar' }], <button>Novo</button>);

    // Act
    const [primeiro, segundo] = screen.getAllByRole('button');

    // Assert
    expect(primeiro.textContent).toBe('Novo');
    expect(segundo.textContent).toContain('Mais ações');
  });
});
