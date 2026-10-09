/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { SolicitacaoTimeline } from '@/features/solicitacoes/components/SolicitacaoTimeline';
import type {
  AtividadeSolicitacao,
  StatusSolicitacao,
  TipoAtividadeSolicitacao,
} from '@/features/solicitacoes/types/solicitacaoTypes';
import { rotuloDoStatus, rotuloDoTipoDeAtividade } from '@/shared/lib/rotulos';

const HORA_MS = 3_600_000;

function iso(deslocamentoMs: number): string {
  return new Date(Date.now() - deslocamentoMs).toISOString();
}

function umaAtividade(sobrescritas: Partial<AtividadeSolicitacao> = {}): AtividadeSolicitacao {
  return {
    id: 'a1',
    solicitacaoId: 's1',
    autorUsuarioId: 'u1',
    tipo: 'ABERTURA',
    autorNome: 'João Silva',
    criadaEm: iso(1000),
    comentario: null,
    deStatus: null,
    paraStatus: null,
    ...sobrescritas,
  };
}

function variasAtividades(quantidade: number): AtividadeSolicitacao[] {
  return Array.from({ length: quantidade }, (_, i: number) =>
    umaAtividade({ id: `a${i}`, criadaEm: iso((i + 1) * 60_000) }),
  );
}

function renderizar(
  atividades: AtividadeSolicitacao[],
  extras: { isLoading?: boolean; formulario?: React.ReactNode } = {},
) {
  return render(
    <MemoryRouter>
      <SolicitacaoTimeline atividades={atividades} {...extras} />
    </MemoryRouter>,
  );
}

const TIPOS = Object.entries(rotuloDoTipoDeAtividade) as [TipoAtividadeSolicitacao, string][];
const STATUS = Object.keys(rotuloDoStatus) as StatusSolicitacao[];
const TROCAS = STATUS.map((de, i) => ({ de, para: STATUS[(i + 1) % STATUS.length] }));

/** Papel do marcador de cada tipo de atividade, pela tabela de conversão de cores do plano. */
const MARCADORES: { tipo: TipoAtividadeSolicitacao; fundo: string; icone: string }[] = [
  { tipo: 'ABERTURA', fundo: 'bg-info-soft', icone: 'text-info-fg' },
  { tipo: 'ATRIBUICAO', fundo: 'bg-surface-muted', icone: 'text-accent' },
  { tipo: 'MUDANCA_STATUS', fundo: 'bg-warning-soft', icone: 'text-warning-fg' },
  { tipo: 'COMENTARIO', fundo: 'bg-success-soft', icone: 'text-success-fg' },
  { tipo: 'EVIDENCIA_ADICIONADA', fundo: 'bg-surface-muted', icone: 'text-fg-muted' },
];

const classes = (elemento: Element) => (elemento.getAttribute('class') ?? '').split(' ');
const icone = (container: HTMLElement) => container.querySelector('li svg')!;

afterEach(cleanup);

describe('SolicitacaoTimeline — rótulos dos valores da API', () => {
  it.each(TIPOS)(
    'deve mostrar o rótulo compartilhado do tipo de atividade quando a atividade é %s',
    (tipo, rotulo) => {
      // Arrange
      const atividades = [umaAtividade({ tipo })];

      // Act
      const { container } = renderizar(atividades);

      // Assert
      expect(within(container).getByText(rotulo).textContent).toBe(rotulo);
    },
  );

  it.each(TROCAS)(
    'deve mostrar os dois status como selos quando o status muda de $de para $para',
    ({ de, para }) => {
      // Arrange
      const atividades = [umaAtividade({ tipo: 'MUDANCA_STATUS', deStatus: de, paraStatus: para })];

      // Act
      const { container } = renderizar(atividades);

      // Assert
      expect(within(container).getByText(rotuloDoStatus[de])).toBeDefined();
      expect(within(container).getByText(rotuloDoStatus[para])).toBeDefined();
    },
  );
});

