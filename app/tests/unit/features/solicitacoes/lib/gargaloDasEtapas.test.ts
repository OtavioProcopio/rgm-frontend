import { describe, expect, it } from 'vitest';

import { etapaDoGargalo, textoDoGargalo } from '@/features/solicitacoes/lib/gargaloDasEtapas';
import type { EtapaDoTempo } from '@/features/solicitacoes/types/solicitacaoTypes';

const etapa = (mediana: number | null): EtapaDoTempo => ({
  amostras: mediana === null ? 0 : 5,
  medianaSegundos: mediana,
  mediaSegundos: mediana,
});

describe('etapaDoGargalo', () => {
  it('deve apontar a etapa de maior mediana quando todas têm dado', () => {
    // Arrange
    const etapas = {
      esperaAteIniciar: etapa(100),
      execucao: etapa(300),
      esperaDeValidacao: etapa(200),
    };

    // Act
    const chave = etapaDoGargalo(etapas);

    // Assert
    expect(chave).toBe('execucao');
  });

  it('deve ignorar etapa sem dado quando compara', () => {
    // Arrange
    const etapas = {
      esperaAteIniciar: etapa(null),
      execucao: etapa(10),
      esperaDeValidacao: etapa(null),
    };

    // Act
    const chave = etapaDoGargalo(etapas);

    // Assert
    expect(chave).toBe('execucao');
  });

  it('deve devolver nulo quando nenhuma etapa tem dado', () => {
    // Arrange
    const etapas = {
      esperaAteIniciar: etapa(null),
      execucao: etapa(null),
      esperaDeValidacao: etapa(null),
    };

    // Act
    const chave = etapaDoGargalo(etapas);

    // Assert
    expect(chave).toBeNull();
  });

  it('deve ficar com a primeira etapa quando há empate', () => {
    // Arrange
    const etapas = {
      esperaAteIniciar: etapa(50),
      execucao: etapa(50),
      esperaDeValidacao: etapa(50),
    };

    // Act
    const chave = etapaDoGargalo(etapas);

    // Assert
    expect(chave).toBe('esperaAteIniciar');
  });
});

describe('textoDoGargalo', () => {
  it('deve nomear a etapa quando há gargalo', () => {
    // Arrange
    const etapas = {
      esperaAteIniciar: etapa(900),
      execucao: etapa(10),
      esperaDeValidacao: etapa(20),
    };

    // Act
    const texto = textoDoGargalo(etapas);

    // Assert
    expect(texto).toContain('Espera até iniciar');
  });

  it('deve dizer que faltam dados quando nenhuma etapa tem dado', () => {
    // Arrange
    const etapas = {
      esperaAteIniciar: etapa(null),
      execucao: etapa(null),
      esperaDeValidacao: etapa(null),
    };

    // Act
    const texto = textoDoGargalo(etapas);

    // Assert
    expect(texto).toContain('não há dados');
  });
});
