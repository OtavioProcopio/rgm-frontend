import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { modelosApi } from '@/features/admin/modelos/api/modelosApi';
import { modelosKeys } from '@/features/admin/modelos/hooks/modelosKeys';
import { ApiError } from '@/shared/api/apiError';

import {
  FILTROS_PADRAO,
  TAMANHO_DO_BLOCO,
  paraConsulta,
  type FiltrosDoCatalogo,
} from '../lib/filtrosDoCatalogo';

export type AvisoDaAbertura = 'foraDoFiltro' | 'naoEncontrado' | null;

type ResultadoDaAbertura = {
  /** O bloco em que a lista abre. */
  paginaInicial: number;
  /** Os filtros a que `paginaInicial` se refere. */
  assinaturaFinal: string;
  /** Os filtros do link, antes de qualquer correção. */
  assinaturaOriginal: string;
  aviso: AvisoDaAbertura;
  /** Filtros a trocar quando o modelo do link está fora do filtro dele. */
  filtrosParaAplicar: Partial<FiltrosDoCatalogo> | null;
  /** O modelo do link não existe: tirá-lo do endereço. */
  limparModelo: boolean;
};

type Consulta = ReturnType<typeof paraConsulta>;

const assinar = (consulta: Consulta) => JSON.stringify(consulta);
const blocoDa = (posicao: number) => Math.floor((posicao - 1) / TAMANHO_DO_BLOCO);

/** Descobre o bloco do modelo do link, ou o que fazer quando ele está fora do filtro ou não existe. */
async function abrir(id: string, consulta: Consulta): Promise<ResultadoDaAbertura> {
  const original = assinar(consulta);
  try {
    const posicao = await modelosApi.posicao(id, consulta);
    if (posicao.posicao !== null) {
      return {
        paginaInicial: blocoDa(posicao.posicao),
        assinaturaFinal: original,
        assinaturaOriginal: original,
        aviso: null,
        filtrosParaAplicar: null,
        limparModelo: false,
      };
    }
    const modelo = await modelosApi.buscarPorId(id);
    const todos = { tipo: '', maquina: '', q: '', inativos: !modelo.ativo };
    const consultaDeTodos = paraConsulta({ ...FILTROS_PADRAO, ...todos });
    const nova = await modelosApi.posicao(id, consultaDeTodos);
    return {
      paginaInicial: nova.posicao === null ? 0 : blocoDa(nova.posicao),
      assinaturaFinal: assinar(consultaDeTodos),
      assinaturaOriginal: original,
      aviso: 'foraDoFiltro',
      filtrosParaAplicar: todos,
      limparModelo: false,
    };
  } catch (erro) {
    if (erro instanceof ApiError && erro.status === 404) {
      return {
        paginaInicial: 0,
        assinaturaFinal: original,
        assinaturaOriginal: original,
        aviso: 'naoEncontrado',
        filtrosParaAplicar: null,
        limparModelo: true,
      };
    }
    throw erro;
  }
}

type Props = {
  filtros: FiltrosDoCatalogo;
  /** Troca filtros sem criar entrada no histórico (modelo do link fora do filtro). */
  substituirFiltros: (mudanca: Partial<FiltrosDoCatalogo>) => void;
  definirModelo: (id: string) => void;
};

/**
 * Abre o catálogo num link direto: dado o modelo do endereço, descobre em que bloco ele está e a
 * lista começa nele. Se o modelo existe mas não atende aos filtros do endereço, os filtros voltam a
 * "todos" e a tela avisa; se não existe, avisa e deixa o primeiro do filtro assumir. Só age na
 * abertura da tela: mudar um filtro depois tira o modelo do endereço e a lista recomeça no bloco 0.
 */
export function useAberturaDoCatalogo({ filtros, substituirFiltros, definirModelo }: Props) {
  // O link com que a tela abriu, guardado para não seguir o endereço que muda depois.
  const [idDoLink] = useState(filtros.modelo);
  const [consultaDoLink] = useState(() => paraConsulta(filtros));

  const abertura = useQuery({
    queryKey: [...modelosKeys.lists(), 'abertura', idDoLink, assinar(consultaDoLink)],
    queryFn: () => abrir(idDoLink, consultaDoLink),
    enabled: idDoLink !== '',
    retry: false,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  const resultado = abertura.data;
  const assinaturaAtual = assinar(paraConsulta(filtros));
  // Enquanto o endereço ainda é o do link, a correção da abertura está por aplicar.
  const noLink = filtros.modelo === idDoLink && assinaturaAtual === resultado?.assinaturaOriginal;
  const aplicar =
    resultado !== undefined &&
    noLink &&
    (resultado.filtrosParaAplicar !== null || resultado.limparModelo);

  useEffect(() => {
    if (!resultado || !noLink) return;
    if (resultado.filtrosParaAplicar) substituirFiltros(resultado.filtrosParaAplicar);
    else if (resultado.limparModelo) definirModelo('');
  }, [resultado, noLink, substituirFiltros, definirModelo]);

  return {
    pronta: idDoLink === '' || abertura.isError || (resultado !== undefined && !aplicar),
    aviso: resultado?.aviso ?? null,
    /** O bloco em que a lista abre; só vale enquanto os filtros são os que ele calculou. */
    paginaInicial: resultado?.assinaturaFinal === assinaturaAtual ? resultado.paginaInicial : 0,
  };
}
