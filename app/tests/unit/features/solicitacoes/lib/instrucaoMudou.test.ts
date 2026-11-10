import { describe, expect, it } from 'vitest';

import { instrucaoMudou } from '@/features/solicitacoes/lib/instrucaoMudou';

describe('instrucaoMudou', () => {
  it('deve dizer que não mudou quando o texto é igual', () => {
    expect(instrucaoMudou('Trocar o gabarito', 'Trocar o gabarito')).toBe(false);
  });

  it('deve dizer que não mudou quando só as pontas diferem', () => {
    expect(instrucaoMudou('Trocar o gabarito', '  Trocar o gabarito \n')).toBe(false);
  });

  it('deve dizer que mudou quando o texto é outro', () => {
    expect(instrucaoMudou('Trocar o gabarito', 'Trocar o gabarito e o pino')).toBe(true);
  });

  it('deve dizer que mudou quando a instrução foi apagada', () => {
    expect(instrucaoMudou('Trocar o gabarito', '')).toBe(true);
  });

  it('deve dizer que não mudou quando não havia instrução e nada foi digitado', () => {
    expect(instrucaoMudou(null, '   ')).toBe(false);
  });

  it('deve dizer que mudou quando não havia instrução e algo foi digitado', () => {
    expect(instrucaoMudou(null, 'Primeira')).toBe(true);
  });
});
