/**
 * @vitest-environment jsdom
 */
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { modelosApi } from '@/features/admin/modelos/api/modelosApi';
import type { Modelo } from '@/features/admin/modelos/types/modeloTypes';
import { solicitacoesApi } from '@/features/solicitacoes/api/solicitacoesApi';
import { FilaDeAtencao } from '@/features/solicitacoes/components/FilaDeAtencao';
import type { Solicitacao } from '@/features/solicitacoes/types/solicitacaoTypes';
import { createAppWrapper } from '@tests/support/appWrapper';
import { criarSolicitacao } from '@tests/support/solicitacaoFixture';

const DIA_MS = 24 * 60 * 60 * 1000;
const TITULO_LONGO =
  'Trocar a correia dentada do eixo principal da prensa hidráulica e revisar todos os rolamentos associados';

function prazoHa(dias: number): string {
  return new Date(Date.now() - dias * DIA_MS - 60 * 60 * 1000).toISOString();
}

function criarModelo(codigo: string): Modelo {
  return {
    id: 'm1',
    codigo,
    versao: 1,
    descricao: 'Modelo',
    observacoes: null,
    fotoCapaUrl: null,
    ativo: true,
    maquina: 'Prensa',
    tipo: null,
    temPendenciaAberta: false,
    criadoEm: '2026-01-01T00:00:00Z',
    atualizadoEm: '2026-01-01T00:00:00Z',
  };
}

function criarPagina(content: Solicitacao[], totalElements: number = content.length) {
  return { content, page: 0, totalPages: 1, totalElements, size: 100 };
}

function renderizar(): void {
  const { AppWrapper } = createAppWrapper();
  render(<FilaDeAtencao />, { wrapper: AppWrapper });
}

