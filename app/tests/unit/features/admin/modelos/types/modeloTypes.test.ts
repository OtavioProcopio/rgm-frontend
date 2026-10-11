/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';

import { TIPO_MODELO_LABELS } from '@/features/admin/modelos/types/modeloTypes';
import { rotuloDoTipoDeModelo } from '@/shared/lib/rotulos';

describe('TIPO_MODELO_LABELS', () => {
  it('deve ser o mapa único de rótulos do tipo de modelo quando importado da feature', () => {
    // Act
    const rotulos = TIPO_MODELO_LABELS;

    // Assert
    expect(rotulos).toBe(rotuloDoTipoDeModelo);
  });
});
