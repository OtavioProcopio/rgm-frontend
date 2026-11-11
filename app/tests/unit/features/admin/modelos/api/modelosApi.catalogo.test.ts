import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import { modelosApi } from '@/features/admin/modelos/api/modelosApi';
import { httpClient } from '@/shared/api/httpClient';

let get: MockInstance<typeof httpClient.get>;

beforeEach(() => {
  get = vi.spyOn(httpClient, 'get').mockResolvedValue({});
});
afterEach(() => vi.restoreAllMocks());

describe('modelosApi — catálogo', () => {
  it('deve pedir as contagens na rota própria com os filtros', async () => {
    // Act
    await modelosApi.contagens({
      ativo: true,
      tipo: 'RESINA',
      maquina: 'FBOX',
      maquinaExata: true,
    });

    // Assert
    expect(get).toHaveBeenCalledExactlyOnceWith('/modelos/contagens', {
      params: { ativo: true, tipo: 'RESINA', maquina: 'FBOX', maquinaExata: true },
    });
  });

  it('deve pedir a posição do modelo em ordem de código, com os filtros', async () => {
    // Act
    await modelosApi.posicao('m1', { ativo: true, q: 'carcaca' });

    // Assert
    expect(get).toHaveBeenCalledExactlyOnceWith('/modelos/m1/posicao', {
      params: { ativo: true, q: 'carcaca', ordem: 'CODIGO' },
    });
  });

  it('deve listar com os parâmetros novos sem mudar o resto', async () => {
    // Act
    await modelosApi.listar({
      page: 1,
      size: 20,
      ativo: true,
      tipo: 'RESINA',
      q: 'mancal',
      maquina: 'FBOX',
      maquinaExata: true,
      ordem: 'CODIGO',
    });

    // Assert
    expect(get).toHaveBeenCalledExactlyOnceWith('/modelos', {
      params: {
        page: 1,
        size: 20,
        ativo: true,
        tipo: 'RESINA',
        q: 'mancal',
        maquina: 'FBOX',
        maquinaExata: true,
        ordem: 'CODIGO',
      },
    });
  });
});
