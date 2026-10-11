/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ModelosTable } from '@/features/admin/modelos/components/ModelosTable';
import { rotuloDoTipoDeModelo } from '@/shared/lib/rotulos';

vi.mock('@/features/admin/modelos/components/ModeloActionsMenu', () => ({
  ModeloActionsMenu: () => <div data-testid="actions-menu" />,
}));
vi.mock('@/features/admin/modelos/components/ModeloFotoCapa', () => ({
  ModeloFotoCapa: () => <div data-testid="foto-capa" />,
}));

const modelo = {
  id: '1',
  codigo: 'M01',
  descricao: 'Desc',
  maquina: 'Injetora',
  versao: 1,
  observacoes: null,
  temPendenciaAberta: false,
  tipo: null,
  ativo: true,
  fotoCapaUrl: null,
  criadoEm: '',
  atualizadoEm: '',
};

afterEach(cleanup);

describe('ModelosTable', () => {
  it('renders modelo items', () => {
    const { container } = render(<ModelosTable modelos={[modelo]} />);
    expect(within(container).getAllByText('M01').length).toBeGreaterThan(0);
  });

  it('renders empty when no modelos', () => {
    const { container } = render(<ModelosTable modelos={[]} />);
    expect(within(container).queryByText('M01')).toBeNull();
  });
});

const COLUNAS = [
  'Foto',
  'Código',
  'Versão',
  'Descrição',
  'Máquina',
  'Tipo',
  'Status',
  'Pendência',
  'Ações',
];
const SELO_NEUTRO = ['bg-surface-muted', 'text-fg-muted'];
const SELO_DE_ALERTA = ['bg-warning-soft', 'text-warning-fg'];
const classes = (elemento: Element) => elemento.className.split(' ');

describe('ModelosTable com a peça de tabela', () => {
  it('deve pôr a tabela numa moldura com rolagem horizontal e borda quando há modelos', () => {
    // Act
    const { container } = render(<ModelosTable modelos={[modelo]} />);

    // Assert
    const moldura = container.querySelector('table')!.parentElement!;
    expect(classes(moldura)).toEqual(
      expect.arrayContaining(['overflow-x-auto', 'border', 'border-line']),
    );
  });

  it('deve usar a superfície suave e o texto secundário no cabeçalho quando há modelos', () => {
    // Act
    const { container } = render(<ModelosTable modelos={[modelo]} />);

    // Assert
    expect(classes(container.querySelector('thead')!)).toEqual(
      expect.arrayContaining(['bg-surface-muted', 'text-fg-muted']),
    );
  });

  it('deve usar a superfície e a divisória por papel no corpo quando há modelos', () => {
    // Act
    const { container } = render(<ModelosTable modelos={[modelo]} />);

    // Assert
    expect(classes(container.querySelector('tbody')!)).toEqual(
      expect.arrayContaining(['divide-line', 'bg-surface']),
    );
  });

  it('deve marcar cada cabeçalho como cabeçalho de coluna quando há modelos', () => {
    // Act
    const { container } = render(<ModelosTable modelos={[modelo]} />);

    // Assert
    const cabecalhos = Array.from(container.querySelectorAll('th'));
    expect(cabecalhos.map((th) => [th.textContent, th.getAttribute('scope')])).toEqual(
      COLUNAS.map((coluna) => [coluna, 'col']),
    );
  });

  it('deve mostrar o código com o texto principal quando há modelos', () => {
    // Act
    const { container } = render(<ModelosTable modelos={[modelo]} />);

    // Assert
    const tabela = container.querySelector('table')!;
    expect(classes(within(tabela).getByText(modelo.codigo))).toContain('text-fg');
  });

  it('deve mostrar a descrição com o texto secundário quando há modelos', () => {
    // Act
    const { container } = render(<ModelosTable modelos={[modelo]} />);

    // Assert
    const tabela = container.querySelector('table')!;
    expect(classes(within(tabela).getByText(modelo.descricao))).toContain('text-fg-muted');
  });
});

describe('ModelosTable na lista de tela estreita', () => {
  it('deve usar a superfície e a borda por papel no cartão do modelo quando há modelos', () => {
    // Act
    const { container } = render(<ModelosTable modelos={[modelo]} />);

    // Assert
    expect(classes(container.querySelector('article')!)).toEqual(
      expect.arrayContaining(['border', 'border-line', 'bg-surface']),
    );
  });

  it('deve mostrar o selo de alerta com texto quando o modelo tem pendência aberta', () => {
    // Arrange
    const comPendencia = { ...modelo, temPendenciaAberta: true };

    // Act
    const { container } = render(<ModelosTable modelos={[comPendencia]} />);

    // Assert
    const cartao = container.querySelector('article')!;
    expect(classes(within(cartao).getByText('Pendência aberta'))).toEqual(
      expect.arrayContaining(SELO_DE_ALERTA),
    );
  });

  it('deve mostrar o selo neutro com o rótulo do tipo quando o modelo tem tipo', () => {
    // Arrange
    const comTipo = { ...modelo, tipo: 'RESINA' as const };

    // Act
    const { container } = render(<ModelosTable modelos={[comTipo]} />);

    // Assert
    const cartao = container.querySelector('article')!;
    expect(classes(within(cartao).getByText(rotuloDoTipoDeModelo[comTipo.tipo]))).toEqual(
      expect.arrayContaining(SELO_NEUTRO),
    );
  });
});
