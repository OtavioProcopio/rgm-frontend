import { ApiError } from '@/shared/api/apiError';

/** Entrega ao navegador um arquivo já baixado, com o nome informado. */
export function baixarArquivo(conteudo: Blob, nome: string): void {
  const url = URL.createObjectURL(conteudo);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', nome);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function mensagemDeFalhaNaExportacao(erro: unknown): string {
  const motivo = erro instanceof ApiError && erro.message ? erro.message : 'Tente novamente.';
  return `Não foi possível exportar o PDF. ${motivo}`;
}
