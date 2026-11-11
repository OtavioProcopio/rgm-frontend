/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createAppWrapper } from '@tests/support/appWrapper';
import { criarFoto, criarModelos } from '@tests/support/modeloFixture';

import { galeriaApi } from '@/features/admin/modelos/api/galeriaApi';
import { maquinasApi } from '@/features/admin/modelos/api/maquinasApi';
import { modelosApi } from '@/features/admin/modelos/api/modelosApi';
import { tiposModeloApi } from '@/features/admin/modelos/api/tiposModeloApi';
import type { Modelo, ModelosFilters } from '@/features/admin/modelos/types/modeloTypes';
import { ModelosPage } from '@/features/modelos/pages/ModelosPage';
import { ApiError } from '@/shared/api/apiError';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const agora = '2026-01-01T00:00:00Z';

/** 300 modelos em ordem de código: pares RESINA/FBOX, ímpares COQUILHA_ACO/LINHA 2; o 7º é inativo. */
const CATALOGO: Modelo[] = criarModelos(300).map((modelo, i) => ({
  ...modelo,
  tipo: i % 2 === 0 ? 'RESINA' : 'COQUILHA_ACO',
  maquina: i % 2 === 0 ? 'FBOX' : 'LINHA 2',
  ativo: i !== 6,
}));

type Consulta = Omit<ModelosFilters, 'page' | 'size' | 'ordem'>;

function filtrar(consulta: Consulta): Modelo[] {
  return CATALOGO.filter(
    (m) =>
      (!consulta.tipo || m.tipo === consulta.tipo) &&
      (!consulta.maquina || m.maquina === consulta.maquina) &&
      (consulta.ativo === undefined || m.ativo === consulta.ativo) &&
      (!consulta.q || m.descricao.toLowerCase().includes(consulta.q.toLowerCase())),
  );
}

function simularServidor() {
  const listar = vi.spyOn(modelosApi, 'listar').mockImplementation(async (filtros) => {
    const { page = 0, size = 20, ...consulta } = filtros;
    const todos = filtrar(consulta);
    return {
      content: todos.slice(page * size, (page + 1) * size),
      page,
      size,
      totalElements: todos.length,
      totalPages: Math.ceil(todos.length / size),
    };
  });
  const contagens = vi.spyOn(modelosApi, 'contagens').mockImplementation(async (consulta) => {
    const sem = (campo: 'tipo' | 'maquina') => filtrar({ ...consulta, [campo]: undefined });
    const contar = (lista: Modelo[], campo: 'tipo' | 'maquina') =>
      Object.entries(
        lista.reduce<Record<string, number>>((acc, m) => {
          const chave = String(m[campo]);
          acc[chave] = (acc[chave] ?? 0) + 1;
          return acc;
        }, {}),
      );
    return {
      total: filtrar(consulta).length,
      porTipo: contar(sem('tipo'), 'tipo').map(([tipo, total]) => ({ tipo, total })),
      porMaquina: contar(sem('maquina'), 'maquina').map(([maquina, total]) => ({ maquina, total })),
    };
  });
  const posicao = vi.spyOn(modelosApi, 'posicao').mockImplementation(async (id, consulta) => {
    const indice = filtrar(consulta).findIndex((m) => m.id === id);
    return { posicao: indice < 0 ? null : indice + 1, total: filtrar(consulta).length };
  });
  const buscarPorId = vi.spyOn(modelosApi, 'buscarPorId').mockImplementation(async (id) => {
    const modelo = CATALOGO.find((m) => m.id === id);
    if (!modelo) throw new ApiError({ status: 404, message: 'não encontrado' });
    return modelo;
  });
  vi.spyOn(galeriaApi, 'listar').mockResolvedValue([]);
  vi.spyOn(tiposModeloApi, 'listar').mockResolvedValue([
    { id: 't1', nome: 'RESINA', ativo: true, criadoEm: agora, atualizadoEm: agora },
    { id: 't2', nome: 'COQUILHA_ACO', ativo: true, criadoEm: agora, atualizadoEm: agora },
  ]);
  vi.spyOn(maquinasApi, 'listar').mockResolvedValue([
    { id: 'q1', nome: 'FBOX', ativo: true, criadoEm: agora, atualizadoEm: agora },
    { id: 'q2', nome: 'LINHA 2', ativo: true, criadoEm: agora, atualizadoEm: agora },
  ]);
  return { listar, contagens, posicao, buscarPorId };
}

