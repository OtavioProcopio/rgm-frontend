/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@/shared/components/Table/Table';

const COLUNAS = ['Nome', 'Perfil'];
const LINHAS = [
  ['Ana', 'Gestor'],
  ['Bruno', 'Operador'],
];
const ESPACO_DA_CELULA = ['px-4', 'py-3'];

function renderTabela(className?: string) {
  render(
    <Table className={className}>
      <TableHead>
        <TableRow>
          {COLUNAS.map((coluna) => (
            <TableHeaderCell key={coluna}>{coluna}</TableHeaderCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {LINHAS.map((linha) => (
          <TableRow key={linha[0]}>
            {linha.map((valor) => (
              <TableCell key={valor}>{valor}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>,
  );
}

const tabela = () => screen.getByRole('table');
const classes = (elemento: Element) => elemento.className.split(' ');

afterEach(cleanup);

describe('Table', () => {
  it('deve ser uma tabela', () => {
    // Act
    renderTabela();

    // Assert
    expect(tabela().tagName).toBe('TABLE');
  });

  it('deve ter um cabeçalho de coluna para cada coluna', () => {
    // Act
    renderTabela();

    // Assert
    expect(screen.getAllByRole('columnheader').map((celula) => celula.textContent)).toEqual(
      COLUNAS,
    );
  });

  it('deve ter uma linha para o cabeçalho e uma para cada item', () => {
    // Act
    renderTabela();

    // Assert
    expect(screen.getAllByRole('row')).toHaveLength(LINHAS.length + 1);
  });

  it('deve mostrar o conteúdo de cada célula', () => {
    // Act
    renderTabela();

    // Assert
    expect(screen.getAllByRole('cell').map((celula) => celula.textContent)).toEqual(LINHAS.flat());
  });

  it('deve rolar na horizontal dentro da moldura', () => {
    // Act
    renderTabela();

    // Assert
    expect(classes(tabela().parentElement!)).toContain('overflow-x-auto');
  });

  it('deve ter a moldura com a borda do papel', () => {
    // Act
    renderTabela();

    // Assert
    expect(classes(tabela().parentElement!)).toEqual(
      expect.arrayContaining(['border', 'border-line']),
    );
  });

  it('deve ter o cabeçalho com a superfície suave', () => {
    // Act
    renderTabela();

    // Assert
    expect(classes(tabela().querySelector('thead')!)).toEqual(
      expect.arrayContaining(['bg-surface-muted', 'text-fg-muted']),
    );
  });

  it('deve aceitar classes extras no cabeçalho quando className é informado', () => {
    // Arrange
    const extra = '[&_th]:py-3.5';

    // Act
    render(
      <table>
        <TableHead className={extra}>
          <tr>
            <th>Nome</th>
          </tr>
        </TableHead>
      </table>,
    );

    // Assert
    expect(classes(screen.getAllByRole('rowgroup')[0])).toEqual(
      expect.arrayContaining(['bg-surface-muted', extra]),
    );
  });

  it('deve separar o cabeçalho do corpo pelo papel de borda', () => {
    // Act
    renderTabela();

    // Assert
    expect(classes(tabela())).toEqual(expect.arrayContaining(['divide-y', 'divide-line']));
  });

  it('deve separar as linhas pelo papel de borda', () => {
    // Act
    renderTabela();

    // Assert
    expect(classes(tabela().querySelector('tbody')!)).toEqual(
      expect.arrayContaining(['divide-y', 'divide-line', 'bg-surface']),
    );
  });

  it('deve aceitar classes extras na moldura quando className é informado', () => {
    // Arrange
    const extra = 'hidden';

    // Act
    renderTabela(extra);

    // Assert
    expect(classes(tabela().parentElement!)).toContain(extra);
  });

  it.each([
    { peca: 'o cabeçalho de coluna', papel: 'columnheader', Celula: TableHeaderCell },
    { peca: 'a célula', papel: 'cell', Celula: TableCell },
  ])(
    'deve manter o espaço e aceitar classes extras quando $peca recebe className',
    ({ papel, Celula }) => {
      // Arrange
      const extra = 'text-right';

      // Act
      render(
        <table>
          <tbody>
            <tr>
              <Celula className={extra}>Total</Celula>
            </tr>
          </tbody>
        </table>,
      );

      // Assert
      expect(classes(screen.getByRole(papel))).toEqual(
        expect.arrayContaining([...ESPACO_DA_CELULA, extra]),
      );
    },
  );

  it('deve aceitar classes extras na linha quando className é informado', () => {
    // Arrange
    const extra = 'align-top';

    // Act
    render(
      <table>
        <tbody>
          <TableRow className={extra}>
            <td>Total</td>
          </TableRow>
        </tbody>
      </table>,
    );

    // Assert
    expect(classes(screen.getByRole('row'))).toContain(extra);
  });

  it('deve repassar os demais atributos à célula', () => {
    // Arrange
    const colunas = COLUNAS.length;

    // Act
    render(
      <table>
        <tbody>
          <tr>
            <TableCell colSpan={colunas}>Nenhum item</TableCell>
          </tr>
        </tbody>
      </table>,
    );

    // Assert
    expect(screen.getByRole('cell').getAttribute('colspan')).toBe(String(colunas));
  });
});
