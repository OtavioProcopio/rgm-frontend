export type TipoEvidencia =
  | 'GERAL'
  | 'ABERTURA'
  | 'INSTRUCAO_SERVICO'
  | 'SERVICO_REALIZADO'
  | 'CONCLUSAO'
  | 'DEVOLUCAO';

export type Evidencia = {
  id: string;
  publicUrl: string;
  mimeType: string;
  nomeArquivo: string;
  tamanhoBytes: number;
  enviadaPorUsuarioId: string;
  criadaEm: string;
  tipo: TipoEvidencia;
  descricao: string | null;
};
