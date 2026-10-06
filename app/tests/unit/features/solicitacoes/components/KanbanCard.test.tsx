/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render as renderSemRoteador, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { KanbanCard } from '@/features/solicitacoes/components/KanbanCard';

vi.mock('@/features/solicitacoes/components/SolicitacaoPrioridadeBadge', () => ({
  SolicitacaoPrioridadeBadge: ({ prioridade }: { prioridade: string }) => <span>{prioridade}</span>,
}));

const baseSolicitacao = {
  id: '1',
  titulo: 'Manutenção da bomba',
  descricao: 'Trocar vedações',
  tipo: 'REPARO' as const,
  status: 'A_FAZER' as const,
  prioridade: 'ALTA' as const,
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

function render(ui: ReactElement) {
  return renderSemRoteador(ui, { wrapper: MemoryRouter });
}

const HORA = 3_600_000;
const horasAtras = (horas: number) => new Date(Date.now() - horas * HORA).toISOString();
const emHoras = (horas: number) => new Date(Date.now() + horas * HORA).toISOString();

function card(extra: object) {
  return (
    <KanbanCard
      solicitacao={{ ...baseSolicitacao, ...extra }}
      isDraggable={false}
      canAdvance={false}
      onDragStart={vi.fn()}
      onAdvance={vi.fn()}
    />
  );
}

describe('KanbanCard', () => {
  it('renders titulo and tipo', () => {
    const { container } = render(
      <KanbanCard
        solicitacao={baseSolicitacao}
        isDraggable={false}
        canAdvance={false}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(within(container).getByText('Manutenção da bomba')).toBeDefined();
    expect(within(container).getByText('Reparo')).toBeDefined();
  });

  it('renders descricao when present', () => {
    const { container } = render(
      <KanbanCard
        solicitacao={baseSolicitacao}
        isDraggable={false}
        canAdvance={false}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(within(container).getByText('Trocar vedações')).toBeDefined();
  });

  it('renders sem prioridade when prioridade is null', () => {
    const { container } = render(
      <KanbanCard
        solicitacao={{ ...baseSolicitacao, prioridade: null }}
        isDraggable={false}
        canAdvance={false}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(within(container).getByText(/sem prioridade/i)).toBeDefined();
  });

  it('renders INSPECAO tipo', () => {
    const { container } = render(
      <KanbanCard
        solicitacao={{ ...baseSolicitacao, tipo: 'INSPECAO' }}
        isDraggable={false}
        canAdvance={false}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(within(container).getByText('Inspeção')).toBeDefined();
  });

  it('renders REENGENHARIA tipo', () => {
    const { container } = render(
      <KanbanCard
        solicitacao={{ ...baseSolicitacao, tipo: 'REENGENHARIA' }}
        isDraggable={false}
        canAdvance={false}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(within(container).getByText('Reengenharia')).toBeDefined();
  });

  it('renders the formatted creation date', () => {
    const criadaEm = new Date('2026-03-15T12:00:00Z').toISOString();
    const { container } = render(
      <KanbanCard
        solicitacao={{ ...baseSolicitacao, criadaEm }}
        isDraggable={false}
        canAdvance={false}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    const time = container.querySelector('time')!;
    expect(time).toBeDefined();
    expect(time.getAttribute('dateTime')).toBe(criadaEm);
  });

  it('renders CRIACAO tipo without a modelo vinculado', () => {
    const { container } = render(
      <KanbanCard
        solicitacao={{ ...baseSolicitacao, tipo: 'CRIACAO', modeloId: null }}
        isDraggable={false}
        canAdvance={false}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(within(container).getByText('Criação de modelo')).toBeDefined();
  });

  it('shows age badge for old cards', () => {
    const old = new Date(Date.now() - 10 * 86_400_000).toISOString();
    const { container } = render(
      <KanbanCard
        solicitacao={{ ...baseSolicitacao, criadaEm: old }}
        isDraggable={false}
        canAdvance={false}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(within(container).getByText(/\d+d/)).toBeDefined();
  });

  it('has draggable attribute', () => {
    const { container } = render(
      <KanbanCard
        solicitacao={baseSolicitacao}
        isDraggable={true}
        canAdvance={false}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    const card = container.querySelector('[draggable="true"]')!;
    expect(card).toBeDefined();
  });

  it('does not render advance button when canAdvance is false', () => {
    const { container } = render(
      <KanbanCard
        solicitacao={baseSolicitacao}
        isDraggable={false}
        canAdvance={false}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );
    expect(container.querySelector('[aria-label="Triar"]')).toBeNull();
  });

  it('renders advance button and calls onAdvance when clicked', () => {
    const onAdvance = vi.fn();
    const { container } = render(
      <KanbanCard
        solicitacao={baseSolicitacao}
        isDraggable={true}
        canAdvance={true}
        onDragStart={vi.fn()}
        onAdvance={onAdvance}
      />,
    );
    const button = container.querySelector('[aria-label="Triar"]')!;
    expect(button).toBeDefined();
    fireEvent.click(button);
    expect(onAdvance).toHaveBeenCalledWith(baseSolicitacao);
  });

  it('deve dizer há quanto tempo está atrasada quando a API marca atraso em solicitação em aberto', () => {
    const { container } = render(
      card({
        status: 'EM_ANDAMENTO',
        criadaEm: horasAtras(29),
        prazoLimite: horasAtras(5),
        atrasada: true,
      }),
    );

    expect(within(container).getByText('Atrasada há 5 h')).toBeDefined();
  });

  it('deve manter o selo de atraso quando a solicitação acabou de ser atualizada', () => {
    const { container } = render(
      card({
        status: 'EM_ANDAMENTO',
        criadaEm: horasAtras(29),
        atualizadaEm: new Date().toISOString(),
        prazoLimite: horasAtras(5),
        atrasada: true,
      }),
    );

    expect(within(container).getByText('Atrasada há 5 h')).toBeDefined();
  });

  it('deve dizer quanto falta quando a solicitação está perto de vencer', () => {
    const { container } = render(
      card({
        status: 'EM_ANDAMENTO',
        criadaEm: horasAtras(20),
        prazoLimite: emHoras(4.5),
        atrasada: false,
      }),
    );

    expect(within(container).getByText('Vence em 4 h')).toBeDefined();
  });

  it('deve dizer "Fora do prazo" e esconder a idade quando a concluída está atrasada', () => {
    const { container } = render(
      card({
        status: 'CONCLUIDA',
        criadaEm: horasAtras(24 * 10),
        prazoLimite: horasAtras(24 * 9),
        atrasada: true,
      }),
    );

    expect(within(container).getByText('Fora do prazo')).toBeDefined();
    expect(within(container).queryByText(/^\d+d$/)).toBeNull();
  });

  it('deve ficar sem selo de prazo e sem idade quando a solicitação está cancelada', () => {
    const { container } = render(
      card({
        status: 'CANCELADA',
        criadaEm: horasAtras(24 * 10),
        prazoLimite: horasAtras(24 * 9),
        atrasada: false,
      }),
    );

    expect(within(container).queryByText(/prazo|Atrasada|Vence/)).toBeNull();
    expect(within(container).queryByText(/^\d+d$/)).toBeNull();
  });

  it('deve ficar sem selo de prazo quando a API não informa o prazo', () => {
    const { container } = render(card({ status: 'EM_ANDAMENTO', criadaEm: horasAtras(500) }));

    expect(within(container).queryByText(/prazo|Atrasada|Vence/)).toBeNull();
  });

  it('deve apontar o link para o detalhe da solicitação', () => {
    const { container } = render(card({ id: 'abc' }));

    const link = within(container).getByRole('link', { name: /Ver solicitação/ });

    expect(link.getAttribute('href')).toBe('/app/solicitacoes/abc');
  });

  it('deve navegar para o detalhe sem recarregar quando o link é clicado', () => {
    function Local() {
      return <p>local: {useLocation().pathname}</p>;
    }
    const { container } = renderSemRoteador(
      <MemoryRouter initialEntries={['/app/solicitacoes']}>
        <Routes>
          <Route path="/app/solicitacoes" element={card({ id: 'abc' })} />
          <Route path="/app/solicitacoes/:id" element={<Local />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(within(container).getByRole('link', { name: /Ver solicitação/ }));

    expect(within(container).getByText('local: /app/solicitacoes/abc')).toBeDefined();
  });

  it('deve nomear o botão de avançar com a ação da etapa', () => {
    const { container } = render(
      <KanbanCard
        solicitacao={{ ...baseSolicitacao, status: 'EM_ANDAMENTO' }}
        isDraggable={false}
        canAdvance
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />,
    );

    expect(within(container).getByRole('button', { name: 'Enviar para validação' })).toBeDefined();
  });
});