function abrir(endereco = '/') {
  const { AppWrapper } = createAppWrapper({ initialEntries: [endereco] });
  return render(<ModelosPage />, { wrapper: AppWrapper });
}

const destaque = () => screen.getByRole('region', { name: 'Modelo em destaque' });
const titulo = () => within(destaque()).getByRole('heading', { level: 2 }).textContent;
const lista = () => screen.getByRole('complementary', { name: 'Lista de modelos' });

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('ModelosPage — abertura e filtros', () => {
  it('deve destacar o primeiro modelo e listar o primeiro bloco com o total do filtro', async () => {
    // Arrange
    const servidor = simularServidor();

    // Act
    abrir();

    // Assert
    await waitFor(() => expect(titulo()).toBe('Modelo 0'));
    expect(within(lista()).getAllByRole('link')).toHaveLength(20);
    expect(screen.getByText('299 modelos · mostrando 20')).toBeDefined();
    expect(screen.getByText('1 de 299')).toBeDefined();
    expect(servidor.listar).toHaveBeenCalledWith(
      expect.objectContaining({ ativo: true, ordem: 'CODIGO', page: 0, size: 20 }),
    );
  });

  it('deve mostrar as contagens nos botões e desabilitar o que não traria nada', async () => {
    // Arrange
    simularServidor();
    abrir('/?tipo=RESINA');

    // Act / Assert: RESINA só existe em FBOX, então com RESINA a máquina LINHA 2 não traz nada (e não é a escolhida)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'FBOX (149 modelos)' })).toBeDefined(),
    );
    expect(
      (screen.getByRole('button', { name: 'LINHA 2 (0 modelos)' }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it('deve pedir só o tipo escolhido ao servidor e voltar ao primeiro modelo do novo filtro', async () => {
    // Arrange
    const servidor = simularServidor();
    abrir();
    await waitFor(() => expect(titulo()).toBe('Modelo 0'));

    // Act
    await userEvent.click(await screen.findByRole('button', { name: /^Coquilha em Aço/ }));

    // Assert
    await waitFor(() => expect(titulo()).toBe('Modelo 1'));
    expect(servidor.listar).toHaveBeenLastCalledWith(
      expect.objectContaining({ tipo: 'COQUILHA_ACO', page: 0 }),
    );
    expect(screen.getByText('150 modelos · mostrando 20')).toBeDefined();
  });

  it('deve somar o tipo, a máquina e a busca na mesma consulta', async () => {
    // Arrange
    const servidor = simularServidor();
    abrir('/?tipo=RESINA&maquina=FBOX&q=Modelo 1');

    // Assert
    await waitFor(() =>
      expect(servidor.listar).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: 'RESINA',
          maquina: 'FBOX',
          maquinaExata: true,
          q: 'Modelo 1',
        }),
      ),
    );
  });

  it('deve mandar a busca de 2 letras ou mais ao servidor e esperar o fim da digitação', async () => {
    // Arrange
    const servidor = simularServidor();
    abrir();
    await waitFor(() => expect(titulo()).toBe('Modelo 0'));

    // Act
    await userEvent.type(screen.getByLabelText('Buscar por código ou descrição'), 'Modelo 29');

    // Assert
    await waitFor(() => expect(titulo()).toBe('Modelo 29'));
    expect(servidor.listar).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'Modelo 29' }));
  });

  it('deve incluir os inativos só quando "Mostrar inativos" está marcado', async () => {
    // Arrange
    const servidor = simularServidor();
    abrir();
    await waitFor(() => expect(titulo()).toBe('Modelo 0'));

    // Act
    await userEvent.click(screen.getByLabelText('Mostrar inativos'));

    // Assert
    await waitFor(() =>
      expect(servidor.listar).toHaveBeenLastCalledWith(
        expect.not.objectContaining({ ativo: true }),
      ),
    );
    await waitFor(() => expect(screen.getByText('300 modelos · mostrando 20')).toBeDefined());
  });

  it('deve limpar os filtros e voltar ao catálogo inteiro', async () => {
    // Arrange
    simularServidor();
    abrir('/?tipo=RESINA');
    await waitFor(() => expect(screen.getByText('149 modelos · mostrando 20')).toBeDefined());

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    // Assert
    await waitFor(() => expect(screen.getByText('299 modelos · mostrando 20')).toBeDefined());
  });
});

