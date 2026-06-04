type LoadingStateProps = {
  title?: string;
};

export function LoadingState({ title = 'Carregando...' }: LoadingStateProps) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
      {title}
    </div>
  );
}
