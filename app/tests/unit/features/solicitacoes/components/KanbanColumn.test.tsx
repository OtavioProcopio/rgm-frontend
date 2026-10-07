/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ColumnConfig } from '@/features/solicitacoes/components/KanbanColumn';
import { KanbanColumn } from '@/features/solicitacoes/components/KanbanColumn';

vi.mock('@/features/solicitacoes/components/KanbanCard', () => ({
  KanbanCard: ({
    solicitacao,
    relacao,
  }: {
    solicitacao: { titulo: string };
    relacao?: string | null;
  }) => (
    <div data-testid="kanban-card" data-relacao={relacao ?? 'nenhuma'}>
      {solicitacao.titulo}
    </div>
  ),
}));

const config: ColumnConfig = {
  status: 'A_FAZER',
  label: 'A Fazer',
  headerClass: 'bg-slate-100',
  accentClass: 'bg-slate-50',
};

const solicitacao = {
  id: '1',
  titulo: 'Card Title',
  descricao: '',
  tipo: 'REPARO' as const,
  status: 'A_FAZER' as const,
  prioridade: null,
  criadaEm: new Date().toISOString(),
  atualizadaEm: new Date().toISOString(),
  modeloId: 'm1',
  abertaPorUsuarioId: 'u1',
  comentarioFinal: null,
  concluidaEm: null,
  canceladaEm: null,
  responsavelIds: [],
};

afterEach(cleanup);

