/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';
import { criarIndicadoresDeGestao } from '@tests/support/indicadoresDeGestaoFixture';

import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';
import { IndicadoresDeGestao } from '@/features/solicitacoes/components/gestao/IndicadoresDeGestao';
import type { IndicadoresDeGestao as Dados } from '@/features/solicitacoes/types/solicitacaoTypes';

let obter: MockInstance<typeof solicitacoesApi.obterIndicadoresDeGestao>;

beforeEach(() => {
  obter = vi.spyOn(solicitacoesApi, 'obterIndicadoresDeGestao');
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function mostrar(dados: Dados, perfil: 'GESTOR' | 'OPERADOR' = 'GESTOR') {
  obter.mockResolvedValue(dados);
  const { AppWrapper } = createAppWrapper({ user: { nome: 'Ge', perfil } });
  render(<IndicadoresDeGestao dias={30} />, { wrapper: AppWrapper });
}

const bloco = (nome: string) => screen.findByRole('region', { name: nome });

describe('IndicadoresDeGestao — prazo', () => {
  it('deve mostrar a porcentagem e a conta quando há concluídas', async () => {
    // Arrange
    await mostrar(criarIndicadoresDeGestao());

    // Act
    const prazo = await bloco('Prazo cumprido');

    // Assert
    expect(within(prazo).getByText('84%')).toBeDefined();
    expect(within(prazo).getByText(/21 de 25 concluídas dentro do prazo/)).toBeDefined();
  });

  it('deve dizer em texto que está abaixo da meta quando o prazo é 84%', async () => {
    // Arrange
    await mostrar(criarIndicadoresDeGestao());

    // Act
    const prazo = await bloco('Prazo cumprido');

    // Assert
    expect(within(prazo).getByText(/abaixo da meta de 90%/)).toBeDefined();
  });

  it('deve avisar das concluídas sem prioridade quando há', async () => {
    // Arrange
    await mostrar(criarIndicadoresDeGestao());

    // Act
    const prazo = await bloco('Prazo cumprido');

    // Assert
    expect(within(prazo).getByText(/2 concluída\(s\) sem prioridade/)).toBeDefined();
  });

  it('deve dizer que não há base em vez de um número quando não há concluídas', async () => {
    // Arrange
    const base = criarIndicadoresDeGestao();
    await mostrar({
      ...base,
      prazo: { ...base.prazo, concluidasComPrioridade: 0, noPrazo: 0, percentualNoPrazo: null },
    });

    // Act
    const prazo = await bloco('Prazo cumprido');

    // Assert
    expect(within(prazo).getByText('Sem concluídas no período')).toBeDefined();
    expect(within(prazo).queryByText(/\d+%$/)).toBeNull();
  });
});

describe('IndicadoresDeGestao — resolução, idade e etapas', () => {
  it('deve mostrar mediana e p90 com a quantidade de concluídas', async () => {
    // Arrange
    await mostrar(criarIndicadoresDeGestao());

    // Act
    const resolucao = await bloco('Tempo de resolução');

    // Assert
    expect(within(resolucao).getByText('2 h')).toBeDefined();
    expect(within(resolucao).getByText('2 d')).toBeDefined();
    expect(within(resolucao).getByText(/22 concluída/)).toBeDefined();
  });

  it('deve levar cada faixa de idade à lista de abertas filtrada', async () => {
    // Arrange
    await mostrar(criarIndicadoresDeGestao());

    // Act
    const idade = await bloco('Idade das abertas');

    // Assert
    const href = within(idade)
      .getByRole('link', { name: /Mais de 3 dias/ })
      .getAttribute('href');
    expect(href).toMatch(/^\/app\/solicitacoes\?emAberto=true&criadaEmFim=/);
  });

  it('deve mostrar as abertas sem responsável', async () => {
    // Arrange
    await mostrar(criarIndicadoresDeGestao());

    // Act
    const idade = await bloco('Idade das abertas');

    // Assert
    expect(within(idade).getByText('6 aberta(s) sem responsável.')).toBeDefined();
  });

  it('deve nomear o gargalo e mostrar "sem dados" na etapa vazia', async () => {
    // Arrange
    await mostrar(criarIndicadoresDeGestao());

    // Act
    const etapas = await bloco('Onde o tempo se perde');

    // Assert
    expect(within(etapas).getByText(/se concentra em "Espera até iniciar"/)).toBeDefined();
    expect(within(etapas).getByText('sem dados')).toBeDefined();
  });

  it('deve mostrar a devolução com os dois números', async () => {
    // Arrange
    await mostrar(criarIndicadoresDeGestao());

    // Act
    const etapas = await bloco('Onde o tempo se perde');

    // Assert
    expect(
      within(etapas).getByText(/2 devolvida\(s\) de 12 enviada\(s\) para validação/),
    ).toBeDefined();
  });

  it('deve dizer que nada foi enviado quando não houve envio para validação', async () => {
    // Arrange
    const base = criarIndicadoresDeGestao();
    await mostrar({
      ...base,
      devolucao: { enviadasParaValidacao: 0, devolucoes: 0, taxa: null },
    });

    // Act
    const etapas = await bloco('Onde o tempo se perde');

    // Assert
    expect(within(etapas).getByText('Nada foi enviado para validação no período.')).toBeDefined();
  });
});

describe('IndicadoresDeGestao — máquina, reincidentes e carga', () => {
  it('deve levar a máquina à lista filtrada', async () => {
    // Arrange
    await mostrar(criarIndicadoresDeGestao());

    // Act
    const maquinas = await bloco('Por máquina');

    // Assert
    const link = within(maquinas).getByRole('link', { name: /FBOX/ });
    expect(link.getAttribute('href')).toBe('/app/solicitacoes?maquina=FBOX');
  });

  it('deve levar o modelo reincidente à lista filtrada', async () => {
    // Arrange
    await mostrar(criarIndicadoresDeGestao());

    // Act
    const reincidentes = await bloco('Modelos reincidentes');

    // Assert
    const link = within(reincidentes).getByRole('link', { name: /MDL-1 v2/ });
    expect(link.getAttribute('href')).toContain('modeloId=6dacdfac');
  });

  it('deve dizer que não há reincidentes quando a lista vem vazia', async () => {
    // Arrange
    await mostrar(criarIndicadoresDeGestao({ reincidentes: [] }));

    // Act
    const reincidentes = await bloco('Modelos reincidentes');

    // Assert
    expect(within(reincidentes).getByText('Nenhum modelo reincidente no período.')).toBeDefined();
  });

  it('deve avisar que a soma passa do total quando um pedido tem dois responsáveis', async () => {
    // Arrange
    await mostrar(criarIndicadoresDeGestao());

    // Act
    const carga = await bloco('Carga por responsável');

    // Assert
    expect(within(carga).getByText(/A soma \(11\) passa de 10 solicitações/)).toBeDefined();
  });

  it('deve não avisar da soma quando ela é igual ao total', async () => {
    // Arrange
    const base = criarIndicadoresDeGestao();
    await mostrar({ ...base, carga: { ...base.carga, solicitacoesDistintas: 11 } });

    // Act
    const carga = await bloco('Carga por responsável');

    // Assert
    expect(within(carga).queryByText(/A soma/)).toBeNull();
  });

  it('deve levar o responsável à lista das abertas dele', async () => {
    // Arrange
    await mostrar(criarIndicadoresDeGestao());

    // Act
    const carga = await bloco('Carga por responsável');

    // Assert
    const link = within(carga).getByRole('link', { name: /Ana/ });
    expect(link.getAttribute('href')).toContain('responsavelId=f55804cf');
  });

  it('deve dizer que não há máquina quando a lista vem vazia', async () => {
    // Arrange
    await mostrar(criarIndicadoresDeGestao({ porMaquina: [] }));

    // Act
    const maquinas = await bloco('Por máquina');

    // Assert
    expect(
      within(maquinas).getByText('Nenhuma máquina com solicitações no período.'),
    ).toBeDefined();
  });
});

describe('IndicadoresDeGestao — operador', () => {
  it('deve não pedir os indicadores quando o perfil é operador', async () => {
    // Arrange
    obter.mockResolvedValue(criarIndicadoresDeGestao());
    const { AppWrapper } = createAppWrapper({ user: { nome: 'Op', perfil: 'OPERADOR' } });

    // Act
    render(<IndicadoresDeGestao dias={30} />, { wrapper: AppWrapper });

    // Assert
    expect(obter).not.toHaveBeenCalled();
  });
});
