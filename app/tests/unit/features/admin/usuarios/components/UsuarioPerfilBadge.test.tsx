/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { UsuarioPerfilBadge } from '@/features/admin/usuarios/components/UsuarioPerfilBadge';
import type { PerfilUsuario } from '@/features/admin/usuarios/types/usuarioTypes';
import { Badge, type BadgeVariant } from '@/shared/components/Badge/Badge';
import { rotuloDoPerfil } from '@/shared/lib/rotulos';

const PERFIS = Object.entries(rotuloDoPerfil) as [PerfilUsuario, string][];
const VARIACAO_DO_PERFIL: Record<PerfilUsuario, BadgeVariant> = {
  ADMINISTRADOR: 'accent',
  GESTOR: 'info',
  OPERADOR: 'neutral',
  EXTERNO: 'success',
};
const TEXTO_DA_REFERENCIA = 'selo de referência';

const classes = (elemento: Element) => elemento.className.split(' ');

/** Classes da peça de selo na variação pedida: a forma e a cor que o selo de perfil deve ter. */
function classesDaPecaDeSelo(variant: BadgeVariant) {
  render(<Badge variant={variant}>{TEXTO_DA_REFERENCIA}</Badge>);
  return classes(screen.getByText(TEXTO_DA_REFERENCIA));
}

afterEach(cleanup);

describe('UsuarioPerfilBadge', () => {
  it.each(PERFIS)('deve mostrar o rótulo da fonte única quando o perfil é %s', (perfil, rotulo) => {
    // Act
    const { container } = render(<UsuarioPerfilBadge perfil={perfil} />);

    // Assert
    expect(container.textContent).toBe(rotulo);
  });

  it.each(PERFIS)(
    'deve ter a forma e a variação da peça de selo quando o perfil é %s',
    (perfil, rotulo) => {
      // Arrange
      const esperado = classesDaPecaDeSelo(VARIACAO_DO_PERFIL[perfil]);

      // Act
      render(<UsuarioPerfilBadge perfil={perfil} />);

      // Assert
      expect(classes(screen.getByText(rotulo))).toEqual(expect.arrayContaining(esperado));
    },
  );
});
