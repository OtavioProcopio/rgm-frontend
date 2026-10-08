import { WifiOff } from 'lucide-react';

import { useSemAtualizacao } from '../hooks/useSemAtualizacao';

/**
 * Aviso de que a tela não está recebendo atualizações. A região de status fica sempre
 * montada para a tecnologia assistiva anunciar o texto quando ele aparece, sem mover o foco.
 */
export function AvisoSemAtualizacao() {
  const semAtualizacao = useSemAtualizacao();

  return (
    <div role="status">
      {semAtualizacao ? (
        <p className="flex items-center gap-1.5 bg-warning-soft px-4 py-1.5 text-xs font-medium text-warning-fg sm:px-6 lg:px-8">
          <WifiOff size={14} aria-hidden className="shrink-0" />
          Sem atualização automática
        </p>
      ) : null}
    </div>
  );
}
