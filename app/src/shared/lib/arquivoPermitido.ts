export const TAMANHO_MAXIMO_MB = 10;
const TAMANHO_MAXIMO_BYTES = TAMANHO_MAXIMO_MB * 1024 * 1024;

const NOME_DO_TIPO = {
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/gif': 'GIF',
  'image/webp': 'WebP',
  'application/pdf': 'PDF',
  'video/mp4': 'MP4',
} as const;

export type TipoDeArquivo = keyof typeof NOME_DO_TIPO;

/** Tipos que a API aceita como evidência de uma solicitação. */
export const TIPOS_DE_EVIDENCIA: readonly TipoDeArquivo[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'video/mp4',
];

/** Tipos aceitos nas telas que só trabalham com imagem (foto de abertura, galeria do modelo). */
export const TIPOS_DE_IMAGEM: readonly TipoDeArquivo[] = ['image/jpeg', 'image/png', 'image/webp'];

/** "JPEG, PNG e WebP" */
export function nomesDosTipos(tipos: readonly TipoDeArquivo[]): string {
  const nomes = tipos.map((tipo) => NOME_DO_TIPO[tipo]);
  return nomes.length > 1 ? `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}` : nomes.join('');
}

/** Mensagem de erro para o usuário, ou nulo se o arquivo pode ser enviado. */
export function validarArquivo(
  arquivo: Pick<File, 'type' | 'size'>,
  tipos: readonly TipoDeArquivo[] = TIPOS_DE_EVIDENCIA,
): string | null {
  if (!tipos.includes(arquivo.type.toLowerCase() as TipoDeArquivo)) {
    return `Tipo de arquivo não permitido. Os tipos aceitos são ${nomesDosTipos(tipos)}.`;
  }
  if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
    return `Arquivo muito grande. O limite é ${TAMANHO_MAXIMO_MB} MB.`;
  }
  return null;
}
