export function ModeloFotoCapa({ fotoUrl }: { fotoUrl: string | null }) {
  if (!fotoUrl) {
    return (
      <div className="flex h-14 w-20 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        Sem foto
      </div>
    );
  }

  return <img src={fotoUrl} alt="" className="h-14 w-20 rounded-md object-cover" />;
}
