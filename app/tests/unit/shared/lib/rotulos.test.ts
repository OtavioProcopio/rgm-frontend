import { describe, expect, it } from 'vitest';

import {
  rotuloDaPrioridade,
  rotuloDoPerfil,
  rotuloDoStatus,
  rotuloDoTipoDeAtividade,
  rotuloDoTipoDeEvidencia,
  rotuloDoTipoDeModelo,
  rotuloDoTipoDeSolicitacao,
} from '@/shared/lib/rotulos';

describe('rotuloDoStatus', () => {
  it.each([
    ['A_FAZER', 'A fazer'],
    ['EM_ANDAMENTO', 'Em andamento'],
    ['EM_VALIDACAO', 'Em validação'],
    ['CONCLUIDA', 'Concluída'],
    ['CANCELADA', 'Cancelada'],
  ] as const)('deve dar a "%s" o rótulo "%s" quando o valor é um status', (valor, esperado) => {
    // Act
    const rotulo = rotuloDoStatus[valor];

    // Assert
    expect(rotulo).toBe(esperado);
  });

  it('deve ter cinco rótulos quando todos os status são contados', () => {
    // Act
    const valores = Object.keys(rotuloDoStatus);

    // Assert
    expect(valores).toHaveLength(5);
  });
});

describe('rotuloDoTipoDeSolicitacao', () => {
  it.each([
    ['REPARO', 'Reparo'],
    ['INSPECAO', 'Inspeção'],
    ['REENGENHARIA', 'Reengenharia'],
    ['CRIACAO', 'Criação de modelo'],
  ] as const)(
    'deve dar a "%s" o rótulo "%s" quando o valor é um tipo de solicitação',
    (valor, esperado) => {
      // Act
      const rotulo = rotuloDoTipoDeSolicitacao[valor];

      // Assert
      expect(rotulo).toBe(esperado);
    },
  );

  it('deve ter quatro rótulos quando todos os tipos de solicitação são contados', () => {
    // Act
    const valores = Object.keys(rotuloDoTipoDeSolicitacao);

    // Assert
    expect(valores).toHaveLength(4);
  });
});

describe('rotuloDaPrioridade', () => {
  it.each([
    ['BAIXA', 'Baixa'],
    ['MEDIA', 'Média'],
    ['ALTA', 'Alta'],
    ['URGENTE', 'Urgente'],
  ] as const)(
    'deve dar a "%s" o rótulo "%s" quando o valor é uma prioridade',
    (valor, esperado) => {
      // Act
      const rotulo = rotuloDaPrioridade[valor];

      // Assert
      expect(rotulo).toBe(esperado);
    },
  );

  it('deve ter quatro rótulos quando todas as prioridades são contadas', () => {
    // Act
    const valores = Object.keys(rotuloDaPrioridade);

    // Assert
    expect(valores).toHaveLength(4);
  });
});

describe('rotuloDoPerfil', () => {
  it.each([
    ['ADMINISTRADOR', 'Administrador'],
    ['GESTOR', 'Gestor'],
    ['OPERADOR', 'Operador'],
    ['EXTERNO', 'Externo'],
  ] as const)('deve dar a "%s" o rótulo "%s" quando o valor é um perfil', (valor, esperado) => {
    // Act
    const rotulo = rotuloDoPerfil[valor];

    // Assert
    expect(rotulo).toBe(esperado);
  });

  it('deve ter quatro rótulos quando todos os perfis são contados', () => {
    // Act
    const valores = Object.keys(rotuloDoPerfil);

    // Assert
    expect(valores).toHaveLength(4);
  });
});

describe('rotuloDoTipoDeModelo', () => {
  it.each([
    ['PLACA_ALUMINIO', 'Placa Alumínio'],
    ['MADEIRA_E_3D', 'Madeira e 3D'],
    ['ALUMINIO_E_3D', 'Alumínio e 3D'],
    ['RESINA', 'Resina'],
    ['COQUILHA_ACO', 'Coquilha em Aço'],
  ] as const)(
    'deve dar a "%s" o rótulo "%s" quando o valor é um tipo de modelo',
    (valor, esperado) => {
      // Act
      const rotulo = rotuloDoTipoDeModelo[valor];

      // Assert
      expect(rotulo).toBe(esperado);
    },
  );

  it('deve ter cinco rótulos quando todos os tipos de modelo são contados', () => {
    // Act
    const valores = Object.keys(rotuloDoTipoDeModelo);

    // Assert
    expect(valores).toHaveLength(5);
  });
});

describe('rotuloDoTipoDeEvidencia', () => {
  it.each([
    ['GERAL', 'Geral'],
    ['ABERTURA', 'Abertura'],
    ['INSTRUCAO_SERVICO', 'Instrução de serviço'],
    ['SERVICO_REALIZADO', 'Serviço realizado'],
    ['CONCLUSAO', 'Conclusão'],
    ['DEVOLUCAO', 'Devolução'],
  ] as const)(
    'deve dar a "%s" o rótulo "%s" quando o valor é um tipo de evidência',
    (valor, esperado) => {
      // Act
      const rotulo = rotuloDoTipoDeEvidencia[valor];

      // Assert
      expect(rotulo).toBe(esperado);
    },
  );

  it('deve ter seis rótulos quando todos os tipos de evidência são contados', () => {
    // Act
    const valores = Object.keys(rotuloDoTipoDeEvidencia);

    // Assert
    expect(valores).toHaveLength(6);
  });
});

describe('rotuloDoTipoDeAtividade', () => {
  it.each([
    ['ABERTURA', 'Solicitação aberta'],
    ['ATRIBUICAO', 'Responsável atribuído'],
    ['MUDANCA_STATUS', 'Status alterado'],
    ['COMENTARIO', 'Comentário'],
    ['EVIDENCIA_ADICIONADA', 'Evidência anexada'],
  ] as const)(
    'deve dar a "%s" o rótulo "%s" quando o valor é um tipo de atividade',
    (valor, esperado) => {
      // Act
      const rotulo = rotuloDoTipoDeAtividade[valor];

      // Assert
      expect(rotulo).toBe(esperado);
    },
  );

  it('deve ter cinco rótulos quando todos os tipos de atividade são contados', () => {
    // Act
    const valores = Object.keys(rotuloDoTipoDeAtividade);

    // Assert
    expect(valores).toHaveLength(5);
  });
});

describe('rótulos dos sete conjuntos', () => {
  it.each([
    ['status', rotuloDoStatus],
    ['tipo de solicitação', rotuloDoTipoDeSolicitacao],
    ['prioridade', rotuloDaPrioridade],
    ['perfil', rotuloDoPerfil],
    ['tipo de modelo', rotuloDoTipoDeModelo],
    ['tipo de evidência', rotuloDoTipoDeEvidencia],
    ['tipo de atividade', rotuloDoTipoDeAtividade],
  ])('deve não ter rótulo vazio quando o conjunto é %s', (_conjunto, rotulos) => {
    // Act
    const vazios = Object.values(rotulos).filter((rotulo) => rotulo.trim() === '');

    // Assert
    expect(vazios).toEqual([]);
  });
});
