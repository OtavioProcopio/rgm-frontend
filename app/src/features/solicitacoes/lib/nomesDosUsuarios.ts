import type { AtividadeSolicitacao, Solicitacao } from '../types/solicitacaoTypes';

type UsuarioComNome = { id: string; nome: string };

function nomeDoResponsavel(
  id: string,
  solicitacao: Pick<Solicitacao, 'responsaveis'>,
  usuarios: readonly UsuarioComNome[],
): string | undefined {
  const daApi = solicitacao.responsaveis?.find((responsavel) => responsavel.id === id)?.nome;
  return daApi || usuarios.find((usuario) => usuario.id === id)?.nome || undefined;
}

function textoDaQuantidade(quantidade: number): string {
  return quantidade === 1 ? '1 responsável' : `${quantidade} responsáveis`;
}

export function nomesDosResponsaveis(
  solicitacao: Pick<Solicitacao, 'responsavelIds' | 'responsaveis'>,
  usuarios: readonly UsuarioComNome[],
): string | null {
  const ids = solicitacao.responsavelIds;
  if (ids.length === 0) return null;
  const nomes = ids.map((id) => nomeDoResponsavel(id, solicitacao, usuarios));
  if (nomes.some((nome) => nome === undefined)) return textoDaQuantidade(ids.length);
  return nomes.join(', ');
}

export function nomeDeQuemAbriu(
  solicitacao: Pick<Solicitacao, 'abertaPorUsuarioId' | 'abertaPorNome'>,
  atividades: readonly AtividadeSolicitacao[],
  usuarios: readonly UsuarioComNome[],
): string | null {
  if (solicitacao.abertaPorNome) return solicitacao.abertaPorNome;
  const abertura = atividades.find((atividade) => atividade.tipo === 'ABERTURA');
  if (abertura?.autorNome) return abertura.autorNome;
  return usuarios.find((usuario) => usuario.id === solicitacao.abertaPorUsuarioId)?.nome ?? null;
}
