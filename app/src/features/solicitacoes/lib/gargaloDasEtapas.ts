import type { EtapaDoTempo, IndicadoresDeGestao } from '../types/solicitacaoTypes';

export type ChaveDaEtapa = keyof IndicadoresDeGestao['etapas'];

export const ROTULO_DA_ETAPA: Record<ChaveDaEtapa, string> = {
  esperaAteIniciar: 'Espera até iniciar',
  execucao: 'Execução',
  esperaDeValidacao: 'Espera de validação',
};

const ORDEM: ChaveDaEtapa[] = ['esperaAteIniciar', 'execucao', 'esperaDeValidacao'];

/**
 * Etapa em que o tempo típico (mediana) é o maior, ou `null` quando nenhuma etapa tem
 * dado. Etapa sem dado não entra na comparação: ausência não é zero.
 */
export function etapaDoGargalo(etapas: Record<ChaveDaEtapa, EtapaDoTempo>): ChaveDaEtapa | null {
  let maior: ChaveDaEtapa | null = null;
  for (const chave of ORDEM) {
    const mediana = etapas[chave].medianaSegundos;
    if (mediana === null) continue;
    const atual = maior === null ? null : etapas[maior].medianaSegundos;
    if (atual === null || mediana > atual) maior = chave;
  }
  return maior;
}

export function textoDoGargalo(etapas: Record<ChaveDaEtapa, EtapaDoTempo>): string {
  const chave = etapaDoGargalo(etapas);
  if (chave === null) return 'Ainda não há dados para dizer onde o tempo se perde.';
  return `O tempo típico se concentra em "${ROTULO_DA_ETAPA[chave]}".`;
}