describe('FilaDeAtencao', () => {
  let listar: MockInstance<typeof solicitacoesApi.listar>;
  let buscarPorId: MockInstance<typeof modelosApi.buscarPorId>;

  beforeEach(() => {
    listar = vi.spyOn(solicitacoesApi, 'listar');
    buscarPorId = vi.spyOn(modelosApi, 'buscarPorId');
    buscarPorId.mockResolvedValue(criarModelo('MOD-001'));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('deve mostrar a região Precisa de atenção quando a fila carrega', async () => {
    // Arrange
    listar.mockResolvedValue(
      criarPagina([criarSolicitacao({ titulo: 'Item da fila', prazoLimite: prazoHa(2) })]),
    );

    // Act
    renderizar();
    await screen.findByText('Item da fila');

    // Assert
    expect(screen.getByRole('region', { name: 'Precisa de atenção' })).toBeTruthy();
  });

  it('deve consultar a listagem uma vez quando a fila carrega', async () => {
    // Arrange
    listar.mockResolvedValue(
      criarPagina([criarSolicitacao({ titulo: 'Item da fila', prazoLimite: prazoHa(2) })]),
    );

    // Act
    renderizar();
    await screen.findByText('Item da fila');

    // Assert
    expect(listar).toHaveBeenCalledTimes(1);
  });

  it('deve listar a mais atrasada primeiro quando os itens chegam fora de ordem', async () => {
    // Arrange
    listar.mockResolvedValue(
      criarPagina([
        criarSolicitacao({ id: 'a', titulo: 'Recente', prazoLimite: prazoHa(1) }),
        criarSolicitacao({ id: 'b', titulo: 'Antiga', prazoLimite: prazoHa(9) }),
        criarSolicitacao({ id: 'c', titulo: 'Média', prazoLimite: prazoHa(4) }),
      ]),
    );

    // Act
    renderizar();

    // Assert
    const itens = await screen.findAllByRole('listitem');
    expect(itens.map((item) => item.textContent)).toEqual([
      expect.stringContaining('Antiga'),
      expect.stringContaining('Média'),
      expect.stringContaining('Recente'),
    ]);
  });

  it('deve levar a /app/solicitacoes/<id> quando o item é um link', async () => {
    // Arrange
    listar.mockResolvedValue(
      criarPagina([criarSolicitacao({ id: 'abc', titulo: 'Item', prazoLimite: prazoHa(2) })]),
    );

    // Act
    renderizar();

    // Assert
    const link = await screen.findByRole('link', { name: /Item/ });
    expect(link.getAttribute('href')).toBe('/app/solicitacoes/abc');
  });

  it('deve mostrar o título quando ele é longo', async () => {
    // Arrange
    listar.mockResolvedValue(
      criarPagina([criarSolicitacao({ titulo: TITULO_LONGO, prazoLimite: prazoHa(2) })]),
    );

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText(TITULO_LONGO)).toBeTruthy();
  });

  it('deve mostrar os nomes quando a API traz os responsáveis', async () => {
    // Arrange
    listar.mockResolvedValue(
      criarPagina([
        criarSolicitacao({
          prazoLimite: prazoHa(2),
          responsavelIds: ['u1', 'u2'],
          responsaveis: [
            { id: 'u1', nome: 'Ana' },
            { id: 'u2', nome: 'Bruno' },
          ],
        }),
      ]),
    );

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Ana, Bruno')).toBeTruthy();
  });

  it('deve mostrar a contagem de responsáveis quando a API não traz os nomes', async () => {
    // Arrange
    listar.mockResolvedValue(
      criarPagina([
        criarSolicitacao({
          prazoLimite: prazoHa(2),
          responsavelIds: [
            '6f1c2d3e-aaaa-bbbb-cccc-111122223333',
            '7a1c2d3e-aaaa-bbbb-cccc-444455556666',
          ],
        }),
      ]),
    );

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('2 responsáveis')).toBeTruthy();
  });

  it('deve esconder os ids quando a API não traz os nomes dos responsáveis', async () => {
    // Arrange
    listar.mockResolvedValue(
      criarPagina([
        criarSolicitacao({
          prazoLimite: prazoHa(2),
          responsavelIds: [
            '6f1c2d3e-aaaa-bbbb-cccc-111122223333',
            '7a1c2d3e-aaaa-bbbb-cccc-444455556666',
          ],
        }),
      ]),
    );

    // Act
    renderizar();
    await screen.findByText('2 responsáveis');

    // Assert
    expect(screen.queryByText(/6f1c2d3e/)).toBeNull();
  });

  it('deve mostrar Sem responsável quando não há responsáveis', async () => {
    // Arrange
    listar.mockResolvedValue(
      criarPagina([criarSolicitacao({ prazoLimite: prazoHa(2), responsavelIds: [] })]),
    );

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Sem responsável')).toBeTruthy();
  });

  it('deve mostrar a etapa quando o item é listado', async () => {
    // Arrange
    listar.mockResolvedValue(
      criarPagina([criarSolicitacao({ prazoLimite: prazoHa(2), status: 'EM_ANDAMENTO' })]),
    );

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Em andamento')).toBeTruthy();
  });

  it('deve mostrar Atrasada há 2 d quando o prazo passou há dois dias', async () => {
    // Arrange
    listar.mockResolvedValue(criarPagina([criarSolicitacao({ prazoLimite: prazoHa(2) })]));

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Atrasada há 2 d')).toBeTruthy();
  });

  it('deve omitir o atraso quando a solicitação não tem prazo', async () => {
    // Arrange
    listar.mockResolvedValue(criarPagina([criarSolicitacao({ titulo: 'Sem prazo' })]));

    // Act
    renderizar();
    await screen.findByText('Sem prazo');

    // Assert
    expect(screen.queryByText(/Atrasada há/)).toBeNull();
  });

  it('deve mostrar o código do modelo quando a busca do modelo resolve', async () => {
    // Arrange
    listar.mockResolvedValue(criarPagina([criarSolicitacao({ prazoLimite: prazoHa(2) })]));

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('MOD-001')).toBeTruthy();
  });

  it('deve buscar o modelo uma vez quando o item tem modeloId', async () => {
    // Arrange
    listar.mockResolvedValue(criarPagina([criarSolicitacao({ prazoLimite: prazoHa(2) })]));

    // Act
    renderizar();
    await screen.findByText('MOD-001');

    // Assert
    expect(buscarPorId).toHaveBeenCalledTimes(1);
  });

  it('deve buscar o modelo pelo id do item quando o item tem modeloId', async () => {
    // Arrange
    listar.mockResolvedValue(criarPagina([criarSolicitacao({ prazoLimite: prazoHa(2) })]));

    // Act
    renderizar();
    await screen.findByText('MOD-001');

    // Assert
    expect(buscarPorId).toHaveBeenCalledWith('m1');
  });

  it('deve buscar o modelo uma só vez quando dois itens têm o mesmo modelo', async () => {
    // Arrange
    listar.mockResolvedValue(
      criarPagina([
        criarSolicitacao({ id: 'a', prazoLimite: prazoHa(2) }),
        criarSolicitacao({ id: 'b', prazoLimite: prazoHa(3) }),
      ]),
    );

    // Act
    renderizar();
    await screen.findAllByText('MOD-001');

    // Assert
    expect(buscarPorId).toHaveBeenCalledTimes(1);
  });

  it('deve mostrar o código nos dois itens quando eles têm o mesmo modelo', async () => {
    // Arrange
    listar.mockResolvedValue(
      criarPagina([
        criarSolicitacao({ id: 'a', prazoLimite: prazoHa(2) }),
        criarSolicitacao({ id: 'b', prazoLimite: prazoHa(3) }),
      ]),
    );

    // Act
    renderizar();

    // Assert
    expect(await screen.findAllByText('MOD-001')).toHaveLength(2);
  });

  async function renderizarComBuscaDoModeloFalhando(): Promise<void> {
    buscarPorId.mockRejectedValue(new Error('falhou'));
    listar.mockResolvedValue(
      criarPagina([criarSolicitacao({ titulo: 'Item firme', prazoLimite: prazoHa(2) })]),
    );
    renderizar();
    await screen.findByText('Item firme');
    await waitFor(() => expect(buscarPorId).toHaveBeenCalledTimes(1));
    await act(async () => {
      await new Promise<void>((resolver) => setTimeout(resolver, 0));
    });
  }

  it('deve manter o título do item quando a busca do modelo falha', async () => {
    // Arrange
    const titulo = 'Item firme';

    // Act
    await renderizarComBuscaDoModeloFalhando();

    // Assert
    expect(screen.getByRole('link', { name: new RegExp(titulo) })).not.toBeNull();
  });

  it('deve não mostrar o código do modelo quando a busca do modelo falha', async () => {
    // Arrange
    const codigo = 'MOD-001';

    // Act
    await renderizarComBuscaDoModeloFalhando();

    // Assert
    expect(screen.queryByText(codigo)).toBeNull();
  });

  it('deve manter a fila sem alerta quando a busca do modelo falha', async () => {
    // Arrange
    const papel = 'alert';

    // Act
    await renderizarComBuscaDoModeloFalhando();

    // Assert
    expect(screen.queryByRole(papel)).toBeNull();
  });

  it('deve manter o item sem buscar o modelo quando não há modeloId', async () => {
    // Arrange
    listar.mockResolvedValue(
      criarPagina([
        criarSolicitacao({ titulo: 'Sem modelo', modeloId: undefined, prazoLimite: prazoHa(2) }),
      ]),
    );

    // Act
    renderizar();
    await screen.findByText('Sem modelo');

    // Assert
    expect(buscarPorId).not.toHaveBeenCalled();
  });

  it('deve listar só 5 itens quando o total passa do carregado', async () => {
    // Arrange
    const cem = Array.from({ length: 100 }, (_, i) =>
      criarSolicitacao({ id: `s${i}`, titulo: `Item ${i}`, prazoLimite: prazoHa(2 + i / 1000) }),
    );
    listar.mockResolvedValue(criarPagina(cem, 130));

    // Act
    renderizar();

    // Assert
    expect(await screen.findAllByRole('listitem')).toHaveLength(5);
  });

  it.each([
    { total: 130, nome: 'plural' },
    { total: 1, nome: 'singular' },
  ])('deve não dizer o total de atrasadas quando o total é $total ($nome)', async ({ total }) => {
    // Arrange
    const itens = Array.from({ length: Math.min(total, 100) }, (_, i) =>
      criarSolicitacao({ id: `s${i}`, titulo: `Item ${i}`, prazoLimite: prazoHa(2) }),
    );
    listar.mockResolvedValue(criarPagina(itens, total));

    // Act
    renderizar();
    const lista = await screen.findByRole('list');
    const regiao = screen.getByRole('region', { name: 'Precisa de atenção' });

    // Assert
    const foraDosItens = (regiao.textContent ?? '').replace(lista.textContent ?? '', '');
    expect(foraDosItens).not.toMatch(new RegExp(`\\b${total}\\b`));
  });

  it('deve apontar Ver todas para a listagem de atrasadas em aberto', async () => {
    // Arrange
    listar.mockResolvedValue(criarPagina([criarSolicitacao({ prazoLimite: prazoHa(2) })]));

    // Act
    renderizar();

    // Assert
    const link = await screen.findByRole('link', { name: 'Ver todas' });
    expect(link.getAttribute('href')).toBe('/app/solicitacoes?atrasada=true&emAberto=true');
  });

  it('deve mostrar Nada atrasado quando a fila está vazia', async () => {
    // Arrange
    listar.mockResolvedValue(criarPagina([]));

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Nada atrasado')).toBeTruthy();
  });

  it('deve explicar que nada passou do prazo quando a fila está vazia', async () => {
    // Arrange
    listar.mockResolvedValue(criarPagina([]));

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Nenhuma solicitação em aberto passou do prazo.')).toBeTruthy();
  });

  it('deve manter o título Precisa de atenção quando a fila está vazia', async () => {
    // Arrange
    listar.mockResolvedValue(criarPagina([]));

    // Act
    renderizar();
    await screen.findByText('Nada atrasado');

    // Assert
    expect(screen.getByRole('heading', { name: 'Precisa de atenção' })).toBeTruthy();
  });

  it('deve omitir a lista quando a fila está vazia', async () => {
    // Arrange
    listar.mockResolvedValue(criarPagina([]));

    // Act
    renderizar();
    await screen.findByText('Nada atrasado');

    // Assert
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('deve expor role status quando a fila está carregando', () => {
    // Arrange
    listar.mockReturnValue(new Promise(() => {}));

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('deve mostrar o texto de carregamento quando a fila está carregando', () => {
    // Arrange
    listar.mockReturnValue(new Promise(() => {}));

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Carregando a fila de atenção...')).toBeTruthy();
  });

  it('deve expor role alert quando a listagem falha', async () => {
    // Arrange
    listar.mockRejectedValue(new Error('falhou'));

    // Act
    renderizar();

    // Assert
    expect(await screen.findByRole('alert')).toBeTruthy();
  });

  it('deve mostrar o título do erro quando a listagem falha', async () => {
    // Arrange
    listar.mockRejectedValue(new Error('falhou'));

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Não foi possível carregar a fila de atenção')).toBeTruthy();
  });

  it('deve mostrar a orientação do erro quando a listagem falha', async () => {
    // Arrange
    listar.mockRejectedValue(new Error('falhou'));

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Verifique sua conexão com o servidor.')).toBeTruthy();
  });

  it('deve mostrar a fila quando Tentar novamente é acionado', async () => {
    // Arrange
    listar.mockRejectedValueOnce(new Error('falhou'));
    listar.mockResolvedValue(
      criarPagina([criarSolicitacao({ titulo: 'Item recuperado', prazoLimite: prazoHa(2) })]),
    );
    renderizar();
    const botao = await screen.findByRole('button', { name: 'Tentar novamente' });

    // Act
    await userEvent.click(botao);

    // Assert
    expect(await screen.findByText('Item recuperado')).toBeTruthy();
  });

  it('deve refazer a chamada quando Tentar novamente é acionado', async () => {
    // Arrange
    listar.mockRejectedValueOnce(new Error('falhou'));
    listar.mockResolvedValue(
      criarPagina([criarSolicitacao({ titulo: 'Item recuperado', prazoLimite: prazoHa(2) })]),
    );
    renderizar();
    const botao = await screen.findByRole('button', { name: 'Tentar novamente' });

    // Act
    await userEvent.click(botao);
    await screen.findByText('Item recuperado');

    // Assert
    expect(listar).toHaveBeenCalledTimes(2);
  });
});