describe('SolicitacaoTimeline — mudança de status', () => {
  const mudanca = umaAtividade({
    tipo: 'MUDANCA_STATUS',
    deStatus: 'A_FAZER',
    paraStatus: 'EM_ANDAMENTO',
  });

  it('deve mostrar a seta entre os selos quando o status muda', () => {
    // Arrange
    const atividades = [mudanca];

    // Act
    const { container } = renderizar(atividades);

    // Assert
    const titulo = within(container).getByText(/status alterado/i);
    expect(titulo.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(1);
  });

  it('deve esconder o texto "para" da tela quando o status muda', () => {
    // Arrange
    const atividades = [mudanca];

    // Act
    const { container } = renderizar(atividades);

    // Assert
    expect(classes(within(container).getByText('para'))).toContain('sr-only');
  });

  it('deve mostrar o de antes do para na ordem do DOM quando o status muda', () => {
    // Arrange
    const atividades = [mudanca];

    // Act
    const { container } = renderizar(atividades);

    // Assert
    const texto = within(container).getByText(/status alterado/i).textContent ?? '';
    expect(texto.replace(/\s+/g, ' ')).toBe('Status alterado: A fazer para Em andamento');
  });
});

describe('SolicitacaoTimeline — cores por papel', () => {
  it.each(MARCADORES)(
    'deve usar o fundo $fundo no marcador quando a atividade é $tipo',
    ({ tipo, fundo }) => {
      // Arrange
      const atividades = [umaAtividade({ tipo })];

      // Act
      const { container } = renderizar(atividades);

      // Assert
      expect(classes(icone(container).parentElement!)).toContain(fundo);
    },
  );

  it.each(MARCADORES)(
    'deve usar a cor $icone no ícone quando a atividade é $tipo',
    ({ tipo, icone: cor }) => {
      // Arrange
      const atividades = [umaAtividade({ tipo })];

      // Act
      const { container } = renderizar(atividades);

      // Assert
      expect(classes(icone(container))).toContain(cor);
    },
  );

  it('deve usar o texto principal quando mostra o que aconteceu', () => {
    // Arrange
    const atividades = [umaAtividade()];

    // Act
    const { container } = renderizar(atividades);

    // Assert
    expect(classes(within(container).getByText(rotuloDoTipoDeAtividade.ABERTURA))).toContain(
      'text-fg',
    );
  });

  it('deve usar o texto secundário quando mostra quem fez a atividade', () => {
    // Arrange
    const atividades = [umaAtividade()];

    // Act
    const { container } = renderizar(atividades);

    // Assert
    expect(classes(within(container).getByText('João Silva'))).toContain('text-fg-muted');
  });

  it('deve usar o texto secundário quando não há atividade', () => {
    // Arrange
    const atividades: AtividadeSolicitacao[] = [];

    // Act
    const { container } = renderizar(atividades);

    // Assert
    expect(classes(within(container).getByText('Nenhuma atividade registrada.'))).toContain(
      'text-fg-muted',
    );
  });

  it('deve evitar outline-none quando renderiza a linha do tempo', () => {
    // Arrange
    const atividades = variasAtividades(12);

    // Act
    const { container } = renderizar(atividades);

    // Assert
    expect(container.innerHTML).not.toContain('outline-none');
  });
});

describe('SolicitacaoTimeline — linha do tempo', () => {
  it('deve mostrar do mais recente para o mais antigo quando a lista vem em ordem ascendente', () => {
    // Arrange
    const atividades = [
      umaAtividade({
        id: 'antiga',
        tipo: 'COMENTARIO',
        comentario: 'primeiro',
        criadaEm: iso(5 * 24 * HORA_MS),
      }),
      umaAtividade({
        id: 'ontem',
        tipo: 'COMENTARIO',
        comentario: 'segundo',
        criadaEm: iso(24 * HORA_MS),
      }),
      umaAtividade({ id: 'hoje', tipo: 'COMENTARIO', comentario: 'terceiro', criadaEm: iso(1000) }),
    ];

    // Act
    const { container } = renderizar(atividades);

    // Assert
    const textos = Array.from(container.querySelectorAll('li p')).map((p) => p.textContent);
    expect(textos).toEqual(['terceiro', 'segundo', 'primeiro']);
  });

  it('deve agrupar por dia com Hoje e Ontem quando há atividades de dias diferentes', () => {
    // Arrange
    const atividades = [
      umaAtividade({ id: 'antiga', criadaEm: iso(5 * 24 * HORA_MS) }),
      umaAtividade({ id: 'ontem', criadaEm: iso(24 * HORA_MS) }),
      umaAtividade({ id: 'hoje', criadaEm: iso(1000) }),
    ];

    // Act
    const { container } = renderizar(atividades);

    // Assert
    const rotulos = within(container)
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent);
    expect(rotulos.slice(0, 2)).toEqual(['Hoje', 'Ontem']);
    expect(rotulos).toHaveLength(3);
  });

  it('deve mostrar o comentário como balão quando a atividade é comentário', () => {
    // Arrange
    const atividades = [umaAtividade({ tipo: 'COMENTARIO', comentario: 'Bom trabalho' })];

    // Act
    const { container } = renderizar(atividades);

    // Assert
    const balao = within(container).getByText('Bom trabalho');
    expect(classes(balao)).toEqual(
      expect.arrayContaining(['rounded-md', 'bg-surface-muted', 'text-fg']),
    );
  });

  it('deve mostrar a atribuição com menos peso quando a atividade é atribuição', () => {
    // Arrange
    const atividades = [umaAtividade({ tipo: 'ATRIBUICAO' })];

    // Act
    const { container } = renderizar(atividades);

    // Assert
    const titulo = within(container).getByText(rotuloDoTipoDeAtividade.ATRIBUICAO);
    expect(classes(titulo)).toEqual(expect.arrayContaining(['text-xs', 'text-fg-muted']));
  });

  it('deve mostrar as iniciais e o nome uma vez por evento quando há autor', () => {
    // Arrange
    const atividades = variasAtividades(2);

    // Act
    const { container } = renderizar(atividades);

    // Assert
    expect(within(container).getAllByText('JS')).toHaveLength(2);
    expect(within(container).getAllByText('João Silva')).toHaveLength(2);
  });

  it('deve mostrar 10 eventos e o botão de recolhimento quando há 12 atividades', () => {
    // Arrange
    const atividades = variasAtividades(12);

    // Act
    const { container } = renderizar(atividades);

    // Assert
    expect(container.querySelectorAll('li')).toHaveLength(10);
    expect(
      within(container).getByRole('button', { name: 'Mostrar 2 eventos anteriores' }),
    ).toBeDefined();
  });

  it('deve mostrar todas as atividades quando aciona mostrar eventos anteriores', async () => {
    // Arrange
    const atividades = variasAtividades(12);
    const { container } = renderizar(atividades);

    // Act
    await userEvent.click(
      within(container).getByRole('button', { name: 'Mostrar 2 eventos anteriores' }),
    );

    // Assert
    expect(container.querySelectorAll('li')).toHaveLength(12);
  });
});

