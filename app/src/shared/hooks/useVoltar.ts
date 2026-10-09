import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

const CHAVE_DA_PRIMEIRA_ENTRADA = 'default';

export function useVoltar(reserva: string): () => void {
  const navigate = useNavigate();
  const { key } = useLocation();
  const temTelaAnterior: boolean = key !== CHAVE_DA_PRIMEIRA_ENTRADA;

  return useCallback((): void => {
    if (temTelaAnterior) {
      navigate(-1);
      return;
    }
    navigate(reserva);
  }, [navigate, reserva, temTelaAnterior]);
}
