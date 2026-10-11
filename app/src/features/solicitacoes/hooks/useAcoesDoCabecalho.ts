import { createElement, useState, type ReactNode } from 'react';

import type { AcaoDoMenu } from '@/shared/components/PageHeader/PageHeader';

import { DialogoDaAcao } from '../actions/DialogoDaAcao';
import {
  PRINCIPAL_POR_STATUS,
  rotuloDaAcao,
  separarAcoes,
  type AcaoSolicitacao,
} from '../lib/acoesSolicitacao';
import type { Solicitacao } from '../types/solicitacaoTypes';
import { useAcoesPermitidas } from './useAcoesPermitidas';

export type AcaoPrincipal = {
  rotulo: string;
  variante: 'primary' | 'danger';
  aoAcionar: () => void;
};

export type AcoesDoCabecalho = {
  principal: AcaoPrincipal | null;
  maisAcoes: AcaoDoMenu[];
  dialogo: ReactNode;
};

type Editar = { aoAcionar: () => void };
type Abrir = (acao: AcaoSolicitacao) => void;

function principalDe(acao: AcaoSolicitacao, abrir: Abrir): AcaoPrincipal {
  return {
    rotulo: rotuloDaAcao(acao),
    variante: acao === 'CANCELAR' ? 'danger' : 'primary',
    aoAcionar: () => abrir(acao),
  };
}

function itemDoMenu(acao: AcaoSolicitacao, abrir: Abrir): AcaoDoMenu {
  const item: AcaoDoMenu = { rotulo: rotuloDaAcao(acao), onSelect: () => abrir(acao) };
  return acao === 'CANCELAR' ? { ...item, perigo: true } : item;
}

function menuDe(acoes: AcaoSolicitacao[], abrir: Abrir, editar?: Editar | null): AcaoDoMenu[] {
  const itens = acoes.map((acao) => itemDoMenu(acao, abrir));
  const cancelar = itens.filter((item) => item.perigo);
  const demais = itens.filter((item) => !item.perigo);
  const edicao: AcaoDoMenu[] = editar ? [{ rotulo: 'Editar', onSelect: editar.aoAcionar }] : [];
  return [...edicao, ...demais, ...cancelar];
}

type Visao = Pick<AcoesDoCabecalho, 'principal' | 'maisAcoes'>;

function visaoDeAcaoUnica(
  principal: AcaoSolicitacao | null,
  abrir: Abrir,
  editar?: Editar | null,
): Visao {
  if (editar) {
    const aoAcionar = editar.aoAcionar;
    return { principal: { rotulo: 'Editar', variante: 'primary', aoAcionar }, maisAcoes: [] };
  }
  return { principal: principal ? principalDe(principal, abrir) : null, maisAcoes: [] };
}

function montarAcoes(
  solicitacao: Solicitacao,
  conjunto: ReadonlySet<AcaoSolicitacao>,
  abrir: Abrir,
  editar?: Editar | null,
): Visao {
  const { principal, outras } = separarAcoes(conjunto, solicitacao.status);
  const total = conjunto.size + (editar ? 1 : 0);
  if (total === 0) return { principal: null, maisAcoes: [] };
  if (total === 1) return visaoDeAcaoUnica(principal, abrir, editar);
  const daEtapa = principal !== null && principal === PRINCIPAL_POR_STATUS[solicitacao.status];
  const restantes = !daEtapa && principal ? [principal, ...outras] : outras;
  return {
    principal: daEtapa && principal ? principalDe(principal, abrir) : null,
    maisAcoes: menuDe(restantes, abrir, editar),
  };
}

/** Ação principal, menu "Mais ações" e diálogo da ação aberta para o cabeçalho da solicitação. */
export function useAcoesDoCabecalho(
  solicitacao: Solicitacao,
  editar?: Editar | null,
): AcoesDoCabecalho {
  const acoesDe = useAcoesPermitidas();
  const [acaoAberta, setAcaoAberta] = useState<AcaoSolicitacao | null>(null);
  const conjunto = acoesDe(solicitacao);
  const { principal, maisAcoes } = montarAcoes(solicitacao, conjunto, setAcaoAberta, editar);
  const dialogo = acaoAberta
    ? createElement(DialogoDaAcao, {
        acao: acaoAberta,
        solicitacao,
        onClose: () => setAcaoAberta(null),
      })
    : null;
  return { principal, maisAcoes, dialogo };
}
