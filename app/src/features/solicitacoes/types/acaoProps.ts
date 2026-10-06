import type { Solicitacao } from './solicitacaoTypes';

/** Contrato comum das ações: `onClose` é chamado ao cancelar e ao concluir. */
export type AcaoProps = {
  solicitacao: Solicitacao;
  onClose: () => void;
};
