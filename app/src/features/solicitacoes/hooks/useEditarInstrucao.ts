import { useMutation, useQueryClient } from '@tanstack/react-query';

import { solicitacoesApi } from '../api/solicitacoesApi';
import type { EditarInstrucaoRequest, Solicitacao } from '../types/solicitacaoTypes';
import { solicitacoesKeys } from './solicitacoesKeys';

/**
 * Corrige a instrução. A resposta da API não traz responsáveis nem ações permitidas, e uma
 * correção não muda nenhum dos dois: o detalhe em cache só recebe o que a correção mudou, sem
 * nova consulta. O histórico é recarregado porque ganhou a atividade "instrução alterada".
 */
export function useEditarInstrucao(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EditarInstrucaoRequest) => solicitacoesApi.editarInstrucao(id, payload),
    onSuccess: (resposta) => {
      queryClient.setQueryData<Solicitacao>(solicitacoesKeys.detail(id), (atual) =>
        atual
          ? { ...atual, instrucao: resposta.instrucao, atualizadaEm: resposta.atualizadaEm }
          : atual,
      );
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: solicitacoesKeys.atividades(id) });
    },
  });
}
