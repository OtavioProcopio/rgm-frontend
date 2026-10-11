import type { Solicitacao } from '@/features/solicitacoes/types/solicitacaoTypes';

export function criarSolicitacao(extra: Partial<Solicitacao> = {}): Solicitacao {
  return {
    id: 's1',
    titulo: 'Trocar correia',
    descricao: 'Correia gasta',
    tipo: 'REPARO',
    status: 'A_FAZER',
    prioridade: null,
    modeloId: 'm1',
    abertaPorUsuarioId: 'u1',
    comentarioFinal: null,
    criadaEm: '2026-01-01T00:00:00Z',
    atualizadaEm: '2026-01-01T00:00:00Z',
    concluidaEm: null,
    canceladaEm: null,
    responsavelIds: [],
    ...extra,
  };
}
