/**
 * @vitest-environment jsdom
 */
import { cleanup, render, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
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

function renderCard(modelo: Partial<Modelo> = {}) {
  const { container } = render(
    <MemoryRouter>
      <ModeloCard modelo={{ ...baseModelo, ...modelo }} />
    </MemoryRouter>,
  );
  return within(container);
}

describe('ModeloCard', () => {
  it('renders codigo and descricao', () => {
    const c = renderCard();

    expect(c.getByText('MDL-001')).toBeDefined();
    expect(c.getByText(/modelo de teste/i)).toBeDefined();
  });

  it('shows badge Ativo when modelo is active', () => {
    const c = renderCard({ ativo: true });

    expect(c.getByText('Ativo')).toBeDefined();
  });

  it('shows badge Inativo when modelo is inactive', () => {
    const c = renderCard({ ativo: false });

    expect(c.getByText('Inativo')).toBeDefined();
  });

  it('shows pendência badge when temPendenciaAberta is true', () => {
    const c = renderCard({ temPendenciaAberta: true });

    expect(c.getByText(/pendência aberta/i)).toBeDefined();
  });

  it('hides pendência badge when temPendenciaAberta is false', () => {
    const c = renderCard({ temPendenciaAberta: false });

    expect(c.queryByText(/pendência aberta/i)).toBeNull();
  });

  it('renders link to detail page with default linkBase', () => {
    const { container } = render(
      <MemoryRouter>
        <ModeloCard modelo={baseModelo} />
      </MemoryRouter>,
    );

    const link = within(container).getByRole('link', { name: /ver detalhes/i });
    expect(link.getAttribute('href')).toBe('/app/modelos/1');
  });

  it('uses custom linkBase when provided', () => {
    const { container } = render(
      <MemoryRouter>
        <ModeloCard modelo={baseModelo} linkBase="/app/admin/modelos" />
      </MemoryRouter>,
    );

    const link = within(container).getByRole('link', { name: /ver detalhes/i });
    expect(link.getAttribute('href')).toBe('/app/admin/modelos/1');
  });

  it('shows initials placeholder when fotoCapaUrl is null', () => {
    const c = renderCard({ fotoCapaUrl: null });

    expect(c.getByText('MD')).toBeDefined();
  });

  it('renders image when fotoCapaUrl is provided', () => {
    const c = renderCard({ fotoCapaUrl: 'https://example.com/foto.jpg' });

    const img = c.getByRole('img', { name: 'MDL-001' });
    expect(img.getAttribute('src')).toBe('https://example.com/foto.jpg');
  });

  it('deve ter a moldura da peça de cartão, com superfície, borda e canto pelos papéis', () => {
    // Arrange
    const moldura = ['rounded-xl', 'border', 'border-line', 'bg-surface'];

    // Act
    const { container } = render(
      <MemoryRouter>
        <ModeloCard modelo={baseModelo} />
      </MemoryRouter>,
    );

    // Assert
    expect(classes(container.firstElementChild as HTMLElement)).toEqual(
      expect.arrayContaining(moldura),
    );
  });

  it('deve mostrar o código com o texto principal pelo papel', () => {
    // Act
    const cartao = renderCard();

    // Assert
    expect(classes(cartao.getByText(baseModelo.codigo))).toContain('text-fg');
  });

  it('deve mostrar a descrição com o texto secundário pelo papel', () => {
    // Act
    const cartao = renderCard();

    // Assert
    expect(classes(cartao.getByText(baseModelo.descricao))).toContain('text-fg-muted');
  });

  it.each([
    { ativo: true, rotulo: 'Ativo', variacao: ['bg-success-soft', 'text-success-fg'] },
    { ativo: false, rotulo: 'Inativo', variacao: ['bg-surface-muted', 'text-fg-muted'] },
  ])(
    'deve mostrar a situação $rotulo pelos papéis quando ativo é $ativo',
    ({ ativo, rotulo, variacao }) => {
      // Act
      const cartao = renderCard({ ativo });

      // Assert
      expect(classes(cartao.getByText(rotulo))).toEqual(expect.arrayContaining(variacao));
    },
  );

  it('deve mostrar a pendência aberta pelos papéis de alerta, com texto', () => {
    // Arrange
    const alerta = ['bg-warning-soft', 'text-warning-fg'];

    // Act
    const cartao = renderCard({ temPendenciaAberta: true });

    // Assert
    expect(classes(cartao.getByText('Pendência aberta'))).toEqual(expect.arrayContaining(alerta));
  });

  it('deve mostrar o link de detalhes com a cor de destaque pelo papel', () => {
    // Act
    const cartao = renderCard();

    // Assert
    expect(classes(cartao.getByRole('link', { name: /ver detalhes/i }))).toContain('text-accent');
  });
});
