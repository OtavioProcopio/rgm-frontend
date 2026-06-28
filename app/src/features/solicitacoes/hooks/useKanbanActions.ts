import { useMutation, useQueryClient } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import type {
  CancelarSolicitacaoRequest,
  DevolverSolicitacaoRequest,
  EncerrarSolicitacaoRequest,
  TriarSolicitacaoRequest,
  EnviarParaValidacaoRequest,
} from '../types/solicitacaoTypes';
import { solicitacoesKeys } from './solicitacoesKeys';

export function useKanbanActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: solicitacoesKeys.lists() });

  const triar = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & TriarSolicitacaoRequest) =>
      solicitacoesApi.triar(id, data),
    onSuccess: invalidate,
  });

  const enviarValidacao = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & EnviarParaValidacaoRequest) =>
      solicitacoesApi.enviarParaValidacao(id, data),
    onSuccess: invalidate,
  });

  const encerrar = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & EncerrarSolicitacaoRequest) =>
      solicitacoesApi.encerrar(id, data),
    onSuccess: invalidate,
  });

  const cancelar = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & CancelarSolicitacaoRequest) =>
      solicitacoesApi.cancelar(id, data),
    onSuccess: invalidate,
  });

  const devolver = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & DevolverSolicitacaoRequest) =>
      solicitacoesApi.devolver(id, data),
    onSuccess: invalidate,
  });

  return { triar, enviarValidacao, encerrar, cancelar, devolver };
}
