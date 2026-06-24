export const evidenciasKeys = {
  all: ['evidencias'] as const,
  bySolicitacao: (solicitacaoId: string) =>
    [...evidenciasKeys.all, 'solicitacao', solicitacaoId] as const,
};
