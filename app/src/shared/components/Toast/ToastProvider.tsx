import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';

import { ToastContext } from '@/shared/components/Toast/toastContext';

export const DURACAO_DO_AVISO_EM_MS = 4000;

type Aviso = { id: number; mensagem: string };

/**
 * Avisos temporários de sucesso. A região fica sempre no DOM: leitor de tela só anuncia
 * mudança em região que já existia. Erro não passa por aqui, porque não pode sumir sozinho.
 */
export function ToastProvider({ children }: PropsWithChildren) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const proximoId = useRef(0);
  const temporizadores = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const ativos = temporizadores.current;
    return () => ativos.forEach(clearTimeout);
  }, []);

  const avisar = useCallback((mensagem: string) => {
    const id = proximoId.current++;
    setAvisos((atuais) => [...atuais, { id, mensagem }]);

    const temporizador = setTimeout(() => {
      temporizadores.current.delete(temporizador);
      setAvisos((atuais) => atuais.filter((aviso) => aviso.id !== id));
    }, DURACAO_DO_AVISO_EM_MS);
    temporizadores.current.add(temporizador);
  }, []);

  const valor = useMemo(() => ({ avisar }), [avisar]);

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:left-auto sm:items-end"
      >
        {avisos.map((aviso) => (
          <p
            key={aviso.id}
            className="pointer-events-auto w-full max-w-sm rounded-md border border-line bg-surface px-4 py-3 text-sm font-medium text-fg shadow-xl transition-opacity motion-reduce:transition-none"
          >
            {aviso.mensagem}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
