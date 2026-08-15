## Context

Ver `proposal.md` para a motivacao. Duas superficies com origens de dados
bem diferentes:
- Dashboard (aba Modelos): precisa comparar potencialmente milhares de
  modelos — so faz sentido com o calculo agregado do backend, paginado.
- Detalhe do modelo: a pagina ja busca todas as solicitacoes daquele modelo
  especifico (`useSolicitacoes({ modeloId, page: 0, size: 50 })`) para
  alimentar o `ModeloDashboard` existente (total/abertas/concluidas/taxa de
  sucesso, todos calculados no cliente). As duas metricas novas se encaixam
  no mesmo padrao.

## Goals / Non-Goals

**Goals:**
- Ranking no Dashboard usa exclusivamente o novo endpoint paginado do
  backend — nunca tenta calcular localmente a partir de uma listagem grande
  de modelos.
- Metricas no detalhe do modelo sao 100% client-side, sem endpoint novo,
  para nao duplicar uma chamada de API que ja existe.

**Non-Goals:**
- Nao adiciona filtro por maquina/periodo ao ranking nesta primeira versao
  (mesma decisao do backend).
- Nao tenta reconciliar os dois calculos se um dia divergirem (o do detalhe
  do modelo e limitado as primeiras 50 solicitacoes daquele modelo, mesma
  limitacao que os KPIs existentes do `ModeloDashboard` ja tem hoje — nao e
  uma regressao introduzida por este change).

## Decisions

### Hook dedicado para o ranking, com `useQuery` parametrizado por sort/dir/page
`useMetricasPorModelo({ sort, dir, page, size })` segue o mesmo padrao dos
demais hooks de listagem paginada da feature `solicitacoes` (ex.:
`useSolicitacoes`), com a chave de cache incluindo todos os parametros para
que trocar ordenacao ou pagina dispare um novo fetch (e mantenha cache das
combinacoes ja visitadas).

### Calculo client-side reaproveitando o `useMemo` existente do `ModeloDashboard`
As duas novas metricas entram no mesmo `useMemo` que ja calcula
total/abertas/concluidas/taxaSucesso a partir do array de `solicitacoes`,
filtrando por `status === 'CONCLUIDA'` e usando `criadaEm`/`concluidaEm` (ja
presentes no tipo `Solicitacao` do frontend). Alternativa considerada:
buscar essas duas metricas do endpoint de ranking do backend filtrando por
`modeloId` — rejeitada porque o backend nao expoe esse filtro nesta versao
(ver design do backend) e porque o calculo local e trivial dado que os dados
ja estao em memoria.

### Botao de exportar PDF do ranking abre a URL do backend diretamente
Segue o mesmo padrao ja usado pelos demais exports PDF do sistema (`window
open`/link para o endpoint, sem processamento client-side do arquivo).

## Risks / Trade-offs

- [Risco] Calculo do detalhe do modelo fica levemente inconsistente com o
  ranking do Dashboard quando um modelo tem mais de 50 solicitacoes (o
  ranking do backend usa TODAS; o detalhe usa so as primeiras 50 buscadas) →
  Mitigacao: aceitavel para esta versao (mesma limitacao pre-existente dos
  outros KPIs do `ModeloDashboard`); documentado explicitamente aqui e na
  spec para nao ser "descoberto" como bug depois.
