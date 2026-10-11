import type { AcaoSolicitacao } from '../lib/acoesSolicitacao';
import type { AcaoProps } from '../types/acaoProps';
import { CancelarAction } from './CancelarAction';
import { DevolverAction } from './DevolverAction';
import { EncerrarAction } from './EncerrarAction';
import { EnviarValidacaoAction } from './EnviarValidacaoAction';
import { ResponsaveisAction } from './ResponsaveisAction';
import { TriarAction } from './TriarAction';

const COMPONENTE_DA_ACAO: Record<AcaoSolicitacao, (props: AcaoProps) => React.JSX.Element> = {
  TRIAR: TriarAction,
  ALTERAR_RESPONSAVEIS: ResponsaveisAction,
  ENVIAR_VALIDACAO: EnviarValidacaoAction,
  DEVOLVER: DevolverAction,
  ENCERRAR: EncerrarAction,
  CANCELAR: CancelarAction,
};

type Props = AcaoProps & { acao: AcaoSolicitacao };

/** Formulário da ação escolhida; o mesmo para o quadro e para o detalhe. */
export function AcaoSolicitacaoAtiva({ acao, solicitacao, onClose, onCancelar }: Props) {
  const Acao = COMPONENTE_DA_ACAO[acao];
  return <Acao solicitacao={solicitacao} onClose={onClose} onCancelar={onCancelar} />;
}
