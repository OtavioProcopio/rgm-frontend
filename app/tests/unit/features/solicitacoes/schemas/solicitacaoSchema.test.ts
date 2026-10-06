import { describe, expect, it } from 'vitest';
import {
  abrirSolicitacaoSchema,
  triarSolicitacaoSchema,
  encerrarSolicitacaoSchema,
  devolverSolicitacaoSchema,
  comentarioSchema,
  editarSolicitacaoSchema,
} from '@/features/solicitacoes/schemas/solicitacaoSchema';
import { LIMITES, mensagemDeLimite } from '@/shared/lib/limites';

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

    it('accepts a valid CRIACAO request with modeloCodigo/modeloMaquina instead of modeloId', () => {
      const result = abrirSolicitacaoSchema.safeParse({
        titulo: 'Novo modelo XYZ',
        descricao: 'Descrição do modelo pretendido',
        tipo: 'CRIACAO',
        modeloCodigo: 'COD-XYZ',
        modeloMaquina: 'FBOX',
      });
      expect(result.success).toBe(true);
    });

    it('rejects CRIACAO without modeloCodigo', () => {
      const result = abrirSolicitacaoSchema.safeParse({
        titulo: 'Novo modelo XYZ',
        descricao: 'Descrição do modelo pretendido',
        tipo: 'CRIACAO',
        modeloMaquina: 'FBOX',
      });
      expect(result.success).toBe(false);
    });

    it('rejects CRIACAO without modeloMaquina', () => {
      const result = abrirSolicitacaoSchema.safeParse({
        titulo: 'Novo modelo XYZ',
        descricao: 'Descrição do modelo pretendido',
        tipo: 'CRIACAO',
        modeloCodigo: 'COD-XYZ',
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

describe('limites de tamanho da solicitação', () => {
  const abertura = {
    titulo: 'Trinca na placa',
    descricao: 'Trinca junto ao canal de alimentação',
    tipo: 'CRIACAO' as const,
    modeloCodigo: 'M-01',
    modeloMaquina: 'FBOX',
  };

  it.each([
    ['titulo', LIMITES.solicitacaoTitulo],
    ['descricao', LIMITES.textoLongo],
    ['modeloCodigo', LIMITES.modeloPretendidoCodigo],
    ['modeloMaquina', LIMITES.modeloPretendidoMaquina],
    ['modeloObservacoes', LIMITES.textoLongo],
  ] as const)('deve aceitar %s na abertura quando o texto tem exatamente %i caracteres', (campo, limite) => {
    // Arrange
    const dados = { ...abertura, [campo]: 'a'.repeat(limite) };

    // Act
    const resultado = abrirSolicitacaoSchema.safeParse(dados);

    // Assert
    expect(resultado.success).toBe(true);
  });

  it.each([
    ['titulo', LIMITES.solicitacaoTitulo],
    ['descricao', LIMITES.textoLongo],
    ['modeloCodigo', LIMITES.modeloPretendidoCodigo],
    ['modeloMaquina', LIMITES.modeloPretendidoMaquina],
    ['modeloObservacoes', LIMITES.textoLongo],
  ] as const)('deve recusar %s na abertura quando o texto passa de %i caracteres', (campo, limite) => {
    // Arrange
    const dados = { ...abertura, [campo]: 'a'.repeat(limite + 1) };

    // Act
    const resultado = abrirSolicitacaoSchema.safeParse(dados);

    // Assert
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]).toMatchObject({ path: [campo], message: mensagemDeLimite(limite) });
  });

  it.each([
    ['comentário', comentarioSchema, 'comentario', {}],
    ['motivo da devolução', devolverSolicitacaoSchema, 'motivo', {}],
    ['comentário final', encerrarSolicitacaoSchema, 'comentario', { concluir: true }],
  ] as const)('deve aceitar %s com 2.000 caracteres e recusar com 2.001', (_nome, esquema, campo, base) => {
    // Arrange
    const noLimite = { ...base, [campo]: 'a'.repeat(LIMITES.textoLongo) };
    const acimaDoLimite = { ...base, [campo]: 'a'.repeat(LIMITES.textoLongo + 1) };

    // Act
    const aceito = esquema.safeParse(noLimite);
    const recusado = esquema.safeParse(acimaDoLimite);

    // Assert
    expect(aceito.success).toBe(true);
    expect(recusado.success).toBe(false);
    expect(recusado.error?.issues[0]?.message).toBe(mensagemDeLimite(LIMITES.textoLongo));
  });
});

describe('editarSolicitacaoSchema', () => {
  it('deve aceitar a edição quando título e descrição estão exatamente no limite', () => {
    // Arrange
    const dados = {
      titulo: 'a'.repeat(LIMITES.solicitacaoTitulo),
      descricao: 'a'.repeat(LIMITES.textoLongo),
    };

    // Act
    const resultado = editarSolicitacaoSchema.safeParse(dados);

    // Assert
    expect(resultado.success).toBe(true);
  });

  it.each([
    ['titulo', LIMITES.solicitacaoTitulo],
    ['descricao', LIMITES.textoLongo],
  ] as const)('deve recusar a edição quando %s passa de %i caracteres', (campo, limite) => {
    // Arrange
    const dados = { titulo: 'Trinca na placa', descricao: 'Trinca junto ao canal', [campo]: 'a'.repeat(limite + 1) };

    // Act
    const resultado = editarSolicitacaoSchema.safeParse(dados);

    // Assert
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]).toMatchObject({ path: [campo], message: mensagemDeLimite(limite) });
  });

  it('deve recusar a edição quando o título só tem espaços', () => {
    // Arrange
    const dados = { titulo: '   ', descricao: 'Trinca junto ao canal' };

    // Act
    const resultado = editarSolicitacaoSchema.safeParse(dados);

    // Assert
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues[0]?.path).toEqual(['titulo']);
  });

  it('deve devolver título e descrição sem espaços nas pontas quando a edição é válida', () => {
    // Arrange
    const dados = { titulo: '  Trinca na placa ', descricao: ' Trinca junto ao canal  ' };

    // Act
    const resultado = editarSolicitacaoSchema.safeParse(dados);

    // Assert
    expect(resultado.data).toEqual({ titulo: 'Trinca na placa', descricao: 'Trinca junto ao canal' });
  });
});
