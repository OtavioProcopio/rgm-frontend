import { useState } from 'react';

import { Button } from '@/shared/components/Button/Button';
import { baixarArquivo, mensagemDeFalhaNaExportacao } from '@/shared/lib/exportacao';

type Props = {
  /** Busca o PDF na API. */
  buscar: () => Promise<Blob>;
  nomeDoArquivo: () => string;
};

/** Botão de exportação; a falha aparece junto dele. */
export function ExportarPdfButton({ buscar, nomeDoArquivo }: Props) {
  const [exportando, setExportando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function exportar() {
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

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="secondary" disabled={exportando} onClick={exportar}>
        {exportando ? 'Exportando...' : 'Exportar PDF'}
      </Button>
      {erro ? (
        <p role="alert" className="max-w-xs text-right text-sm text-red-600 dark:text-red-400">
          {erro}
        </p>
      ) : null}
    </div>
  );
}
