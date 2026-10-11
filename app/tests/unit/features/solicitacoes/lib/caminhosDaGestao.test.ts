import { describe, expect, it } from 'vitest';

import {
  caminhoDaFaixa,
  caminhoDaMaquina,
  caminhoDoModelo,
  caminhoDoResponsavel,
} from '@/features/solicitacoes/lib/caminhosDaGestao';

const AGORA = new Date('2026-10-11T12:00:00.000Z');

function parametros(caminho: string): URLSearchParams {
  return new URLSearchParams(caminho.split('?')[1]);
}

describe('caminhoDaFaixa', () => {
  it('deve pedir só as criadas há menos de 1 dia quando a faixa é menosDeUmDia', () => {
    // Arrange
    const faixa = 'menosDeUmDia';

    // Act
    const params = parametros(caminhoDaFaixa(faixa, AGORA));

    // Assert
    expect(Object.fromEntries(params)).toEqual({
      emAberto: 'true',
      criadaEmInicio: '2026-10-10T12:00:00.000Z',
    });
  });

  it('deve pedir o intervalo entre 3 e 1 dia quando a faixa é umATresDias', () => {
    // Arrange
    const faixa = 'umATresDias';

    // Act
    const params = parametros(caminhoDaFaixa(faixa, AGORA));

    // Assert
    expect(Object.fromEntries(params)).toEqual({
      emAberto: 'true',
      criadaEmInicio: '2026-10-08T12:00:00.000Z',
      criadaEmFim: '2026-10-10T12:00:00.000Z',
    });
  });

  it('deve pedir só as criadas há mais de 3 dias quando a faixa é maisDeTresDias', () => {
    // Arrange
    const faixa = 'maisDeTresDias';

    // Act
    const params = parametros(caminhoDaFaixa(faixa, AGORA));

    // Assert
    expect(Object.fromEntries(params)).toEqual({
      emAberto: 'true',
      criadaEmFim: '2026-10-08T12:00:00.000Z',
    });
  });
});

describe('atalhos por máquina, modelo e responsável', () => {
  it('deve filtrar pela máquina', () => {
    // Arrange
    const maquina = 'FBOX';

    // Act
    const caminho = caminhoDaMaquina(maquina);

    // Assert
    expect(caminho).toBe('/app/solicitacoes?maquina=FBOX');
  });

  it('deve filtrar pelo modelo', () => {
    // Arrange
    const id = '6dacdfac-4812-4b37-9a4c-20ed9516dc0f';

    // Act
    const caminho = caminhoDoModelo(id);

    // Assert
    expect(caminho).toBe(`/app/solicitacoes?modeloId=${id}`);
  });

  it('deve filtrar as abertas do responsável', () => {
    // Arrange
    const id = 'f55804cf-a4a1-424b-ac63-f556cf1d03d6';

    // Act
    const caminho = caminhoDoResponsavel(id);

    // Assert
    expect(caminho).toBe(`/app/solicitacoes?emAberto=true&responsavelId=${id}`);
  });
});
