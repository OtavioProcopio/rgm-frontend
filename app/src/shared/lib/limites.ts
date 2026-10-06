/** Tamanho máximo de cada texto: o que a API consegue gravar. Fonte única dos formulários. */
export const LIMITES = {
  solicitacaoTitulo: 255,
  // descrição de solicitação, comentário, motivo, comentário final e observações
  textoLongo: 2000,
  // limite que a API já impõe no envio para validação
  comentarioValidacao: 1000,
  modeloCodigo: 100,
  modeloDescricao: 255,
  modeloMaquina: 255,
  modeloPretendidoCodigo: 50,
  modeloPretendidoMaquina: 100,
  maquinaNome: 255,
  usuarioNome: 255,
  usuarioEmail: 255,
} as const;

// O contador só aparece perto do fim, para não poluir o campo enquanto sobra espaço.
const FRACAO_DE_AVISO = 0.9;

export function mensagemDeLimite(limite: number): string {
  return `Máximo de ${limite.toLocaleString('pt-BR')} caracteres.`;
}

/** Quantos caracteres ainda cabem, ou nulo enquanto o texto está longe do limite. */
export function caracteresRestantes(tamanho: number, limite: number): number | null {
  const inicioDoAviso = Math.ceil(limite * FRACAO_DE_AVISO);
  if (tamanho < inicioDoAviso) {
    return null;
  }
  return Math.max(limite - tamanho, 0);
}
