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
          className="mt-2 rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-200"
        >
          Atualizada por outro usuário. Confira a solicitação antes de confirmar.
        </p>
      ) : null}
      {erro ? (
        <p
          role="alert"
          className="mt-2 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300"
        >
          {erro}
        </p>
      ) : null}
    </>
  );
}
