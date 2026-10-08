/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { useResumoDeModelos } from '@/features/admin/modelos/hooks/useResumoDeModelos';
import { useMetricasPorModelo } from '@/features/solicitacoes/hooks/useMetricasPorModelo';
import { ModelosTab } from '@/features/solicitacoes/pages/ModelosTab';

vi.mock('@/features/admin/modelos/hooks/useResumoDeModelos', () => ({
  useResumoDeModelos: vi.fn(),
}));

vi.mock('@/features/solicitacoes/hooks/useMetricasPorModelo', () => ({
  useMetricasPorModelo: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const RESUMO = {
  total: 12,
  ativos: 9,
  inativos: 3,
  comPendenciaAberta: 4,
  porMaquina: [
    { maquina: 'Torno T-10', quantidade: 5 },
    { maquina: 'Prensa PH-200', quantidade: 7 },
  ],
};

const RANKING = [
  {
    modeloId: 'm1',
    codigo: 'M01',
    tempoMedioResolucaoSegundos: 3600,
    intervaloMedioSegundos: 7200,
  },
  {
    modeloId: 'm2',
    codigo: 'M02',
    tempoMedioResolucaoSegundos: 90000,
    intervaloMedioSegundos: null,
  },
];

function resumoResponde(estado: { data?: typeof RESUMO; isLoading?: boolean; isError?: boolean }) {
  vi.mocked(useResumoDeModelos).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...estado,
  } as unknown as ReturnType<typeof useResumoDeModelos>);
}

function rankingCom(content: typeof RANKING) {
  vi.mocked(useMetricasPorModelo).mockReturnValue({
    data: { content, page: 0, size: 10, totalElements: content.length, totalPages: 1 },
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useMetricasPorModelo>);
}

function abrir() {
  const { AppWrapper } = createAppWrapper();
  return render(<ModelosTab />, { wrapper: AppWrapper });
}

beforeEach(() => {
  mockNavigate.mockClear();
  resumoResponde({ data: RESUMO });
  rankingCom([]);
});

afterEach(cleanup);

describe('ModelosTab — estados', () => {
  it('deve mostrar o carregamento enquanto o resumo não chegou', () => {
    // Arrange
    resumoResponde({ isLoading: true });

    // Act
    const { container } = abrir();

    // Assert
    expect(within(container).getByText(/carregando/i)).toBeDefined();
  });

  it('deve mostrar o erro quando o resumo não pôde ser carregado', () => {
    // Arrange
    resumoResponde({ isError: true });

    // Act
    const { container } = abrir();

    // Assert
    expect(within(container).getByText(/não foi possível carregar/i)).toBeDefined();
  });
});

describe('ModelosTab — contagens pelo resumo da API', () => {
  it.each([
    ['Total', '12'],
    ['Ativos', '9'],
    ['Inativos', '3'],
    ['Com pendência', '4'],
  ])('deve mostrar no indicador "%s" o valor %s que o resumo traz', (rotulo, valor) => {
    // Act
    const { container } = abrir();

    // Assert
    expect(container.textContent).toMatch(new RegExp(`${rotulo}\\s*${valor}\\D`));
  });

  it('deve mostrar a quantidade de modelos de cada máquina, da maior para a menor', () => {
    // Act
    const { container } = abrir();

    // Assert
    const linhas = within(container)
      .getAllByRole('button', { name: /^Ver solicitações da máquina/ })
      .map((linha) => linha.textContent);
    expect(linhas).toEqual(['Prensa PH-2007', 'Torno T-105']);
  });

  it('deve dizer que não há modelo cadastrado quando o resumo não traz máquina', () => {
    // Arrange
    resumoResponde({ data: { ...RESUMO, porMaquina: [] } });

    // Act
    const { container } = abrir();

    // Assert
    expect(within(container).getByText('Nenhum modelo cadastrado.')).toBeDefined();
  });
});

const TABELAS = [
  { nome: 'modelos por máquina', colunas: ['Máquina', 'Modelos'] },
  {
    nome: 'ranking por tempo',
    colunas: ['Código', 'Tempo médio de resolução', 'Intervalo médio entre solicitações'],
  },
];

const classes = (elemento: Element) => elemento.className.split(' ');

function abrirComAsDuasTabelas(primeiraColuna: string) {
  rankingCom(RANKING);
  const { container } = abrir();
  return within(container).getByRole('columnheader', { name: primeiraColuna }).closest('table')!;
}

describe('ModelosTab — tabelas pela peça de tabela', () => {
  it.each(TABELAS)(
    'deve rolar a tabela de $nome na horizontal dentro da moldura com a borda do papel',
    ({ colunas }) => {
      // Act
      const tabela = abrirComAsDuasTabelas(colunas[0]);

      // Assert
      expect(classes(tabela.parentElement!)).toEqual(
        expect.arrayContaining(['overflow-x-auto', 'border', 'border-line']),
      );
    },
  );

  it.each(TABELAS)(
    'deve ter o cabeçalho da tabela de $nome com a superfície suave e o texto secundário',
    ({ colunas }) => {
      // Act
      const tabela = abrirComAsDuasTabelas(colunas[0]);

      // Assert
      expect(classes(tabela.querySelector('thead')!)).toEqual(
        expect.arrayContaining(['bg-surface-muted', 'text-fg-muted']),
      );
    },
  );

  it.each(TABELAS)(
    'deve separar as linhas da tabela de $nome pelo papel de borda, sobre a superfície',
    ({ colunas }) => {
      // Act
      const tabela = abrirComAsDuasTabelas(colunas[0]);

      // Assert
      expect(classes(tabela.querySelector('tbody')!)).toEqual(
        expect.arrayContaining(['divide-line', 'bg-surface']),
      );
    },
  );

  it.each(TABELAS)(
    'deve ter um cabeçalho de coluna para cada coluna da tabela de $nome',
    ({ colunas }) => {
      // Act
      const tabela = abrirComAsDuasTabelas(colunas[0]);

      // Assert
      expect(
        within(tabela)
          .getAllByRole('columnheader')
          .map((celula) => celula.textContent),
      ).toEqual(colunas);
    },
  );

  it.each(TABELAS)(
    'deve marcar cada cabeçalho da tabela de $nome como cabeçalho de coluna',
    ({ colunas }) => {
      // Act
      const tabela = abrirComAsDuasTabelas(colunas[0]);

      // Assert
      expect(
        within(tabela)
          .getAllByRole('columnheader')
          .map((celula) => celula.getAttribute('scope')),
      ).toEqual(colunas.map(() => 'col'));
    },
  );
});

describe('ModelosTab — textos pelos papéis', () => {
  it('deve mostrar o aviso de nenhum modelo cadastrado com o texto secundário', () => {
    // Arrange
    resumoResponde({ data: { ...RESUMO, porMaquina: [] } });

    // Act
    const { container } = abrir();

    // Assert
    expect(classes(within(container).getByText('Nenhum modelo cadastrado.'))).toContain(
      'text-fg-muted',
    );
  });
});

describe('ModelosTab — solicitações da máquina', () => {
  it('deve ir para as solicitações filtradas pela máquina quando a linha dela é clicada', () => {
    // Arrange
    const { getByText } = abrir();

    // Act
    fireEvent.click(getByText('Prensa PH-200'));

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('/app/solicitacoes?maquina=Prensa%20PH-200');
  });

  it('deve ir para as solicitações filtradas pela máquina quando Enter é apertado na linha dela', () => {
    // Arrange
    const { getByRole } = abrir();

    // Act
    fireEvent.keyDown(getByRole('button', { name: /prensa ph-200/i }), { key: 'Enter' });

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith('/app/solicitacoes?maquina=Prensa%20PH-200');
  });
});

describe('ModelosTab — ranking por tempo', () => {
  it.each([['M01'], ['M02']])('deve listar no ranking o modelo %s', (codigo) => {
    // Arrange
    rankingCom(RANKING);

    // Act
    const { container } = abrir();

    // Assert
    expect(within(container).getByText(codigo)).toBeDefined();
  });

  it('deve mostrar o tempo médio de resolução formatado', () => {
    // Arrange
    rankingCom(RANKING);

    // Act
    const { container } = abrir();

    // Assert
    expect(within(container).getByText('1h')).toBeDefined();
  });

  it('deve mostrar "—" no intervalo do modelo que não tem intervalo calculado', () => {
    // Arrange
    rankingCom(RANKING);

    // Act
    const { container } = abrir();

    // Assert
    expect(within(container).getAllByText('—')).toHaveLength(1);
  });

  it('deve dizer que não há modelo com dados suficientes quando o ranking vem vazio', () => {
    // Act
    const { container } = abrir();

    // Assert
    expect(within(container).getByText('Nenhum modelo com dados suficientes')).toBeDefined();
  });

  it('deve ordenar pelo tempo de resolução em ordem crescente quando esse cabeçalho é clicado', () => {
    // Arrange
    rankingCom(RANKING);
    const { getByText } = abrir();

    // Act
    fireEvent.click(getByText(/Tempo médio de resolução/));

    // Assert
    expect(useMetricasPorModelo).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: 'TEMPO_RESOLUCAO', dir: 'asc' }),
    );
  });

  it('deve ordenar pelo intervalo em ordem decrescente quando esse cabeçalho é clicado', () => {
    // Arrange
    rankingCom(RANKING);
    const { getByText } = abrir();

    // Act
    fireEvent.click(getByText(/Intervalo médio entre solicitações/));

    // Assert
    expect(useMetricasPorModelo).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: 'INTERVALO', dir: 'desc' }),
    );
  });
});
