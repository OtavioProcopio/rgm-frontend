import type { ContagensDeModelos } from '@/features/admin/modelos/types/modeloTypes';

export type BotaoDoCatalogo = {
  /** Valor do filtro; vazio é o botão "Todos"/"Todas". */
  valor: string;
  rotulo: string;
  /** Quantos modelos traria; nulo quando as contagens não estão disponíveis (ou no "Todos"). */
  total: number | null;
  escolhido: boolean;
  /** Sem modelos, e não é o escolhido: não leva a lugar nenhum. */
  desabilitado: boolean;
};

type Opcao = { valor: string; rotulo: string };

/**
 * Botões de um grupo: o "Todos", cada opção do catálogo e, se o filtro escolhido não está no
 * catálogo (por exemplo, veio de um link), ele também. O número de cada botão é o da API; o que
 * ela omite é 0, e botão com 0 fica desabilitado a menos que seja o escolhido.
 */
export function botoesDoCatalogo(
  rotuloDoTodos: string,
  opcoes: readonly Opcao[],
  totais: ReadonlyMap<string, number> | null,
  escolhido: string,
): BotaoDoCatalogo[] {
  const todas: Opcao[] = [...opcoes];
  if (escolhido && !todas.some((opcao) => opcao.valor === escolhido)) {
    todas.push({ valor: escolhido, rotulo: escolhido });
  }
  return [
    {
      valor: '',
      rotulo: rotuloDoTodos,
      total: null,
      escolhido: escolhido === '',
      desabilitado: false,
    },
    ...todas.map((opcao): BotaoDoCatalogo => {
      const total = totais ? (totais.get(opcao.valor) ?? 0) : null;
      const eEscolhido = opcao.valor === escolhido;
      return {
        valor: opcao.valor,
        rotulo: opcao.rotulo,
        total,
        escolhido: eEscolhido,
        desabilitado: total === 0 && !eEscolhido,
      };
    }),
  ];
}

export function totaisPorTipo(contagens: ContagensDeModelos | undefined) {
  return contagens ? new Map(contagens.porTipo.map((c) => [c.tipo, c.total])) : null;
}

export function totaisPorMaquina(contagens: ContagensDeModelos | undefined) {
  return contagens ? new Map(contagens.porMaquina.map((c) => [c.maquina, c.total])) : null;
}