describe('KanbanColumn', () => {
  function colunaBasica(extra: Partial<Parameters<typeof KanbanColumn>[0]> = {}) {
    return (
      <KanbanColumn
        config={config}
        cards={[]}
        total={0}
        isDropTarget={false}
        isInvalidDrop={false}
        canDragCard={() => true}
        canAdvanceCard={() => false}
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDrop={vi.fn()}
        onAdvance={vi.fn()}
        {...extra}
      />
    );
  }

  it('deve mostrar o nome da coluna no computador', () => {
    // Act
    const { container } = render(colunaBasica());

    // Assert
    expect(within(container).getByText('A Fazer')).toBeDefined();
  });

  it('deve dizer que não há solicitação quando a coluna está vazia', () => {
    // Act
    const { container } = render(colunaBasica());

    // Assert
    expect(within(container).getByText(/nenhuma solicitação/i)).toBeDefined();
  });

  it('deve mostrar o card de cada solicitação recebida', () => {
    // Act
    const { container } = render(colunaBasica({ cards: [solicitacao], total: 1 }));

    // Assert
    expect(within(container).getByTestId('kanban-card').textContent).toBe('Card Title');
  });

  it('deve não mostrar o nome da coluna no celular, onde as abas já o mostram', () => {
    // Act
    const { container } = render(colunaBasica({ mobileView: true }));

    // Assert
    expect(within(container).queryByText('A Fazer')).toBeNull();
  });

  function coluna(relacaoDe?: Parameters<typeof KanbanColumn>[0]['relacaoDe']) {
    return (
      <KanbanColumn
        config={config}
        cards={[solicitacao]}
        total={1}
        isDropTarget={false}
        isInvalidDrop={false}
        canDragCard={() => true}
        canAdvanceCard={() => false}
        relacaoDe={relacaoDe}
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDrop={vi.fn()}
        onAdvance={vi.fn()}
      />
    );
  }

  it('deve repassar ao card a relação calculada para a solicitação dele', () => {
    // Arrange
    const relacaoDe = vi.fn().mockReturnValue('ATRIBUIDA');

    // Act
    const { container } = render(coluna(relacaoDe));

    // Assert
    expect(relacaoDe).toHaveBeenCalledTimes(1);
    expect(relacaoDe).toHaveBeenCalledWith(solicitacao);
    expect(within(container).getByTestId('kanban-card').dataset.relacao).toBe('ATRIBUIDA');
  });

  it('deve deixar o card sem relação quando a coluna não recebe como calculá-la', () => {
    // Act
    const { container } = render(coluna());

    // Assert
    expect(within(container).getByTestId('kanban-card').dataset.relacao).toBe('nenhuma');
  });

  function colunaEmBlocos(extra: Partial<Parameters<typeof KanbanColumn>[0]> = {}) {
    return (
      <KanbanColumn
        config={config}
        cards={[solicitacao, { ...solicitacao, id: '2' }]}
        total={45}
        isDropTarget={false}
        isInvalidDrop={false}
        canDragCard={() => true}
        canAdvanceCard={() => false}
        onDragStart={vi.fn()}
        onDragOver={vi.fn()}
        onDrop={vi.fn()}
        onAdvance={vi.fn()}
        {...extra}
      />
    );
  }

  it('deve mostrar no contador o total da coluna, e não a quantidade de cards carregados', () => {
    // Act
    const { container } = render(colunaEmBlocos());

    // Assert
    expect(within(container).getByText('45')).toBeDefined();
  });

  it('deve oferecer "Carregar mais", dizendo quantos estão na tela, quando há mais solicitações', () => {
    // Act
    const { container } = render(colunaEmBlocos({ temMais: true }));

    // Assert
    expect(
      within(container).getByRole('button', { name: 'Carregar mais (2 de 45)' }),
    ).toBeDefined();
  });

  it('deve não oferecer "Carregar mais" quando a coluna mostra todas as solicitações', () => {
    // Act
    const { container } = render(colunaEmBlocos({ temMais: false }));

    // Assert
    expect(within(container).queryByRole('button', { name: /Carregar mais/ })).toBeNull();
  });

  it('deve pedir o próximo bloco uma vez quando "Carregar mais" é acionado', () => {
    // Arrange
    const onCarregarMais = vi.fn();
    const { container } = render(colunaEmBlocos({ temMais: true, onCarregarMais }));

    // Act
    within(container).getByRole('button', { name: /Carregar mais/ }).click();

    // Assert
    expect(onCarregarMais).toHaveBeenCalledTimes(1);
  });

  it('deve desabilitar o botão e dizer "Carregando..." enquanto o próximo bloco é buscado', () => {
    // Act
    const { container } = render(colunaEmBlocos({ temMais: true, carregandoMais: true }));

    // Assert
    const botao = within(container).getByRole('button', { name: 'Carregando...' });
    expect((botao as HTMLButtonElement).disabled).toBe(true);
  });

  it('deve dizer o recorte aplicado à coluna quando recebe um aviso', () => {
    // Act
    const { container } = render(colunaEmBlocos({ aviso: 'Últimos 30 dias' }));

    // Assert
    expect(within(container).getByText('Últimos 30 dias')).toBeDefined();
  });

  it('deve não dizer recorte nenhum quando não recebe aviso', () => {
    // Act
    const { container } = render(colunaEmBlocos());

    // Assert
    expect(within(container).queryByText('Últimos 30 dias')).toBeNull();
  });

  it('deve avisar na coluna quando a busca do próximo bloco falha', () => {
    // Act
    const { container } = render(colunaEmBlocos({ temMais: true, falhouAoCarregarMais: true }));

    // Assert
    expect(within(container).getByRole('alert').textContent).toBe(
      'Não foi possível carregar mais solicitações. Tente de novo.',
    );
  });

  it('deve manter "Carregar mais" disponível para nova tentativa quando a busca do próximo bloco falha', () => {
    // Act
    const { container } = render(colunaEmBlocos({ temMais: true, falhouAoCarregarMais: true }));

    // Assert
    expect(within(container).getByRole('button', { name: /Carregar mais/ })).toBeDefined();
  });

  it('deve não avisar de falha quando a busca do próximo bloco não falhou', () => {
    // Act
    const { container } = render(colunaEmBlocos({ temMais: true }));

    // Assert
    expect(within(container).queryByRole('alert')).toBeNull();
  });
});
