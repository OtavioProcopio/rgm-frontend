/** Se o texto digitado, sem as pontas, é diferente da instrução que a solicitação já tem. */
export function instrucaoMudou(atual: string | null, digitado: string): boolean {
  return digitado.trim() !== (atual ?? '').trim();
}