describe('ModelosPage — navegação entre modelos', () => {
  it('deve levar o destaque ao próximo e ao anterior sem nova consulta ao servidor', async () => {
    // Arrange
    const servidor = simularServidor();
    abrir();
    await waitFor(() => expect(titulo()).toBe('Modelo 0'));
    const consultas = servidor.listar.mock.calls.length;

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Próximo/ }));
    await waitFor(() => expect(titulo()).toBe('Modelo 1'));
    await userEvent.click(screen.getByRole('button', { name: /Anterior/ }));

    // Assert
    await waitFor(() => expect(titulo()).toBe('Modelo 0'));
    expect(servidor.listar.mock.calls.length).toBe(consultas);
  });

  it('deve carregar o bloco seguinte e destacar o 21º quando Próximo passa do 20º do bloco', async () => {
    // Arrange
    const servidor = simularServidor();
    abrir('/?modelo=id-020');
    await waitFor(() => expect(titulo()).toBe('Modelo 20'));

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Próximo/ }));

    // Assert
    await waitFor(() => expect(titulo()).toBe('Modelo 21'));
    expect(servidor.listar).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 }));
    expect(within(lista()).getAllByRole('link')).toHaveLength(40);
  });

  it('deve desabilitar Anterior no primeiro modelo', async () => {
    simularServidor();
    abrir();
    await waitFor(() => expect(titulo()).toBe('Modelo 0'));

    expect((screen.getByRole('button', { name: /Anterior/ }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('deve trocar o destaque com as setas do teclado fora de campos', async () => {
    // Arrange
    simularServidor();
    abrir();
    await waitFor(() => expect(titulo()).toBe('Modelo 0'));

    // Act
    await userEvent.keyboard('{ArrowRight}');

    // Assert
    await waitFor(() => expect(titulo()).toBe('Modelo 1'));
  });

  it('deve manter o destaque ao clicar num item e deixar o item como link do modelo', async () => {
    // Arrange
    simularServidor();
    abrir();
    await waitFor(() => expect(titulo()).toBe('Modelo 0'));
    const item = within(lista()).getByRole('link', { name: /Modelo 3,/ });

    // Assert
    expect(item.getAttribute('href')).toContain('modelo=id-003');

    // Act
    await userEvent.click(item);

    // Assert
    await waitFor(() => expect(titulo()).toBe('Modelo 3'));
  });
});

describe('ModelosPage — blocos, fotos e botões', () => {
  it('deve carregar o bloco anterior e destacar o último dele quando Anterior passa do 1º do bloco', async () => {
    // Arrange: id-021 é o 21º, o primeiro do bloco 1
    const servidor = simularServidor();
    abrir('/?modelo=id-021');
    await waitFor(() => expect(titulo()).toBe('Modelo 21'));

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Anterior/ }));

    // Assert
    await waitFor(() => expect(titulo()).toBe('Modelo 20'));
    expect(servidor.listar).toHaveBeenLastCalledWith(expect.objectContaining({ page: 0 }));
    expect(within(lista()).getAllByRole('link')).toHaveLength(40);
  });

  it('deve manter o destaque quando o bloco seguinte falha ao avançar', async () => {
    // Arrange
    const servidor = simularServidor();
    abrir('/?modelo=id-020');
    await waitFor(() => expect(titulo()).toBe('Modelo 20'));
    servidor.listar.mockRejectedValueOnce(new Error('Falha'));

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Próximo/ }));

    // Assert
    await waitFor(() =>
      expect(servidor.listar).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 })),
    );
    expect(titulo()).toBe('Modelo 20');
    expect(screen.getByText(/Não foi possível carregar mais modelos/)).toBeDefined();
  });

  it('deve manter o destaque quando o bloco anterior falha ao voltar', async () => {
    // Arrange
    const servidor = simularServidor();
    abrir('/?modelo=id-021');
    await waitFor(() => expect(titulo()).toBe('Modelo 21'));
    servidor.listar.mockRejectedValueOnce(new Error('Falha'));

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Anterior/ }));

    // Assert
    await waitFor(() =>
      expect(servidor.listar).toHaveBeenLastCalledWith(expect.objectContaining({ page: 0 })),
    );
    expect(titulo()).toBe('Modelo 21');
    expect(screen.getByText(/Não foi possível carregar mais modelos/)).toBeDefined();
  });

  it('deve carregar mais e carregar anteriores pelos botões da lista', async () => {
    // Arrange
    const servidor = simularServidor();
    abrir('/?modelo=id-045');
    await waitFor(() => expect(titulo()).toBe('Modelo 45'));

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Carregar mais/ }));
    await waitFor(() => expect(within(lista()).getAllByRole('link')).toHaveLength(40));
    await userEvent.click(screen.getByRole('button', { name: /Carregar anteriores/ }));

    // Assert
    await waitFor(() => expect(within(lista()).getAllByRole('link')).toHaveLength(60));
    expect(servidor.listar).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
    expect(titulo()).toBe('Modelo 45');
  });

  it('deve mostrar as fotos da galeria com a principal primeiro', async () => {
    // Arrange
    simularServidor();
    vi.spyOn(galeriaApi, 'listar').mockResolvedValue([
      criarFoto({ id: 'a', publicUrl: 'https://img/a.jpg', principal: false }),
      criarFoto({ id: 'b', publicUrl: 'https://img/b.jpg', principal: true }),
    ]);

    // Act
    abrir();

    // Assert
    await waitFor(() => expect(titulo()).toBe('Modelo 0'));
    const grande = await screen.findByRole('img', { name: 'Modelo 0, foto 1 de 2' });
    expect((grande as HTMLImageElement).src).toBe('https://img/b.jpg');
  });

  it('deve cair na capa do modelo quando a galeria vem vazia', async () => {
    // Arrange
    simularServidor();
    const comCapa = CATALOGO.map((m, i) =>
      i === 0 ? { ...m, fotoCapaUrl: 'https://img/capa-0.jpg' } : m,
    );
    vi.spyOn(modelosApi, 'listar').mockResolvedValue({
      content: comCapa.slice(0, 20),
      page: 0,
      size: 20,
      totalElements: 299,
      totalPages: 15,
    });

    // Act
    abrir();

    // Assert
    await waitFor(() => expect(titulo()).toBe('Modelo 0'));
    const grande = await screen.findByRole('img', { name: 'Modelo 0, foto 1 de 1' });
    expect((grande as HTMLImageElement).src).toBe('https://img/capa-0.jpg');
  });

  it('deve tentar de novo a galeria quando ela falha e o modelo só tem a capa', async () => {
    // Arrange
    simularServidor();
    const galeria = vi.spyOn(galeriaApi, 'listar').mockRejectedValue(new Error('Falha'));
    vi.spyOn(modelosApi, 'listar').mockResolvedValue({
      content: CATALOGO.slice(0, 20).map((m, i) =>
        i === 0 ? { ...m, fotoCapaUrl: 'https://img/capa-0.jpg' } : m,
      ),
      page: 0,
      size: 20,
      totalElements: 299,
      totalPages: 15,
    });
    abrir();
    await waitFor(() => expect(titulo()).toBe('Modelo 0'));
    const chamadas = galeria.mock.calls.length;

    // Act
    await userEvent.click(await screen.findByRole('button', { name: 'Tentar novamente' }));

    // Assert
    await waitFor(() => expect(galeria.mock.calls.length).toBeGreaterThan(chamadas));
  });

  it('deve voltar a todas as máquinas quando o botão da máquina escolhida é clicado de novo', async () => {
    // Arrange
    const servidor = simularServidor();
    abrir('/?maquina=FBOX');
    await waitFor(() => expect(screen.getByText('149 modelos · mostrando 20')).toBeDefined());

    // Act
    await userEvent.click(await screen.findByRole('button', { name: /^FBOX/ }));

    // Assert
    await waitFor(() => expect(screen.getByText('299 modelos · mostrando 20')).toBeDefined());
    expect(servidor.listar).toHaveBeenLastCalledWith(
      expect.not.objectContaining({ maquina: 'FBOX' }),
    );
  });
});

