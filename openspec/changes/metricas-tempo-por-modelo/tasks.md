## 1. API e hook do ranking

- [ ] 1.1 Adicionar `obterMetricasPorModelo({ sort, dir, page, size })` a `features/solicitacoes/api/solicitacoesApi.ts` (ou arquivo equivalente de metricas)
- [ ] 1.2 Criar tipos de resposta (`MetricaPorModelo`, `MetricasPorModeloPage`) em `features/solicitacoes/types`
- [ ] 1.3 Criar hook `useMetricasPorModelo` com `useQuery`, chave de cache incluindo sort/dir/page/size

## 2. Tabela de ranking no Dashboard

- [ ] 2.1 Criar componente de tabela ordenavel (cabecalhos clicaveis para tempo/intervalo) dentro de `ModelosTab.tsx` ou como componente novo importado por ele
- [ ] 2.2 Estado de paginacao e ordenacao local na aba, repassados ao hook
- [ ] 2.3 Estado vazio quando nenhum modelo tem dados suficientes
- [ ] 2.4 Botao "Exportar PDF" apontando para o endpoint de export do backend com os parametros de ordenacao atuais
- [ ] 2.5 Testes de componente (renderiza tabela, alterna ordenacao, estado vazio)

## 3. Metricas no detalhe do modelo

- [ ] 3.1 Estender o `useMemo` de `ModeloDashboard` (em `ModeloDetalhePage.tsx`) para calcular tempo medio de resolucao e intervalo medio entre solicitacoes a partir do array `solicitacoes` ja carregado
- [ ] 3.2 Adicionar os dois novos `KpiCard` ao grid existente, com estado "—" quando dados insuficientes
- [ ] 3.3 Testes cobrindo: modelo com 2+ concluidas (metricas calculadas), modelo com 0-1 concluidas (estado vazio)

## 4. Qualidade

- [ ] 4.1 `tsc -b --noEmit`, `eslint .`
- [ ] 4.2 `vitest run --coverage` (>= 95% nos arquivos nao excluidos pela config)
- [ ] 4.3 Rodar `/opsx:archive` ao final, sincronizando `openspec/specs/metricas-dashboard/spec.md` e `openspec/specs/modelos/spec.md` com as mudancas deste change
