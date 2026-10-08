/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { AdminCard } from '@/features/admin/components/AdminCard';

const TITULO = 'Máquinas';
const DESCRICAO = 'Gerencie o catálogo de máquinas usado no cadastro de modelos.';
const DESTINO = '/app/admin/maquinas';
const CHAMADA = 'Acessar';
const ID_DO_ICONE = 'icone-do-cartao';
const TAMANHO_DO_ICONE = 22;
const MOLDURA = ['rounded-xl', 'border', 'border-line', 'bg-surface'];

type IconeProps = { className?: string; size?: number };

function Icone({ className, size }: IconeProps) {
  return <svg data-testid={ID_DO_ICONE} className={className} width={size} aria-hidden="true" />;
}

const classes = (elemento: Element) => (elemento.getAttribute('class') ?? '').split(' ');
const link = () => screen.getByRole('link');
const icone = () => screen.getByTestId(ID_DO_ICONE);

function renderCartao() {
  render(
    <MemoryRouter>
      <AdminCard title={TITULO} description={DESCRICAO} href={DESTINO} icon={Icone} />
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe('AdminCard', () => {
  it('deve mostrar o título como cabeçalho', () => {
    // Act
    renderCartao();

    // Assert
    expect(screen.getByRole('heading', { name: TITULO }).textContent).toBe(TITULO);
  });

  it('deve mostrar a descrição recebida', () => {
    // Act
    renderCartao();

    // Assert
    expect(screen.getByText(DESCRICAO).textContent).toBe(DESCRICAO);
  });

  it('deve levar ao destino recebido quando o cartão é acionado', () => {
    // Act
    renderCartao();

    // Assert
    expect(link().getAttribute('href')).toBe(DESTINO);
  });

  it('deve pôr título, descrição e chamada dentro do link', () => {
    // Act
    renderCartao();

    // Assert
    expect(link().textContent).toBe(`${TITULO}${DESCRICAO}${CHAMADA}`);
  });

  it('deve mostrar o ícone recebido dentro do link', () => {
    // Act
    renderCartao();

    // Assert
    expect(link().contains(icone())).toBe(true);
  });

  it('deve passar ao ícone o tamanho do cartão', () => {
    // Act
    renderCartao();

    // Assert
    expect(icone().getAttribute('width')).toBe(String(TAMANHO_DO_ICONE));
  });

  it('deve ter a moldura da peça de cartão, com superfície, borda e canto pelos papéis', () => {
    // Act
    renderCartao();

    // Assert
    const moldura = link().closest('.border') as HTMLElement;
    expect(classes(moldura)).toEqual(expect.arrayContaining(MOLDURA));
  });

  it('deve mostrar o título com o texto principal pelo papel', () => {
    // Act
    renderCartao();

    // Assert
    expect(classes(screen.getByRole('heading', { name: TITULO }))).toContain('text-fg');
  });

  it('deve mostrar a descrição com o texto secundário pelo papel', () => {
    // Act
    renderCartao();

    // Assert
    expect(classes(screen.getByText(DESCRICAO))).toContain('text-fg-muted');
  });

  it('deve mostrar o ícone com a cor de destaque pelo papel', () => {
    // Act
    renderCartao();

    // Assert
    const portadores = [icone(), icone().parentElement as HTMLElement].flatMap(classes);
    expect(portadores).toContain('text-accent');
  });

  it('deve mostrar a chamada Acessar com a cor de destaque pelo papel', () => {
    // Act
    renderCartao();

    // Assert
    expect(classes(screen.getByText(CHAMADA))).toContain('text-accent');
  });
});
