/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MaquinasTable } from '@/features/admin/maquinas/components/MaquinasTable';
import type { Maquina } from '@/features/admin/modelos/types/maquinaTypes';

const ATIVA: Maquina = { id: '1', nome: 'FBOX', ativo: true, criadoEm: '', atualizadoEm: '' };
const INATIVA: Maquina = { id: '2', nome: 'VICK', ativo: false, criadoEm: '', atualizadoEm: '' };
const MAQUINAS = [ATIVA, INATIVA];
const COLUNAS = ['Nome', 'Status', 'Ações'];

const classes = (elemento: Element) => elemento.className.split(' ');

function renderTabela(maquinas: Maquina[] = MAQUINAS) {
  render(
    <MemoryRouter>
      <MaquinasTable
        maquinas={maquinas}
        onAtivar={vi.fn<(maquina: Maquina) => void>()}
        onDesativar={vi.fn<(maquina: Maquina) => void>()}
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

describe('MaquinasTable', () => {
  it('deve mostrar uma linha por máquina na tabela quando recebe máquinas', () => {
    // Act
    renderTabela();

    // Assert
    const nomes = MAQUINAS.map((maquina) => within(tabela()).getByText(maquina.nome).textContent);
    expect(nomes).toEqual(MAQUINAS.map((maquina) => maquina.nome));
  });

  it('deve mostrar um cartão por máquina na lista de tela estreita quando recebe máquinas', () => {
    // Act
    renderTabela();

    // Assert
    const titulos = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(titulos).toEqual(MAQUINAS.map((maquina) => maquina.nome));
  });

  it('deve mostrar a tabela sem linhas de dados quando a lista de máquinas é vazia', () => {
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

  it('deve mostrar o nome da máquina na tabela com o texto principal pelo papel', () => {
    // Act
    renderTabela([ATIVA]);

    // Assert
    expect(classes(within(tabela()).getByText(ATIVA.nome))).toContain('text-fg');
  });

  it('deve mostrar o nome da máquina no cartão com o texto principal pelo papel', () => {
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
    { maquina: ATIVA, rotulo: 'Ativa', variacao: ['bg-success-soft', 'text-success-fg'] },
    { maquina: INATIVA, rotulo: 'Inativa', variacao: ['bg-surface-muted', 'text-fg-muted'] },
  ])(
    'deve mostrar na linha o selo $rotulo na variação do papel quando ativo é $maquina.ativo',
    ({ maquina, rotulo, variacao }) => {
      // Act
      renderTabela([maquina]);

      // Assert
      expect(classes(within(tabela()).getByText(rotulo))).toEqual(expect.arrayContaining(variacao));
    },
  );
});
