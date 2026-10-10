/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';
import { DistribuicaoDoTrabalho } from '@/features/solicitacoes/components/DistribuicaoDoTrabalho';
import type {
  MetricasResponse,
  SolicitacoesFilters,
} from '@/features/solicitacoes/types/solicitacaoTypes';

const METRICAS = {
  solicitacoesPorStatus: {
    A_FAZER: 3,
    EM_ANDAMENTO: 4,
    EM_VALIDACAO: 2,
    CONCLUIDA: 100,
    CANCELADA: 100,
  },
} as unknown as MetricasResponse;

const QUANTIDADES: Record<string, number> = {
  REPARO: 11,
  INSPECAO: 8,
  REENGENHARIA: 6,
  CRIACAO: 5,
  URGENTE: 41,
  ALTA: 32,
  MEDIA: 23,
  BAIXA: 14,
};

let listar: MockInstance<typeof solicitacoesApi.listar>;

beforeEach(() => {
  listar = vi.spyOn(solicitacoesApi, 'listar').mockImplementation((filtros: SolicitacoesFilters) =>
    Promise.resolve({
      content: [],
      page: 0,
      size: filtros.size,
      totalPages: 0,
      totalElements: QUANTIDADES[filtros.tipo ?? filtros.prioridade ?? ''] ?? 0,
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

type PropsDoComponente = ComponentProps<typeof DistribuicaoDoTrabalho>;

function renderizar(sobrescrita: Partial<PropsDoComponente> = {}) {
  const props: PropsDoComponente = {
    metricas: METRICAS,
    metricasErro: false,
    onRetryMetricas: vi.fn(),
    ...sobrescrita,
  };
  const { AppWrapper } = createAppWrapper({ user: { nome: 'Ge', perfil: 'GESTOR' } });
  return render(<DistribuicaoDoTrabalho {...props} />, { wrapper: AppWrapper });
}

function escolher(rotulo: string): void {
  fireEvent.click(screen.getByRole('radio', { name: rotulo }));
}

describe('DistribuicaoDoTrabalho', () => {
  it('deve oferecer as opções Status, Tipo e Prioridade quando renderizado', () => {
    // Arrange
    const sobrescrita: Partial<PropsDoComponente> = { metricas: METRICAS };

    // Act
    renderizar(sobrescrita);

    // Assert
    const opcoes = screen.getAllByRole('radio').map((opcao) => opcao.textContent);
    expect(opcoes).toEqual(['Status (selecionada)', 'Tipo', 'Prioridade']);
  });

  it('deve marcar Status como escolhida quando renderizado', () => {
    // Arrange
    const sobrescrita: Partial<PropsDoComponente> = { metricas: METRICAS };

    // Act
    renderizar(sobrescrita);

    // Assert
    expect(screen.getByRole('radio', { name: /Status/ }).getAttribute('aria-checked')).toBe('true');
  });

  it('deve mostrar as três partes com as quantidades das métricas quando a visão é status', () => {
    // Arrange
    const sobrescrita: Partial<PropsDoComponente> = { metricas: METRICAS };

    // Act
    renderizar(sobrescrita);

    // Assert
    const itens = screen.getAllByRole('listitem').map((item) => item.textContent);
    expect(itens).toEqual(['A fazer3', 'Em andamento4', 'Em validação2']);
  });

  it('deve não chamar listar quando a visão é status', () => {
    // Arrange
    const sobrescrita: Partial<PropsDoComponente> = { metricas: METRICAS };

    // Act
    renderizar(sobrescrita);

    // Assert
    expect(listar).toHaveBeenCalledTimes(0);
  });

  it('deve não repetir o total de abertas no bloco quando a visão é status', () => {
    // Arrange
    const sobrescrita: Partial<PropsDoComponente> = { metricas: METRICAS };

    // Act
    renderizar(sobrescrita);

    // Assert
    expect(screen.queryByText(/\d+ em aberto/)).toBeNull();
  });

  it('deve levar cada parte de status à listagem filtrada quando renderizado', () => {
    // Arrange
    const sobrescrita: Partial<PropsDoComponente> = { metricas: METRICAS };

    // Act
    renderizar(sobrescrita);

    // Assert
    expect(screen.getByRole('link', { name: /A fazer/ }).getAttribute('href')).toBe(
      '/app/solicitacoes?emAberto=true&status=A_FAZER',
    );
  });

  it('deve chamar listar uma vez por tipo quando Tipo é escolhido', async () => {
    // Arrange
    renderizar();

    // Act
    escolher('Tipo');

    // Assert
    await screen.findByText('11');
    expect(listar.mock.calls.map(([filtros]) => filtros)).toEqual(
      ['REPARO', 'INSPECAO', 'REENGENHARIA', 'CRIACAO'].map((tipo) => ({
        emAberto: true,
        tipo,
        page: 0,
        size: 1,
      })),
    );
  });

  it('deve mostrar as quantidades por tipo quando Tipo é escolhido', async () => {
    // Arrange
    renderizar();

    // Act
    escolher('Tipo');

    // Assert
    await screen.findByText('11');
    const itens = screen.getAllByRole('listitem').map((item) => item.textContent);
    expect(itens).toEqual(['Reparo11', 'Inspeção8', 'Reengenharia6', 'Criação de modelo5']);
  });

  it('deve levar cada tipo à listagem filtrada quando Tipo é escolhido', async () => {
    // Arrange
    renderizar();

    // Act
    escolher('Tipo');

    // Assert
    const link = await screen.findByRole('link', { name: /Reparo/ });
    expect(link.getAttribute('href')).toBe('/app/solicitacoes?emAberto=true&tipo=REPARO');
  });

  it('deve chamar listar uma vez por prioridade quando Prioridade é escolhida', async () => {
    // Arrange
    renderizar();

    // Act
    escolher('Prioridade');

    // Assert
    await screen.findByText('41');
    expect(listar.mock.calls.map(([filtros]) => filtros)).toEqual(
      ['URGENTE', 'ALTA', 'MEDIA', 'BAIXA'].map((prioridade) => ({
        emAberto: true,
        prioridade,
        page: 0,
        size: 1,
      })),
    );
  });

  it('deve mostrar as quantidades de cada prioridade quando Prioridade é escolhida', async () => {
    // Arrange
    renderizar();

    // Act
    escolher('Prioridade');

    // Assert
    await screen.findByText('Urgente');
    const itens = screen.getAllByRole('listitem').map((item) => item.textContent);
    expect(itens).toEqual(['Urgente41', 'Alta32', 'Média23', 'Baixa14']);
  });

  it('deve levar cada prioridade à listagem filtrada quando Prioridade é escolhida', async () => {
    // Arrange
    renderizar();

    // Act
    escolher('Prioridade');

    // Assert
    const link = await screen.findByRole('link', { name: /Urgente/ });
    expect(link.getAttribute('href')).toBe('/app/solicitacoes?emAberto=true&prioridade=URGENTE');
  });

  it('deve mostrar as três partes com quantidade zero quando todas as quantidades são zero', () => {
    // Arrange
    const zeradas = {
      solicitacoesPorStatus: { A_FAZER: 0, EM_ANDAMENTO: 0, EM_VALIDACAO: 0 },
    } as unknown as MetricasResponse;

    // Act
    renderizar({ metricas: zeradas });

    // Assert
    const itens = screen.getAllByRole('listitem').map((item) => item.textContent);
    expect(itens).toEqual(['A fazer0', 'Em andamento0', 'Em validação0']);
  });

  it('deve não renderizar tabela quando renderizado', () => {
    // Arrange
    const sobrescrita: Partial<PropsDoComponente> = { metricas: METRICAS };

    // Act
    renderizar(sobrescrita);

    // Assert
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('deve ter um único h2 quando renderizado', () => {
    // Arrange
    const sobrescrita: Partial<PropsDoComponente> = { metricas: METRICAS };

    // Act
    renderizar(sobrescrita);

    // Assert
    const titulos = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(titulos).toEqual(['Trabalho em aberto']);
  });

  it('deve mostrar carregando com role status quando as métricas são indefinidas', () => {
    // Arrange
    const sobrescrita: Partial<PropsDoComponente> = { metricas: undefined };

    // Act
    renderizar(sobrescrita);

    // Assert
    expect(screen.getByRole('status').textContent).toBe('Carregando a distribuição...');
  });

  it('deve manter o controle visível quando as métricas são indefinidas', () => {
    // Arrange
    const sobrescrita: Partial<PropsDoComponente> = { metricas: undefined };

    // Act
    renderizar(sobrescrita);

    // Assert
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('deve mostrar o erro quando as métricas falharam', () => {
    // Arrange
    const sobrescrita: Partial<PropsDoComponente> = { metricas: undefined, metricasErro: true };

    // Act
    renderizar(sobrescrita);

    // Assert
    expect(screen.getByRole('alert').textContent).toContain(
      'Não foi possível carregar o trabalho em aberto',
    );
  });

  it('deve chamar onRetryMetricas quando Tentar novamente é acionado na visão status', () => {
    // Arrange
    const onRetryMetricas = vi.fn();
    renderizar({ metricas: undefined, metricasErro: true, onRetryMetricas });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    // Assert
    expect(onRetryMetricas).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar carregando enquanto as contagens por tipo não chegam quando Tipo é escolhido', () => {
    // Arrange
    listar.mockImplementation(() => new Promise(() => {}));
    renderizar();

    // Act
    escolher('Tipo');

    // Assert
    expect(screen.getByRole('status').textContent).toBe('Carregando a distribuição...');
  });

  it('deve mostrar o erro quando a consulta por tipo falha', async () => {
    // Arrange
    listar.mockRejectedValue(new Error('falha'));
    renderizar();

    // Act
    escolher('Tipo');

    // Assert
    const alerta = await screen.findByRole('alert');
    expect(alerta.textContent).toContain('Não foi possível carregar o trabalho em aberto');
  });

  it('deve refazer as quatro chamadas quando Tentar novamente é acionado após falha por tipo', async () => {
    // Arrange
    listar.mockRejectedValue(new Error('falha'));
    renderizar();
    escolher('Tipo');
    const botao = await screen.findByRole('button', { name: 'Tentar novamente' });

    // Act
    fireEvent.click(botao);

    // Assert
    await waitFor(() => expect(listar).toHaveBeenCalledTimes(8));
  });

  it('deve não usar classe animate quando renderizado', () => {
    // Arrange
    const sobrescrita: Partial<PropsDoComponente> = { metricas: METRICAS };

    // Act
    const { container } = renderizar(sobrescrita);

    // Assert
    expect(container.innerHTML).not.toContain('animate-');
  });
});
