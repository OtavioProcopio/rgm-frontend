/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import type { Modelo } from '@/features/admin/modelos/types/modeloTypes';

import { ModeloCard } from '@/features/modelos/components/ModeloCard';

afterEach(cleanup);

const baseModelo: Modelo = {
  id: '1',
  codigo: 'MDL-001',
  versao: 1,
  descricao: 'Modelo de teste para verificação de componentes',
  observacoes: null,
  ativo: true,
  maquina: 'Máquina A',
  fotoCapaUrl: null,
  tipo: null,
  temPendenciaAberta: false,
  criadoEm: '2024-01-01T00:00:00',
  atualizadoEm: '2024-01-01T00:00:00',
};

const classes = (elemento: Element) => elemento.className.split(' ');

function renderCard(modelo: Partial<Modelo> = {}, linkBase?: string) {
  const { container } = render(
    <MemoryRouter>
      <ModeloCard modelo={{ ...baseModelo, ...modelo }} linkBase={linkBase} />
    </MemoryRouter>,
  );
  return { cartao: within(container), container };
}

describe('ModeloCard', () => {
  it('deve ter um único link para o detalhe quando renderizado com o linkBase padrão', () => {
    // Act
    const { cartao } = renderCard();

    // Assert
    const links = cartao.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]?.getAttribute('href')).toBe('/app/modelos/1');
  });

  it('deve apontar o link para o linkBase informado quando ele é fornecido', () => {
    // Act
    const { cartao } = renderCard({}, '/app/admin/modelos');

    // Assert
    expect(cartao.getByRole('link').getAttribute('href')).toBe('/app/admin/modelos/1');
  });

  it('deve nomear o link pela descrição e pelo código quando renderizado', () => {
    // Act
    const { cartao } = renderCard();

    // Assert
    const nome = `${baseModelo.descricao}, ${baseModelo.codigo}`;
    expect(cartao.getByRole('link', { name: nome })).toBeDefined();
  });

  it('deve omitir o texto Ver detalhes quando renderizado', () => {
    // Act
    const { cartao } = renderCard();

    // Assert
    expect(cartao.queryByText(/ver detalhes/i)).toBeNull();
  });

  it('deve usar a descrição como título quando renderizado', () => {
    // Act
    const { cartao } = renderCard();

    // Assert
    expect(classes(cartao.getByText(baseModelo.descricao))).toEqual(
      expect.arrayContaining(['line-clamp-2', 'font-semibold', 'text-fg']),
    );
  });

  it('deve mostrar o código em fonte monoespaçada quando renderizado', () => {
    // Act
    const { cartao } = renderCard();

    // Assert
    expect(classes(cartao.getByText(baseModelo.codigo))).toEqual(
      expect.arrayContaining(['font-mono', 'text-xs', 'text-fg-muted']),
    );
  });

  it('deve ter a moldura de cartão com hover de sombra quando renderizado', () => {
    // Arrange
    const esperado = ['rounded-xl', 'border', 'border-line', 'bg-surface', 'hover:shadow-md'];

    // Act
    const { cartao } = renderCard();

    // Assert
    const moldura = cartao.getByRole('link').firstElementChild as HTMLElement;
    expect(classes(moldura)).toEqual(expect.arrayContaining(esperado));
  });

  it('deve omitir o selo Ativo quando o modelo está ativo e sem pendência', () => {
    // Act
    const { cartao } = renderCard({ ativo: true, temPendenciaAberta: false });

    // Assert
    expect(cartao.queryByText('Ativo')).toBeNull();
    expect(cartao.queryByText('Pendência aberta')).toBeNull();
  });

  it('deve mostrar o selo Inativo neutro quando o modelo está inativo', () => {
    // Act
    const { cartao } = renderCard({ ativo: false });

    // Assert
    expect(classes(cartao.getByText('Inativo'))).toEqual(
      expect.arrayContaining(['bg-surface-muted', 'text-fg-muted']),
    );
  });

  it('deve mostrar o selo Pendência aberta de alerta quando há pendência aberta', () => {
    // Act
    const { cartao } = renderCard({ temPendenciaAberta: true });

    // Assert
    expect(classes(cartao.getByText('Pendência aberta'))).toEqual(
      expect.arrayContaining(['bg-warning-soft', 'text-warning-fg']),
    );
  });

  it('deve mostrar a imagem em proporção 4/3 quando há foto de capa', () => {
    // Act
    const { container } = renderCard({ fotoCapaUrl: 'https://example.com/foto.jpg' });

    // Assert
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('https://example.com/foto.jpg');
    expect(classes(img)).toEqual(
      expect.arrayContaining(['aspect-[4/3]', 'w-full', 'object-cover']),
    );
  });

  it('deve mostrar as duas primeiras letras do código quando não há foto de capa', () => {
    // Act
    const { cartao, container } = renderCard({ fotoCapaUrl: null });

    // Assert
    expect(cartao.getByText('MD')).toBeDefined();
    expect(container.querySelector('img')).toBeNull();
  });

  it('deve navegar para o detalhe quando Enter é pressionado no link focado', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<ModeloCard modelo={baseModelo} />} />
          <Route path="/app/modelos/:id" element={<p>Detalhe aberto</p>} />
        </Routes>
      </MemoryRouter>,
    );

    // Act
    await user.tab();
    await user.keyboard('{Enter}');

    // Assert
    expect(screen.getByText('Detalhe aberto')).toBeDefined();
  });

  it('deve omitir outline-none quando renderizado', () => {
    // Act
    const { container } = renderCard();

    // Assert
    const todas = Array.from(container.querySelectorAll('*')).flatMap(classes);
    expect(todas).not.toContain('outline-none');
  });

  it('deve esticar o cartão até a altura da linha quando a grade tem cartões mais altos', () => {
    // Act
    const { container } = renderCard();

    // Assert
    const link = container.querySelector('a')!;
    expect(link.classList.contains('h-full')).toBe(true);
    expect(link.firstElementChild?.classList.contains('h-full')).toBe(true);
  });

  it('deve usar transição apenas com motion-safe quando renderizado', () => {
    // Act
    const { container } = renderCard();

    // Assert
    const todas = Array.from(container.querySelectorAll('*')).flatMap(classes);
    const soltas = todas.filter((c) => /^transition/.test(c));
    expect(soltas).toEqual([]);
    expect(todas).toContain('motion-safe:transition-shadow');
  });
});
