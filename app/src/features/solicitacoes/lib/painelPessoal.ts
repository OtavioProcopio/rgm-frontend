/** O painel pessoal está vazio quando não há solicitação aberta, sob responsabilidade nem concluída. */
export function painelPessoalVazio(
  minhas: number | undefined,
  sobMinhaResponsabilidade: number | undefined,
  concluidas: number | undefined,
): boolean {
  return (minhas ?? 0) === 0 && (sobMinhaResponsabilidade ?? 0) === 0 && (concluidas ?? 0) === 0;
}