describe('ModelosPage — link para qualquer modelo', () => {
  it('deve abrir o 135º de 299 já no bloco certo, com "Carregar anteriores" para o resto', async () => {
    // Arrange
    const servidor = simularServidor();

    // Act
    abrir('/?modelo=id-135');

    // Assert
    await waitFor(() => expect(titulo()).toBe('Modelo 135'));
    expect(screen.getByText('135 de 299')).toBeDefined();
    expect(servidor.listar).toHaveBeenCalledWith(expect.objectContaining({ page: 6 }));
    expect(screen.getByRole('button', { name: 'Carregar anteriores (120)' })).toBeDefined();
  });

  it('deve mostrar tudo e avisar quando o modelo do link está fora do filtro do link', async () => {
    // Arrange: id-001 é COQUILHA_ACO, o link pede RESINA
    simularServidor();

    // Act
    abrir('/?tipo=RESINA&modelo=id-001');

    // Assert
    await waitFor(() => expect(titulo()).toBe('Modelo 1'));
    expect(screen.getByText(/não estava no filtro escolhido/)).toBeDefined();
    expect(screen.getByText('299 modelos · mostrando 20')).toBeDefined();
  });

  it('deve ligar "Mostrar inativos" quando o modelo do link é inativo', async () => {
    // Arrange: id-006 é inativo
    simularServidor();

    // Act
    abrir('/?modelo=id-006');

    // Assert
    await waitFor(() => expect(titulo()).toBe('Modelo 6'));
    expect((screen.getByLabelText('Mostrar inativos') as HTMLInputElement).checked).toBe(true);
    expect(within(destaque()).getByText('Inativo')).toBeDefined();
  });

  it('deve avisar "Modelo não encontrado" e abrir o catálogo quando o link aponta para um modelo que não existe', async () => {
    // Arrange
    simularServidor();

    // Act
    abrir('/?modelo=nao-existe');

    // Assert
    await waitFor(() => expect(titulo()).toBe('Modelo 0'));
    expect(screen.getByText('Modelo não encontrado.')).toBeDefined();
  });

  it('deve copiar o endereço do modelo e confirmar', async () => {
    // Arrange
    simularServidor();
    const escrever = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: escrever },
      configurable: true,
    });
    abrir();
    await waitFor(() => expect(titulo()).toBe('Modelo 0'));

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Copiar link' }));

    // Assert
    await waitFor(() => expect(screen.getByText('Link copiado')).toBeDefined());
    expect(escrever).toHaveBeenCalledWith(window.location.href);
  });
});

