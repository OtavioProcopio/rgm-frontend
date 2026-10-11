/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TiposModeloTable } from '@/features/admin/tiposModelo/components/TiposModeloTable';
import type { TipoDeModelo } from '@/features/admin/modelos/types/tipoModeloTypes';

const ATIVA: TipoDeModelo = { id: '1', nome: 'FBOX', ativo: true, criadoEm: '', atualizadoEm: '' };
const INATIVA: TipoDeModelo = {
  id: '2',
  nome: 'VICK',
  ativo: false,
  criadoEm: '',
  atualizadoEm: '',
};
const MAQUINAS = [ATIVA, INATIVA];
const COLUNAS = ['Nome', 'Status', 'Ações'];

const classes = (elemento: Element) => elemento.className.split(' ');

function renderTabela(tiposModelo: TipoDeModelo[] = MAQUINAS) {
  render(
    <MemoryRouter>
      <TiposModeloTable
        tiposModelo={tiposModelo}
        onAtivar={vi.fn<(tipoModelo: TipoDeModelo) => void>()}
        onDesativar={vi.fn<(tipoModelo: TipoDeModelo) => void>()}
      />
    </MemoryRouter>,
  );
}

const tabela = () => screen.getByRole('table');
const grupoDeLinhas = (etiqueta: string) =>
  within(tabela())
    .getAllByRole('rowgroup')
    .filter((grupo) => grupo.tagName === etiqueta)[0];

afterEach(cleanup);

describe('TiposModeloTable', () => {
  it('deve mostrar uma linha por tipo de modelo na tabela quando recebe tipos de modelo', () => {
    // Act
    renderTabela();

    // Assert
    const nomes = MAQUINAS.map(
      (tipoModelo) => within(tabela()).getByText(tipoModelo.nome).textContent,
    );
    expect(nomes).toEqual(MAQUINAS.map((tipoModelo) => tipoModelo.nome));
  });

  it('deve mostrar um cartão por tipo de modelo na lista de tela estreita quando recebe tipos de modelo', () => {
    // Act
    renderTabela();

    // Assert
    const titulos = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(titulos).toEqual(MAQUINAS.map((tipoModelo) => tipoModelo.nome));
  });

  it('deve mostrar a tabela sem linhas de dados quando a lista de tipos de modelo é vazia', () => {
    // Arrange
    const soCabecalho = 1;

    // Act
    renderTabela([]);

    // Assert
    expect(within(tabela()).getAllByRole('row')).toHaveLength(soCabecalho);
  });

  it('deve pôr a tabela dentro da moldura que rola na horizontal, com borda pelo papel', () => {
    // Arrange
    const moldura = ['overflow-x-auto', 'border', 'border-line'];

    // Act
    renderTabela();

    // Assert
    expect(classes(tabela().parentElement as HTMLElement)).toEqual(expect.arrayContaining(moldura));
  });

  it('deve separar as partes da tabela com a divisória pelo papel', () => {
    // Act
    renderTabela();

    // Assert
    expect(classes(tabela())).toEqual(expect.arrayContaining(['divide-y', 'divide-line']));
  });

  it('deve ter o cabeçalho com superfície suave e texto secundário pelos papéis', () => {
    // Arrange
    const cabecalho = ['bg-surface-muted', 'text-fg-muted'];

    // Act
    renderTabela();

    // Assert
    expect(classes(grupoDeLinhas('THEAD'))).toEqual(expect.arrayContaining(cabecalho));
  });

  it('deve ter o corpo com superfície e divisória pelos papéis', () => {
    // Arrange
    const corpo = ['divide-line', 'bg-surface'];

    // Act
    renderTabela();

    // Assert
    expect(classes(grupoDeLinhas('TBODY'))).toEqual(expect.arrayContaining(corpo));
  });

  it('deve mostrar as colunas Nome, Status e Ações como cabeçalhos de coluna', () => {
    // Act
    renderTabela();

    // Assert
    const cabecalhos = within(tabela()).getAllByRole('columnheader');
    expect(cabecalhos.map((th) => th.textContent)).toEqual(COLUNAS);
  });

  it('deve marcar cada cabeçalho com o escopo de coluna', () => {
    // Act
    renderTabela();

    // Assert
    const escopos = within(tabela())
      .getAllByRole('columnheader')
      .map((th) => th.getAttribute('scope'));
    expect(escopos).toEqual(COLUNAS.map(() => 'col'));
  });

  it('deve mostrar o nome do tipo de modelo na tabela com o texto principal pelo papel', () => {
    // Act
    renderTabela([ATIVA]);

    // Assert
    expect(classes(within(tabela()).getByText(ATIVA.nome))).toContain('text-fg');
  });

  it('deve mostrar o nome do tipo de modelo no cartão com o texto principal pelo papel', () => {
    // Act
    renderTabela([ATIVA]);

    // Assert
    expect(classes(screen.getByRole('heading', { name: ATIVA.nome }))).toContain('text-fg');
  });

  it('deve ter o cartão de tela estreita com superfície e borda pelos papéis', () => {
    // Arrange
    const superficie = ['border', 'border-line', 'bg-surface'];

    // Act
    renderTabela([ATIVA]);

    // Assert
    expect(classes(screen.getByRole('article'))).toEqual(expect.arrayContaining(superficie));
  });

  it.each([
    { tipoModelo: ATIVA, rotulo: 'Ativo', variacao: ['bg-success-soft', 'text-success-fg'] },
    { tipoModelo: INATIVA, rotulo: 'Inativo', variacao: ['bg-surface-muted', 'text-fg-muted'] },
  ])(
    'deve mostrar na linha o selo $rotulo na variação do papel quando ativo é $tipoModelo.ativo',
    ({ tipoModelo, rotulo, variacao }) => {
      // Act
      renderTabela([tipoModelo]);

      // Assert
      expect(classes(within(tabela()).getByText(rotulo))).toEqual(expect.arrayContaining(variacao));
    },
  );
});
