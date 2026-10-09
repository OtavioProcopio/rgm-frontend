import { describe, expect, it } from 'vitest';

import type {
  AtividadeSolicitacao,
  TipoAtividadeSolicitacao,
} from '@/features/solicitacoes/types/solicitacaoTypes';

import {
  nomeDeQuemAbriu,
  nomesDosResponsaveis,
} from '@/features/solicitacoes/lib/nomesDosUsuarios';

function atividade(tipo: TipoAtividadeSolicitacao, autorNome: string): AtividadeSolicitacao {
  return {
    id: `atv-${tipo}`,
    solicitacaoId: 's1',
    tipo,
    deStatus: null,
    paraStatus: null,
    comentario: null,
    autorUsuarioId: 'u-autor',
    autorNome,
    criadaEm: '2026-10-01T12:00:00Z',
  };
}

describe('nomesDosResponsaveis', () => {
  it('deve juntar os nomes da API quando todos os ids vêm em responsaveis', () => {
    const solicitacao = {
      responsavelIds: ['a', 'b'],
      responsaveis: [
        { id: 'a', nome: 'Ana' },
        { id: 'b', nome: 'Bruno' },
      ],
    };

    const nomes = nomesDosResponsaveis(solicitacao, []);

    expect(nomes).toBe('Ana, Bruno');
  });

  it('deve juntar os nomes da lista quando a API não informa responsaveis', () => {
    const solicitacao = { responsavelIds: ['a', 'b'] };
    const usuarios = [
      { id: 'b', nome: 'Bruno' },
      { id: 'a', nome: 'Ana' },
    ];

    const nomes = nomesDosResponsaveis(solicitacao, usuarios);

    expect(nomes).toBe('Ana, Bruno');
  });

  it('deve completar com a lista quando a API informa só parte dos nomes', () => {
    const solicitacao = { responsavelIds: ['a', 'b'], responsaveis: [{ id: 'b', nome: 'Bruno' }] };
    const usuarios = [{ id: 'a', nome: 'Ana' }];

    const nomes = nomesDosResponsaveis(solicitacao, usuarios);

    expect(nomes).toBe('Ana, Bruno');
  });

  it('deve contar os responsáveis quando falta o nome de um deles', () => {
    const solicitacao = { responsavelIds: ['a', 'b'], responsaveis: [{ id: 'a', nome: 'Ana' }] };

    const nomes = nomesDosResponsaveis(solicitacao, []);

    expect(nomes).toBe('2 responsáveis');
  });

  it('deve usar o singular quando o único id não tem nome', () => {
    const solicitacao = { responsavelIds: ['a'] };

    const nomes = nomesDosResponsaveis(solicitacao, []);

    expect(nomes).toBe('1 responsável');
  });

  it('deve devolver nulo quando a lista de ids está vazia', () => {
    const solicitacao = { responsavelIds: [] };

    const nomes = nomesDosResponsaveis(solicitacao, [{ id: 'a', nome: 'Ana' }]);

    expect(nomes).toBeNull();
  });
});

describe('nomeDeQuemAbriu', () => {
  it('deve usar o nome da API quando abertaPorNome vem preenchido', () => {
    const solicitacao = { abertaPorUsuarioId: 'u1', abertaPorNome: 'Carla' };
    const atividades = [atividade('ABERTURA', 'Outro')];

    const nome = nomeDeQuemAbriu(solicitacao, atividades, [{ id: 'u1', nome: 'Lista' }]);

    expect(nome).toBe('Carla');
  });

  it('deve usar o autor da atividade quando existe uma ABERTURA', () => {
    const solicitacao = { abertaPorUsuarioId: 'u1' };
    const atividades = [atividade('COMENTARIO', 'Comentarista'), atividade('ABERTURA', 'Davi')];

    const nome = nomeDeQuemAbriu(solicitacao, atividades, [{ id: 'u1', nome: 'Lista' }]);

    expect(nome).toBe('Davi');
  });

  it('deve usar a lista de usuários quando não há nome da API nem atividade ABERTURA', () => {
    const solicitacao = { abertaPorUsuarioId: 'u1' };
    const usuarios = [{ id: 'u1', nome: 'Elisa' }];

    const nome = nomeDeQuemAbriu(solicitacao, [], usuarios);

    expect(nome).toBe('Elisa');
  });

  it('deve devolver nulo quando nenhuma fonte conhece quem abriu', () => {
    const solicitacao = { abertaPorUsuarioId: 'u1', abertaPorNome: '' };

    const nome = nomeDeQuemAbriu(solicitacao, [], [{ id: 'outro', nome: 'Outro' }]);

    expect(nome).toBeNull();
  });

  it('deve ignorar a atividade quando ela não é ABERTURA', () => {
    const solicitacao = { abertaPorUsuarioId: 'u1' };
    const atividades = [atividade('ATRIBUICAO', 'Fábio')];

    const nome = nomeDeQuemAbriu(solicitacao, atividades, []);

    expect(nome).toBeNull();
  });
});
