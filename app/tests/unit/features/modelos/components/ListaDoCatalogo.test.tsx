/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { criarModelo, criarModelos } from '@tests/support/modeloFixture';

import { ItemDoCatalogo } from '@/features/modelos/components/ItemDoCatalogo';
import { ListaDoCatalogo } from '@/features/modelos/components/ListaDoCatalogo';

afterEach(cleanup);

function montarLista(extra: Partial<React.ComponentProps<typeof ListaDoCatalogo>> = {}) {
  const props = {
    modelos: criarModelos(3),
    destaqueId: 'id-001',
    linkDoModelo: (id: string) => ({ search: `?modelo=${id}` }),
    total: 3,
    restantesDepois: 0,
    restantesAntes: 0,
    buscandoDepois: false,
    buscandoAntes: false,
    erroNoBloco: false,
    aoCarregarDepois: vi.fn(),
    aoCarregarAntes: vi.fn(),
    ...extra,
  };
  render(
    <MemoryRouter>
      <ListaDoCatalogo {...props} />
    </MemoryRouter>,
  );
  return props;
}

describe('ItemDoCatalogo', () => {
  function montarItem(modelo = criarModelo(), emDestaque = false) {
    render(
      <MemoryRouter>
        <ItemDoCatalogo modelo={modelo} para={{ search: '?modelo=m1' }} emDestaque={emDestaque} />
      </MemoryRouter>,
    );
  }

  it('deve ser um link de verdade para o modelo, que abre em nova aba', () => {
    // Act
    montarItem();

    // Assert
    expect(screen.getByRole('link').getAttribute('href')).toBe('/?modelo=m1');
  });

  it('deve mostrar descrição e código e nomear o link por eles', () => {
    montarItem(criarModelo({ descricao: 'Carcaça de bomba', codigo: 'FB-1001' }));

    expect(screen.getByRole('link', { name: 'Carcaça de bomba, FB-1001' })).toBeDefined();
    expect(screen.getByText('FB-1001')).toBeDefined();
  });

  it('deve mostrar a capa em miniatura preguiçosa quando o modelo tem foto de capa', () => {
    // Act
    montarItem(criarModelo({ fotoCapaUrl: 'https://img/capa.jpg' }));

    // Assert
    const imagem = screen.getByRole('presentation', { hidden: true });
    expect(imagem.getAttribute('src')).toBe('https://img/capa.jpg');
    expect(imagem.getAttribute('loading')).toBe('lazy');
  });

  it('deve mostrar a sigla do código quando não há capa', () => {
    montarItem(criarModelo({ codigo: 'RS-4001', fotoCapaUrl: null }));

    expect(screen.getByText('RS')).toBeDefined();
  });

  it('deve dizer "inativo" e "pendência" no texto e no nome acessível', () => {
    // Act
    montarItem(criarModelo({ ativo: false, temPendenciaAberta: true, codigo: 'FB-1' }));

    // Assert
    expect(screen.getByText('FB-1 · inativo · pendência')).toBeDefined();
    expect(screen.getByRole('link').getAttribute('aria-label')).toContain(', inativo');
    expect(screen.getByRole('link').getAttribute('aria-label')).toContain(', pendência aberta');
  });

  it('deve marcar como atual e rolar até o item quando é o do destaque', () => {
    // Arrange
    const rolar = vi.fn();
    Element.prototype.scrollIntoView = rolar;

    // Act
    montarItem(criarModelo(), true);

    // Assert
    expect(screen.getByRole('link').getAttribute('aria-current')).toBe('true');
    expect(rolar).toHaveBeenCalledWith({ block: 'nearest' });
  });

  it('não deve marcar nem rolar quando não é o do destaque', () => {
    const rolar = vi.fn();
    Element.prototype.scrollIntoView = rolar;

    montarItem(criarModelo(), false);

    expect(screen.getByRole('link').getAttribute('aria-current')).toBeNull();
    expect(rolar).not.toHaveBeenCalled();
  });
});

const lista = () => screen.getByRole('complementary', { name: 'Lista de modelos' });

describe('ListaDoCatalogo', () => {
  it('deve listar os modelos com links e marcar o do destaque', () => {
    // Act
    montarLista();

    // Assert
    const lista = screen.getByRole('complementary', { name: 'Lista de modelos' });
    const links = within(lista).getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(links[1].getAttribute('aria-current')).toBe('true');
    expect(links[2].getAttribute('href')).toBe('/?modelo=id-002');
  });

  it('deve dizer quantos modelos o filtro tem e quantos estão na tela', () => {
    montarLista({ modelos: criarModelos(20), total: 48 });

    expect(screen.getByText('48 modelos · mostrando 20')).toBeDefined();
  });

  it('deve usar o singular quando o filtro tem 1 modelo', () => {
    montarLista({ modelos: criarModelos(1), total: 1 });

    expect(screen.getByText('1 modelo · mostrando 1')).toBeDefined();
  });

  it('deve oferecer "Carregar mais" com quantos faltam e chamar o carregamento', async () => {
    // Arrange
    const { aoCarregarDepois } = montarLista({ total: 48, restantesDepois: 28 });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Carregar mais (28 restantes)' }));

    // Assert
    expect(aoCarregarDepois).toHaveBeenCalledTimes(1);
  });

  it('deve oferecer "Carregar anteriores" no topo quando a lista abriu no meio', async () => {
    // Arrange
    const { aoCarregarAntes } = montarLista({ restantesAntes: 120, total: 300 });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Carregar anteriores (120)' }));

    // Assert
    expect(aoCarregarAntes).toHaveBeenCalledTimes(1);
  });

  it('não deve oferecer carregar mais quando todos já estão na tela', () => {
    montarLista();

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('deve avisar, sem esconder a lista, quando um bloco a mais falha', () => {
    // Act
    montarLista({ erroNoBloco: true, restantesDepois: 5 });

    // Assert
    expect(screen.getByRole('alert').textContent).toContain(
      'Não foi possível carregar mais modelos',
    );
    expect(within(lista()).getAllByRole('link')).toHaveLength(3);
    expect(screen.getByRole('button', { name: /Carregar mais/ })).toBeDefined();
  });

  it('não deve avisar de erro quando não houve falha', () => {
    montarLista();

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('deve desabilitar o botão e mostrar "Carregando…" enquanto o bloco chega', () => {
    // Act
    montarLista({
      restantesDepois: 5,
      buscandoDepois: true,
      restantesAntes: 5,
      buscandoAntes: true,
    });

    // Assert
    const botoes = screen.getAllByRole('button', { name: 'Carregando…' }) as HTMLButtonElement[];
    expect(botoes).toHaveLength(2);
    expect(botoes.every((b) => b.disabled)).toBe(true);
  });
});
