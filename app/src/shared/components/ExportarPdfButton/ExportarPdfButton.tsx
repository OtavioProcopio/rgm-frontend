import { Button } from '@/shared/components/Button/Button';
import { useExportarPdf } from '@/shared/hooks/useExportarPdf';

type Props = {
  /** Busca o PDF na API. */
  buscar: () => Promise<Blob>;
  nomeDoArquivo: () => string;
};

/** Botão de exportação; a falha aparece junto dele. */
export function ExportarPdfButton({ buscar, nomeDoArquivo }: Props) {
  const { exportar, exportando, erro } = useExportarPdf({ buscar, nomeDoArquivo });

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="secondary" disabled={exportando} onClick={exportar}>
        {exportando ? 'Exportando...' : 'Exportar PDF'}
      </Button>
      {erro ? (
        <p role="alert" className="max-w-xs text-right text-sm text-danger-fg">
          {erro}
        </p>
      ) : null}
    </div>
  );
}
