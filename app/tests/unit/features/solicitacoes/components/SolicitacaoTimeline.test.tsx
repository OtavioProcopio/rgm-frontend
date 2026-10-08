/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SolicitacaoTimeline } from '@/features/solicitacoes/components/SolicitacaoTimeline';
import type {
  AtividadeSolicitacao,
  StatusSolicitacao,
  TipoAtividadeSolicitacao,
} from '@/features/solicitacoes/types/solicitacaoTypes';
import { rotuloDoStatus, rotuloDoTipoDeAtividade } from '@/shared/lib/rotulos';

const atividade = {
  id: 'a1',
  solicitacaoId: 's1',
  autorUsuarioId: 'u1',
  tipo: 'ABERTURA' as const,
  autorNome: 'João',
  criadaEm: '2024-06-01T10:00:00Z',
  comentario: null,
  deStatus: null,
  paraStatus: null,
};

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
      const atividades = [{ ...atividade, tipo }];

      // Act
      const { container } = render(<SolicitacaoTimeline atividades={atividades} />);

      // Assert
      expect(within(container).getByText(rotulo).textContent).toBe(rotulo);
    },
  );

  it.each(TROCAS)(
    'deve mostrar os rótulos compartilhados dos dois status quando o status muda de $de para $para',
    ({ de, para }) => {
      // Arrange
      const atividades = [
        { ...atividade, tipo: 'MUDANCA_STATUS' as const, deStatus: de, paraStatus: para },
      ];
      const esperado = `${rotuloDoTipoDeAtividade.MUDANCA_STATUS}: ${rotuloDoStatus[de]} → ${rotuloDoStatus[para]}`;

      // Act
      const { container } = render(<SolicitacaoTimeline atividades={atividades} />);

      // Assert
      expect(container.querySelector('li p')!.textContent).toBe(esperado);
    },
  );
});

describe('SolicitacaoTimeline — cores por papel', () => {
  it.each(MARCADORES)(
    'deve usar o fundo $fundo no marcador quando a atividade é $tipo',
    ({ tipo, fundo }) => {
      // Arrange
      const atividades = [{ ...atividade, tipo }];

      // Act
      const { container } = render(<SolicitacaoTimeline atividades={atividades} />);

      // Assert
      expect(classes(icone(container).parentElement!)).toContain(fundo);
    },
  );

  it.each(MARCADORES)(
    'deve usar a cor $icone no ícone quando a atividade é $tipo',
    ({ tipo, icone: cor }) => {
      // Arrange
      const atividades = [{ ...atividade, tipo }];

      // Act
      const { container } = render(<SolicitacaoTimeline atividades={atividades} />);

      // Assert
      expect(classes(icone(container))).toContain(cor);
    },
  );

  it('deve usar o texto principal quando mostra o que aconteceu', () => {
    // Arrange
    const atividades = [atividade];

    // Act
    const { container } = render(<SolicitacaoTimeline atividades={atividades} />);

    // Assert
    expect(classes(within(container).getByText(rotuloDoTipoDeAtividade[atividade.tipo]))).toContain(
      'text-fg',
    );
  });

  it('deve usar o texto secundário quando mostra quem fez a atividade', () => {
    // Arrange
    const atividades = [atividade];

    // Act
    const { container } = render(<SolicitacaoTimeline atividades={atividades} />);

    // Assert
    expect(classes(within(container).getByText(atividade.autorNome))).toContain('text-fg-muted');
  });

  it('deve usar o texto secundário quando não há atividade', () => {
    // Arrange
    const atividades: AtividadeSolicitacao[] = [];

    // Act
    const { container } = render(<SolicitacaoTimeline atividades={atividades} />);

    // Assert
    expect(classes(container.firstElementChild!)).toContain('text-fg-muted');
  });
});

describe('SolicitacaoTimeline', () => {
  it('shows loading state', () => {
    const { container } = render(<SolicitacaoTimeline atividades={[]} isLoading />);
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('shows empty message when no atividades', () => {
    const { container } = render(<SolicitacaoTimeline atividades={[]} />);
    expect(within(container).getByText(/nenhuma atividade/i)).toBeDefined();
  });

  it('renders atividade with autor and tipo', () => {
    const { container } = render(<SolicitacaoTimeline atividades={[atividade]} />);
    expect(within(container).getByText('Solicitação aberta')).toBeDefined();
    expect(within(container).getByText('João')).toBeDefined();
  });

  it('renders status change atividade', () => {
    const { container } = render(
      <SolicitacaoTimeline
        atividades={[
          {
            ...atividade,
            tipo: 'MUDANCA_STATUS',
            deStatus: 'A_FAZER' as const,
            paraStatus: 'EM_ANDAMENTO' as const,
          },
        ]}
      />,
    );
    expect(within(container).getByText(/status alterado/i)).toBeDefined();
  });

  it('renders comentario text', () => {
    const { container } = render(
      <SolicitacaoTimeline
        atividades={[{ ...atividade, tipo: 'COMENTARIO', comentario: 'Bom trabalho' }]}
      />,
    );
    expect(within(container).getByText('Bom trabalho')).toBeDefined();
  });

  it('renders EVIDENCIA_ADICIONADA tipo', () => {
    const { container } = render(
      <SolicitacaoTimeline atividades={[{ ...atividade, tipo: 'EVIDENCIA_ADICIONADA' }]} />,
    );
    expect(within(container).getByText('Evidência anexada')).toBeDefined();
  });
});
