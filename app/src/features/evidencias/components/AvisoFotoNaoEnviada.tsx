import { Button } from '@/shared/components/Button/Button';

import type { EstadoDoAnexo } from '../hooks/useAnexoComAviso';

type Props = {
  /** Frase que diz o que foi feito e que a foto não foi enviada. */
  mensagem: string;
  estado: Exclude<EstadoDoAnexo, null>;
  enviando?: boolean;
  /** Rótulo do botão que tira o usuário do aviso. */
  rotuloSair?: string;
  onTentarNovamente: () => void;
  onSair: () => void;
};

/** Resultado do envio da foto que acompanha uma ação já concluída. */
export function AvisoFotoNaoEnviada({
  mensagem,
  estado,
  enviando,
  rotuloSair = 'Fechar',
  onTentarNovamente,
  onSair,
}: Props) {
  if (estado === 'enviado') {
    return (
      <div role="status" className="rounded-md border border-success bg-success-soft p-4 text-sm">
        <p className="font-semibold text-success-fg">Foto enviada.</p>
        <div className="mt-3">
          <Button type="button" onClick={onSair}>
            {rotuloSair}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div role="alert" className="rounded-md border border-warning bg-warning-soft p-4 text-sm">
      <p className="font-semibold text-warning-fg">{mensagem}</p>
      <p className="mt-1 text-warning-fg">
        Você pode tentar de novo agora ou anexar a foto depois, pelo detalhe da solicitação.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" disabled={enviando} onClick={onTentarNovamente}>
          {enviando ? 'Enviando...' : 'Tentar novamente'}
        </Button>
        <Button type="button" variant="secondary" disabled={enviando} onClick={onSair}>
          {rotuloSair}
        </Button>
      </div>
    </div>
  );
}