describe('ModelosPage — vazio, erro e falhas parciais', () => {
  it('deve mostrar o estado vazio com "Limpar filtros" quando nada casa', async () => {
    // Arrange
    simularServidor();

    // Act
    abrir('/?q=zzz');

    // Assert
    expect(await screen.findByText('Nenhum modelo neste filtro')).toBeDefined();
    await userEvent.click(screen.getAllByRole('button', { name: 'Limpar filtros' })[0]);
    await waitFor(() => expect(titulo()).toBe('Modelo 0'));
  });

  it('deve mostrar o erro e refazer a consulta quando "Tentar novamente" é acionado', async () => {
    // Arrange
    const servidor = simularServidor();
    servidor.listar.mockRejectedValueOnce(new Error('Falha'));
    abrir();
    expect(await screen.findByText('Não foi possível carregar os modelos.')).toBeDefined();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    // Assert
    await waitFor(() => expect(titulo()).toBe('Modelo 0'));
  });

  it('deve seguir funcionando, sem números nos botões, quando as contagens falham', async () => {
    // Arrange
    const servidor = simularServidor();
    servidor.contagens.mockRejectedValue(new Error('Falha'));

    // Act
    abrir();

    // Assert
    await waitFor(() => expect(titulo()).toBe('Modelo 0'));
    expect(await screen.findByRole('button', { name: 'Resina' })).toBeDefined();
  });
});
