import { createContext, useContext } from 'react';

export type ToastContextValue = {
  /** Mostra um aviso de sucesso que some sozinho. */
  avisar: (mensagem: string) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider.');
  }

  return context;
}
