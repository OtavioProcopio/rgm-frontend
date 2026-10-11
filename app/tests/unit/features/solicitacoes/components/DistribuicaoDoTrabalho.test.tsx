/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';

import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';
import { DistribuicaoDoTrabalho } from '@/features/solicitacoes/components/DistribuicaoDoTrabalho';
import type { MetricasResponse } from '@/features/solicitacoes/types/solicitacaoTypes';

const METRICAS = {
  solicitacoesPorStatus: {
    A_FAZER: 3,
    EM_ANDAMENTO: 4,
    EM_VALIDACAO: 2,
    CONCLUIDA: 100,
    CANCELADA: 100,
  },
  emAbertoPorTipo: { REPARO: 11, INSPECAO: 8, REENGENHARIA: 6, CRIACAO: 5 },
  emAbertoPorPrioridade: { URGENTE: 41, ALTA: 32, MEDIA: 23, BAIXA: 14, SEM_PRIORIDADE: 7 },
} as unknown as MetricasResponse;

let listar: MockInstance<typeof solicitacoesApi.listar>;

beforeEach(() => {
  listar = vi.spyOn(solicitacoesApi, 'listar');
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

  it('deve não chamar listar quando Tipo é escolhido', () => {
    // Arrange
    renderizar();

    // Act
    escolher('Tipo');

    // Assert
    expect(listar).toHaveBeenCalledTimes(0);
  });

  it('deve mostrar as quantidades por tipo quando Tipo é escolhido', () => {
    // Arrange
    renderizar();

    // Act
    escolher('Tipo');

    // Assert
    const itens = screen.getAllByRole('listitem').map((item) => item.textContent);
    expect(itens).toEqual(['Reparo11', 'Inspeção8', 'Reengenharia6', 'Criação de modelo5']);
  });

  it('deve levar cada tipo à listagem filtrada quando Tipo é escolhido', () => {
    // Arrange
    renderizar();

    // Act
    escolher('Tipo');

    // Assert
    const link = screen.getByRole('link', { name: /Reparo/ });
    expect(link.getAttribute('href')).toBe('/app/solicitacoes?emAberto=true&tipo=REPARO');
  });

  it('deve mostrar as quantidades de cada prioridade, com sem prioridade, quando Prioridade é escolhida', () => {
    // Arrange
    renderizar();

    // Act
    escolher('Prioridade');

    // Assert
    const itens = screen.getAllByRole('listitem').map((item) => item.textContent);
    expect(itens).toEqual(['Urgente41', 'Alta32', 'Média23', 'Baixa14', 'Sem prioridade7']);
  });

  it('deve levar cada prioridade à listagem filtrada quando Prioridade é escolhida', () => {
    // Arrange
    renderizar();

    // Act
    escolher('Prioridade');

    // Assert
    const link = screen.getByRole('link', { name: /Urgente/ });
    expect(link.getAttribute('href')).toBe('/app/solicitacoes?emAberto=true&prioridade=URGENTE');
  });

  it('deve não oferecer link para sem prioridade quando Prioridade é escolhida', () => {
    // Arrange
    renderizar();

    // Act
    escolher('Prioridade');

    // Assert
    expect(screen.queryByRole('link', { name: /Sem prioridade/ })).toBeNull();
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

  it('deve mostrar o erro das métricas quando Tipo é escolhido e as métricas falharam', () => {
    // Arrange
    renderizar({ metricas: undefined, metricasErro: true });

    // Act
    escolher('Tipo');

    // Assert
    expect(screen.getByRole('alert').textContent).toContain(
      'Não foi possível carregar o trabalho em aberto',
    );
  });

  it('deve refazer só a consulta das métricas quando Tentar novamente é acionado na visão tipo', () => {
    // Arrange
    const onRetryMetricas = vi.fn();
    renderizar({ metricas: undefined, metricasErro: true, onRetryMetricas });
    escolher('Tipo');

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    // Assert
    expect(onRetryMetricas).toHaveBeenCalledTimes(1);
    expect(listar).toHaveBeenCalledTimes(0);
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
