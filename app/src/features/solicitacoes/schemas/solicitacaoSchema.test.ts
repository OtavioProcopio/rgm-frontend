import { describe, expect, it } from 'vitest';
import {
  abrirSolicitacaoSchema,
  triarSolicitacaoSchema,
  encerrarSolicitacaoSchema,
  devolverSolicitacaoSchema,
  comentarioSchema,
} from './solicitacaoSchema';

describe('solicitacaoSchema', () => {
  describe('abrirSolicitacaoSchema', () => {
    it('accepts a valid request to open a request', () => {
      const result = abrirSolicitacaoSchema.safeParse({
        titulo: 'Vazamento no motor primário',
        descricao: 'Detectado vazamento de óleo na junta do cabeçote',
        tipo: 'REPARO',
        modeloId: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty title or description', () => {
      const result = abrirSolicitacaoSchema.safeParse({
        titulo: '',
        descricao: '',
        tipo: 'INSPECAO',
        modeloId: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty model id', () => {
      const result = abrirSolicitacaoSchema.safeParse({
        titulo: 'Inspeção semestral',
        descricao: 'Verificar alinhamento da correia',
        tipo: 'INSPECAO',
        modeloId: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('triarSolicitacaoSchema', () => {
    it('accepts valid triage data', () => {
      const result = triarSolicitacaoSchema.safeParse({
        prioridade: 'ALTA',
        responsavelIds: ['123e4567-e89b-12d3-a456-426614174000'],
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty responsibles array', () => {
      const result = triarSolicitacaoSchema.safeParse({
        prioridade: 'MEDIA',
        responsavelIds: [],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('encerrarSolicitacaoSchema', () => {
    it('accepts a valid closure', () => {
      const result = encerrarSolicitacaoSchema.safeParse({
        concluir: true,
        comentario: 'Substituição da junta efetuada com sucesso.',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty comment', () => {
      const result = encerrarSolicitacaoSchema.safeParse({
        concluir: false,
        comentario: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('devolverSolicitacaoSchema', () => {
    it('rejects devolução without motivo', () => {
      const result = devolverSolicitacaoSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('accepts devolução with motivo and optional prioridade', () => {
      const result = devolverSolicitacaoSchema.safeParse({
        motivo: 'Falta peça de reposição',
        prioridade: 'URGENTE',
      });
      expect(result.success).toBe(true);
    });

    it('accepts devolução with only motivo', () => {
      const result = devolverSolicitacaoSchema.safeParse({ motivo: 'Motivo válido' });
      expect(result.success).toBe(true);
    });
  });

  describe('comentarioSchema', () => {
    it('accepts valid comment', () => {
      const result = comentarioSchema.safeParse({
        comentario: 'Aguardando liberação do gestor',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty comment', () => {
      const result = comentarioSchema.safeParse({
        comentario: '',
      });
      expect(result.success).toBe(false);
    });
  });
});
