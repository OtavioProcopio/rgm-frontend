import { AvisoFotoNaoEnviada } from '@/features/evidencias/components/AvisoFotoNaoEnviada';

import { DevolucaoModal } from '../components/DevolucaoModal';
import { useDevolverSolicitacao } from '../hooks/useDevolverSolicitacao';
import { useExecutarAcao } from '../hooks/useExecutarAcao';
import { acaoFeitaSemFoto } from '../lib/solicitacaoMessages';
import { AcaoErro } from './AcaoErro';
import type { AcaoProps } from '../types/acaoProps';

export function DevolverAction({ solicitacao, onClose }: AcaoProps) {
  const devolver = useDevolverSolicitacao(solicitacao.id);
  const { erro, aviso, executar } = useExecutarAcao(solicitacao.id, onClose);

  if (aviso) return <AvisoFotoNaoEnviada {...aviso} onSair={onClose} />;

  return (
    <>
      <DevolucaoModal
        isPending={devolver.isPending}
        onCancel={onClose}
        onConfirm={(data, foto) =>
          executar(() => devolver.mutateAsync(data), {
            file: foto,
            tipo: 'DEVOLUCAO',
            feito: acaoFeitaSemFoto.DEVOLVER,
            descricao: data.motivo,
          })
        }
      />
      <AcaoErro mensagem={erro} />
    </>
  );
}
