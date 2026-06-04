type LoadingStateProps = {
  title?: string;
};

export function LoadingState({ title = 'Carregando...' }: LoadingStateProps) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
      {title}
    </div>
  );
}
