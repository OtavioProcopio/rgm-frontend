type Props = { mensagem: string | null };

export function AcaoErro({ mensagem }: Props) {
  if (!mensagem) return null;
  return (
    <p
      role="alert"
      className="mt-2 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300"
    >
      {mensagem}
    </p>
  );
}
