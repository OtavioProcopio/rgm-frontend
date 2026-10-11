# Plano de implementação — Pacote de correções do frontend (#153, #146, #139, #141 e #138)

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| RF-01 (#153) | `useMetricas({ enabled })` com o perfil vindo do `usePerfil`; seção só para gestor e administrador | Esconder só a seção e deixar a chamada | A chamada responderia 403 e some em silêncio; a spec exige nenhuma requisição |
| RF-02/RF-03 (#146) | Propriedade `limpavel` no `Select`, desligada por padrão: quando ligada, a opção de apoio é escolhível; sem ela segue desabilitada | Inferir de `required`; tirar o `disabled` de todos | Os formulários não passam `required` ao `select`, então inferir erra; tirar de todos quebraria RF-03 |
| RF-04/RF-05 (#139) | Um mapeador único, `mensagemDaApi(error)`, que troca **frases conhecidas** do backend (senha curta, senha atual incorreta, acesso negado ao detalhe, conflito otimista) e o status 401; devolve `null` quando não conhece. O detalhe da solicitação trata **todo 403** como acesso negado (`getMensagemDoDetalhe`) | Mapear 403 e 409 por status em todo lugar (versão inicial do plano); traduzir em cada `lib/*Messages.ts`; mexer no texto do backend | Fonte única; backend fora de escopo. Mapear 403/409 por status em todo lugar trocou mensagens específicas (409 de duplicidade, 403 de ação de evidência) por texto genérico e enganoso: descoberto na T014 e corrigido na convergência |
| RF-04 saída | `ErrorState` ganha `action` opcional (ou reaproveita o que já tem); o detalhe passa o link "Voltar ao quadro" no 403 | Redirecionar sozinho para o quadro | Redirecionar esconde o motivo; o link é a saída explícita |
| RF-06 (#141) | Hook que pede `size=1` sem filtro de status nem de período, só quando as cinco colunas somam zero, para o operador sem filtro; se houver 1, o quadro renderiza as colunas vazias com o aviso "Últimos 30 dias" que a coluna já tem | Contagem sempre na abertura; filtro de período novo | RNF-04: no máximo 1 requisição extra e só no caso vazio; filtro novo está fora de escopo |
| RF-07/RF-08 (#138) | Reescrever o cenário no `evidencias.spec.ts` em dois: acesso negado e autor de solicitação encerrada | Apagar o teste | Esclarecimento de 2026-10-10 |

## Padrões de projeto aplicados

| Padrão | Onde | Problema que resolve | Custo aceito |
|---|---|---|---|
| Função pura de mapeamento (tabela de frases conhecidas) | `shared/lib/mensagensDaApi.ts` | Texto cru do backend na tela | Lista que precisa crescer com as frases novas |

**Considerados e recusados:** Strategy/Chain para mensagens (a tabela resolve com uma função
de 20 linhas); contexto React de erros (não há estado a compartilhar).

## Arquivos a criar ou alterar

Caminhos relativos a `app/`; testes espelhados em `app/tests/unit/<mesmo caminho sob src>`.

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| auth | `src/features/auth/pages/PerfilPage.tsx` | alterar (RF-01, já codificado); usa `mensagemDaApi` na falha de senha | `tests/unit/features/auth/pages/PerfilPage.test.tsx` |
| shared | `src/shared/components/Select/Select.tsx` | alterar: propriedade `limpavel` | `tests/unit/shared/components/Select/Select.test.tsx` |
| solicitacoes | `src/features/solicitacoes/components/SolicitacaoFilters.tsx` | alterar: `limpavel` nos 5 filtros | `tests/unit/features/solicitacoes/components/SolicitacaoFilters.test.tsx` |
| admin | `src/features/admin/modelos/components/ModelosFilters.tsx` | alterar: `limpavel` em máquina e status | `tests/unit/features/admin/modelos/components/ModelosFilters.test.tsx` |
| shared | `src/shared/lib/mensagensDaApi.ts` | criar | `tests/unit/shared/lib/mensagensDaApi.test.ts` |
| solicitacoes | `src/features/solicitacoes/lib/solicitacaoMessages.ts` | alterar: `getSolicitacaoErrorMessage` usa o mapeador | `tests/unit/features/solicitacoes/lib/solicitacaoMessages.test.ts` |
| admin | `src/features/admin/usuarios/lib/usuarioMessages.ts` | alterar: usa o mapeador no ramo padrão | `tests/unit/features/admin/usuarios/lib/usuarioMessages.test.ts` |
| shared | `src/shared/components/ErrorState/ErrorState.tsx` | alterar só se não tiver `action` | `tests/unit/shared/components/ErrorState/ErrorState.test.tsx` |
| solicitacoes | `src/features/solicitacoes/pages/SolicitacaoDetalhePage.tsx` | alterar: ação "Voltar ao quadro" | `tests/unit/features/solicitacoes/pages/SolicitacaoDetalhePage.test.tsx` |
| solicitacoes | `src/features/solicitacoes/hooks/useTemSolicitacaoDoOperador.ts` | criar | `tests/unit/features/solicitacoes/hooks/useTemSolicitacaoDoOperador.test.ts` |
| solicitacoes | `src/features/solicitacoes/components/KanbanBoard.tsx` | alterar: vazio só quando nada existe | `tests/unit/features/solicitacoes/components/KanbanBoard.test.tsx` |
| e2e | `tests/e2e/evidencias.spec.ts` | alterar: dois cenários | (é o próprio teste) |
| docs | `openspec/README.md` | alterar: linha da spec 014 (Princípio 12) | — |

Os caminhos exatos dos testes existentes são conferidos na T001; se algum não existir, a
tarefa cria o espelhado.

## Contrato entre camadas

- `mensagemDaApi(error: unknown): string | null` é função pura em `shared/lib`; nunca lança.
  O 403 genérico não é mapeado ali: só o detalhe da solicitação o interpreta como acesso
  negado, pela função `getMensagemDoDetalhe` em `solicitacoes/lib/solicitacaoMessages.ts`.
  As `lib/*Messages.ts` das features chamam o mapeador primeiro e mantêm o próprio
  comportamento quando recebem `null`.
- `Select` não conhece regra de negócio: `limpavel` só decide se a opção de apoio é
  escolhível; o filtro que o usa já trata o valor vazio como "sem filtro".
- `KanbanBoard` decide o vazio; o hook novo só responde "existe alguma solicitação para este
  operador?" e fica desabilitado fora do caso vazio.
- Erro continua sendo tratado na borda de tela (`ErrorState`, `setErro`), como hoje.

## Dependências externas

Nenhuma nova.

## Impacto no contrato de operação

Nenhum alvo ou variável novos. Pipeline: `make validate`; e2e pelo alvo já existente do
Playwright, contra o backend de `develop`.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| `limpavel` esquecido em um filtro | média | Teste por filtro com `userEvent.selectOptions` voltando ao vazio (RF-02) |
| Frase do backend muda de texto e o mapeador deixa de casar | média | O 401 é por status e o 403 do detalhe também; o resto cai no texto do backend como hoje; teste com a frase atual |
| Contagem extra do operador some na regra de visibilidade do backend | baixa | Teste com backend real na rodada e2e e `size=1` sem filtros |
| Backend antigo (v1.5.0) responde 200 às métricas | baixa | O perfil do operador não chama mais; sem efeito (RNF-02) |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| Contrato de operação | Tudo por `make`; nenhum alvo novo |
| Arquitetura limpa | Mapeador em `shared/lib`; features dependem dele, nunca o contrário |
| Testes provam a entrega | Todo arquivo de produção alterado ou criado tem teste espelhado; RF-02 por `userEvent` |
| Simplicidade defensável | Uma função e uma propriedade; padrões maiores recusados com motivo |
| Compatibilidade com produção (9) | RNF-02: perfil do operador sem chamada nova; backend não muda |
| Cobertura (10) | ≥ 95% por arquivo tocado, conferido com `make cover-arquivos` |
| Sem autoria de IA (5) | Commits só com o autor configurado |
| Documentação (12) | Linha da 014 em `openspec/README.md` |