describe('SolicitacaoTimeline — formulário, carregando e vazio', () => {
  it('deve mostrar o formulário antes da linha do tempo quando ele é informado', () => {
    // Arrange
    const formulario = <textarea aria-label="Comentário" />;

    // Act
    const { container } = renderizar([umaAtividade()], { formulario });

    // Assert
    const campo = within(container).getByRole('textbox', { name: 'Comentário' });
    const linha = within(container).getByRole('region', { name: 'Histórico de atividades' });
    expect(campo.compareDocumentPosition(linha) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('deve esconder o campo quando o formulário não é informado', () => {
    // Arrange
    const atividades = [umaAtividade()];

    // Act
    const { container } = renderizar(atividades);

    // Assert
    expect(within(container).queryByRole('textbox')).toBeNull();
  });

  it('deve mostrar uma única região do histórico quando há atividades', () => {
    // Arrange
    const atividades = [umaAtividade()];

    // Act
    const { container } = renderizar(atividades);

    // Assert
    const regioes = within(container).getAllByRole('region', { name: 'Histórico de atividades' });
    expect(regioes).toHaveLength(1);
  });

  it('deve mostrar o carregando quando isLoading é verdadeiro', () => {
    // Arrange
    const atividades: AtividadeSolicitacao[] = [];

    // Act
    const { container } = renderizar(atividades, { isLoading: true });

    // Assert
    expect(within(container).getByText('Carregando histórico...')).toBeDefined();
  });

  it('deve mostrar a mensagem de vazio quando não há atividades', () => {
    // Arrange
    const atividades: AtividadeSolicitacao[] = [];

    // Act
    const { container } = renderizar(atividades);

    // Assert
    expect(within(container).getByText('Nenhuma atividade registrada.')).toBeDefined();
  });
});
