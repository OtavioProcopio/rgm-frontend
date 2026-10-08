/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render as renderSemRoteador, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { KanbanCard } from '@/features/solicitacoes/components/KanbanCard';
import { rotuloDoTipoDeSolicitacao } from '@/shared/lib/rotulos';

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

describe('KanbanCard — selos', () => {
  const NEUTRO = ['bg-surface-muted', 'text-fg-muted'];
  const TEXTO_SECUNDARIO = 'text-fg-muted';
  const SEM_PRIORIDADE = 'Sem prioridade';
  const TIPOS = [
    { tipo: 'REPARO', modeloId: 'm1' },
    { tipo: 'INSPECAO', modeloId: 'm1' },
    { tipo: 'REENGENHARIA', modeloId: 'm1' },
    { tipo: 'CRIACAO', modeloId: null },
  ] as const;
  const PRAZOS = [
    {
      situacao: 'está atrasada',
      rotulo: 'Atrasada há 5 h',
      papel: ['bg-danger-soft', 'text-danger-fg'],
      dados: () => ({
        status: 'EM_ANDAMENTO',
        criadaEm: horasAtras(29),
        prazoLimite: horasAtras(5),
        atrasada: true,
      }),
    },
    {
      situacao: 'está perto de vencer',
      rotulo: 'Vence em 4 h',
      papel: ['bg-warning-soft', 'text-warning-fg'],
      dados: () => ({
        status: 'EM_ANDAMENTO',
        criadaEm: horasAtras(20),
        prazoLimite: emHoras(4.5),
        atrasada: false,
      }),
    },
    {
      situacao: 'passou da metade do prazo',
      rotulo: 'Vence em 10 h',
      papel: NEUTRO,
      dados: () => ({
        status: 'EM_ANDAMENTO',
        criadaEm: horasAtras(20),
        prazoLimite: emHoras(10.5),
        atrasada: false,
      }),
    },
    {
      situacao: 'foi concluída no prazo',
      rotulo: 'No prazo',
      papel: ['bg-success-soft', 'text-success-fg'],
      dados: () => ({
        status: 'CONCLUIDA',
        criadaEm: horasAtras(48),
        prazoLimite: emHoras(5),
        atrasada: false,
      }),
    },
  ];

  const classes = (elemento: Element) => elemento.className.split(' ');

  it.each(TIPOS)(
    'deve mostrar o selo de tipo na variação neutra quando o tipo é $tipo',
    ({ tipo, modeloId }) => {
      // Act
      const { container } = render(card({ tipo, modeloId }));

      // Assert
      const selo = within(container).getByText(rotuloDoTipoDeSolicitacao[tipo]);
      expect(classes(selo)).toEqual(expect.arrayContaining(NEUTRO));
    },
  );

  it.each(TIPOS)(
    'deve mostrar um ícone decorativo no selo de tipo quando o tipo é $tipo',
    ({ tipo, modeloId }) => {
      // Act
      const { container } = render(card({ tipo, modeloId }));

      // Assert
      const selo = within(container).getByText(rotuloDoTipoDeSolicitacao[tipo]);
      expect(selo.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    },
  );

  it.each(TIPOS)(
    'deve dizer o tipo em texto no selo quando o tipo é $tipo',
    ({ tipo, modeloId }) => {
      // Act
      const { container } = render(card({ tipo, modeloId }));

      // Assert
      const selo = within(container).getByText(rotuloDoTipoDeSolicitacao[tipo]);
      expect(selo.textContent).toBe(rotuloDoTipoDeSolicitacao[tipo]);
    },
  );

  it.each(PRAZOS)(
    'deve dizer "$rotulo" no selo de prazo quando a solicitação $situacao',
    ({ rotulo, dados }) => {
      // Act
      const { container } = render(card(dados()));

      // Assert
      expect(within(container).getByText(rotulo).textContent).toBe(rotulo);
    },
  );

  it.each(PRAZOS)(
    'deve dar ao selo de prazo a cor do papel quando a solicitação $situacao',
    ({ rotulo, papel, dados }) => {
      // Act
      const { container } = render(card(dados()));

      // Assert
      expect(classes(within(container).getByText(rotulo))).toEqual(expect.arrayContaining(papel));
    },
  );

  it('deve dizer "Sem prioridade" quando a solicitação não tem prioridade', () => {
    // Act
    const { container } = render(card({ prioridade: null }));

    // Assert
    expect(within(container).getByText(SEM_PRIORIDADE).textContent).toBe(SEM_PRIORIDADE);
  });

  it('deve usar o texto secundário em "Sem prioridade" quando a solicitação não tem prioridade', () => {
    // Act
    const { container } = render(card({ prioridade: null }));

    // Assert
    expect(classes(within(container).getByText(SEM_PRIORIDADE))).toContain(TEXTO_SECUNDARIO);
  });
});

describe('KanbanCard — relação do operador', () => {
  function cardComRelacao(relacao?: 'ABERTA' | 'ATRIBUIDA' | null) {
    return (
      <KanbanCard
        solicitacao={baseSolicitacao}
        isDraggable={false}
        canAdvance={false}
        relacao={relacao}
        onDragStart={vi.fn()}
        onAdvance={vi.fn()}
      />
    );
  }

  it.each([
    ['ABERTA', 'Aberta por você'],
    ['ATRIBUIDA', 'Atribuída a você'],
  ] as const)('deve mostrar, com a relação %s, a marca "%s"', (relacao, marca) => {
    // Act
    const { container } = render(cardComRelacao(relacao));

    // Assert
    expect(within(container).getByText(marca)).toBeDefined();
  });

  it.each([
    ['ABERTA', 'Atribuída a você'],
    ['ATRIBUIDA', 'Aberta por você'],
  ] as const)('deve não mostrar, com a relação %s, a marca "%s"', (relacao, marca) => {
    // Act
    const { container } = render(cardComRelacao(relacao));

    // Assert
    expect(within(container).queryByText(marca)).toBeNull();
  });

  it.each([[undefined], [null]])(
    'deve não mostrar marca de relação quando a relação informada é %s',
    (relacao) => {
      // Act
      const { container } = render(cardComRelacao(relacao));

      // Assert
      expect(within(container).queryByText(/por você|a você/)).toBeNull();
    },
  );
});
