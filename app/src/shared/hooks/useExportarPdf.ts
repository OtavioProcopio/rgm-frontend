import { useState } from 'react';

import { baixarArquivo, mensagemDeFalhaNaExportacao } from '@/shared/lib/exportacao';

type Params = {
  /** Busca o PDF na API. */
  buscar: () => Promise<Blob>;
  nomeDoArquivo: () => string;
};

type Resultado = {
  exportar: () => Promise<void>;
  exportando: boolean;
  erro: string | null;
};

/** Estado e ação da exportação de PDF; a falha vira texto em `erro`. */
export function useExportarPdf({ buscar, nomeDoArquivo }: Params): Resultado {
  const [exportando, setExportando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);

  async function exportar(): Promise<void> {
    setExportando(true);
    setErro(null);
    try {
      baixarArquivo(await buscar(), nomeDoArquivo());
    } catch (err) {
      setErro(mensagemDeFalhaNaExportacao(err));
    } finally {
      setExportando(false);
    }
  }

  return { exportar, exportando, erro };
}
