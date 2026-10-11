/** Regra única de senha: criar usuário, redefinir senha e trocar a própria senha. */
export const TAMANHO_MINIMO_DA_SENHA = 8;

export const MENSAGEM_DA_SENHA = `A senha deve ter no mínimo ${TAMANHO_MINIMO_DA_SENHA} caracteres.`;

/** A mensagem de erro da senha, ou nulo quando ela atende à regra. */
export function erroDaSenha(senha: string): string | null {
  return senha.length < TAMANHO_MINIMO_DA_SENHA ? MENSAGEM_DA_SENHA : null;
}
