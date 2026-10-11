/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { UsuarioStatusBadge } from '@/features/admin/usuarios/components/UsuarioStatusBadge';
import { Badge, type BadgeVariant } from '@/shared/components/Badge/Badge';

const SITUACOES: { ativo: boolean; texto: string; variant: BadgeVariant }[] = [
  { ativo: true, texto: 'Ativo', variant: 'success' },
  { ativo: false, texto: 'Inativo', variant: 'neutral' },
];
const TEXTO_DA_REFERENCIA = 'selo de referência';

const classes = (elemento: Element) => elemento.className.split(' ');

/** Classes da peça de selo na variação pedida: a forma e a cor que o selo de situação deve ter. */
function classesDaPecaDeSelo(variant: BadgeVariant) {
  render(<Badge variant={variant}>{TEXTO_DA_REFERENCIA}</Badge>);
  return classes(screen.getByText(TEXTO_DA_REFERENCIA));
}

afterEach(cleanup);

describe('UsuarioStatusBadge', () => {
  it.each(SITUACOES)('deve mostrar o texto $texto quando ativo é $ativo', ({ ativo, texto }) => {
    // Act
    const { container } = render(<UsuarioStatusBadge ativo={ativo} />);

    // Assert
    expect(container.textContent).toBe(texto);
  });

  it.each(SITUACOES)(
    'deve ter a forma da peça de selo na variação $variant quando ativo é $ativo',
    ({ ativo, texto, variant }) => {
      // Arrange
      const esperado = classesDaPecaDeSelo(variant);

      // Act
      render(<UsuarioStatusBadge ativo={ativo} />);

      // Assert
      expect(classes(screen.getByText(texto))).toEqual(expect.arrayContaining(esperado));
    },
  );
});
