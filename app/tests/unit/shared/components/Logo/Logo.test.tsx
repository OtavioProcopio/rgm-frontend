/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Logo } from '@/shared/components/Logo/Logo';

const NOME = 'RGM Auto Parts';
const ALTURAS = [
  { tamanho: 'sm', classe: 'h-8' },
  { tamanho: 'md', classe: 'h-12' },
  { tamanho: 'lg', classe: 'h-16' },
] as const;
const PADRAO = ALTURAS[1];

const imagem = () => screen.getByRole('img', { name: NOME });
const classes = (elemento: Element) => elemento.className.split(' ');

afterEach(cleanup);

describe('Logo', () => {
  it('deve ser uma imagem com o nome da empresa', () => {
    // Act
    render(<Logo />);

    // Assert
    expect(imagem().getAttribute('src')).toBe('/logo-rgm-autoparts.png');
  });

  it('deve ficar sobre a placa do papel logo-plate', () => {
    // Act
    render(<Logo />);

    // Assert
    expect(classes(imagem().parentElement!)).toContain('bg-logo-plate');
  });

  it('deve ocupar o mesmo espaço da imagem quando a placa é desenhada ao redor dela', () => {
    // Act
    render(<Logo />);

    // Assert
    const placa = classes(imagem().parentElement!);
    expect(placa).toEqual(expect.arrayContaining(['p-1', '-m-1']));
  });

  it.each(ALTURAS)(
    'deve ter a altura $classe quando o tamanho é $tamanho',
    ({ tamanho, classe }) => {
      // Act
      render(<Logo tamanho={tamanho} />);

      // Assert
      expect(classes(imagem())).toContain(classe);
    },
  );

  it('deve ter o tamanho médio quando o tamanho não é informado', () => {
    // Act
    render(<Logo />);

    // Assert
    expect(classes(imagem())).toContain(PADRAO.classe);
  });

  it('deve aceitar classes extras na placa quando className é informado', () => {
    // Arrange
    const extra = 'mx-auto';

    // Act
    render(<Logo className={extra} />);

    // Assert
    expect(classes(imagem().parentElement!)).toContain(extra);
  });
});
