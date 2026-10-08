type Props = {
  erro: string | null;
  /** A solicitação mudou por evento enquanto o formulário estava aberto. */
  atualizadaPorOutro?: boolean;
};

/** Mensagens do formulário de uma ação: mudança feita por outro usuário e erro da ação. */
export function AcaoAvisos({ erro, atualizadaPorOutro }: Props) {
  return (
    <>
      {atualizadaPorOutro ? (
        <p
          role="status"
          className="mt-2 rounded-md bg-warning-soft px-4 py-2 text-sm text-warning-fg"
        >
          Atualizada por outro usuário. Confira a solicitação antes de confirmar.
        </p>
      ) : null}
      {erro ? (
        <p role="alert" className="mt-2 rounded-md bg-danger-soft px-4 py-2 text-sm text-danger-fg">
          {erro}
        </p>
      ) : null}
    </>
  );
}
