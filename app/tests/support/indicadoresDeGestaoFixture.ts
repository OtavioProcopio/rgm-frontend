import type { IndicadoresDeGestao } from '@/features/solicitacoes/types/solicitacaoTypes';

/** Resposta de gestão completa e coerente; cada teste sobrescreve só o que importa. */
export function criarIndicadoresDeGestao(
  sobrescrita: Partial<IndicadoresDeGestao> = {},
): IndicadoresDeGestao {
  return {
    dias: 30,
    inicio: '2026-09-12T03:00:00Z',
    fim: '2026-10-12T03:00:00Z',
    prazo: {
      concluidasComPrioridade: 25,
      noPrazo: 21,
      percentualNoPrazo: 84,
      concluidasSemPrioridade: 2,
      porPrioridade: [
        { prioridade: 'URGENTE', concluidas: 5, noPrazo: 4, percentualNoPrazo: 80 },
        { prioridade: 'ALTA', concluidas: 5, noPrazo: 5, percentualNoPrazo: 100 },
        { prioridade: 'MEDIA', concluidas: 10, noPrazo: 8, percentualNoPrazo: 80 },
        { prioridade: 'BAIXA', concluidas: 0, noPrazo: 0, percentualNoPrazo: null },
      ],
    },
    resolucao: { concluidas: 22, medianaSegundos: 7200, p90Segundos: 172800 },
    backlog: {
      abertas: 30,
      menosDeUmDia: 10,
      umATresDias: 8,
      maisDeTresDias: 12,
      semResponsavel: 6,
    },
    etapas: {
      esperaAteIniciar: { amostras: 20, medianaSegundos: 86400, mediaSegundos: 90000 },
      execucao: { amostras: 18, medianaSegundos: 7200, mediaSegundos: 8000 },
      esperaDeValidacao: { amostras: 0, medianaSegundos: null, mediaSegundos: null },
    },
    devolucao: { enviadasParaValidacao: 12, devolucoes: 2, taxa: 16.7 },
    porMaquina: [{ maquina: 'FBOX', abertas: 20, emAtraso: 3, tempoMedioResolucaoSegundos: 3600 }],
    reincidentes: [
      {
        modeloId: '6dacdfac-4812-4b37-9a4c-20ed9516dc0f',
        codigo: 'MDL-1',
        versao: 2,
        maquina: 'FBOX',
        solicitacoes: 4,
      },
    ],
    carga: {
      solicitacoesDistintas: 10,
      responsaveis: [
        { usuarioId: 'f55804cf-a4a1-424b-ac63-f556cf1d03d6', nome: 'Ana', abertas: 6 },
        { usuarioId: '46e54385-c9d8-4881-95f3-8c89a1a4bcd8', nome: 'Bruno', abertas: 5 },
      ],
    },
    ...sobrescrita,
  };
}
