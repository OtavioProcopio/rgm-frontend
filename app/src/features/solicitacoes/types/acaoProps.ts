import type { Solicitacao } from './solicitacaoTypes';

/**
 * Contrato comum das ações: `onClose` é chamado quando a ação é concluída e fecha direto;
 * `onCancelar` é chamado quando o usuário desiste, e quem abriu decide se confirma o descarte.
 */
export type AcaoProps = {
  solicitacao: Solicitacao;
  onClose: () => void;
  onCancelar: () => void;
};
