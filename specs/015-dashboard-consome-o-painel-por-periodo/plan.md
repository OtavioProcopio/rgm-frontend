# Plano de implementação — Dashboard sobre o painel por período e quadro ordenado pela API

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.
> Caminhos relativos a `app/`; testes espelhados em `tests/unit/<mesmo caminho sob src>`.

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| Fonte dos indicadores (RF-01, RF-02, RF-03) | Um hook novo `usePainelPorPeriodo(dias)` chama `GET /solicitacoes/metricas/painel`; `useIndicadoresDoPeriodo` e a tendência leem dele | Cada componente chamar a API | Uma requisição por período e por tela; a chave de cache é a mesma para a faixa e para a tendência |
| Fallback (RF-07, RF-08) | O hook expõe `indisponivel` só quando a API responde **404**; nesse caso os hooks da spec 013 (concluídas e histórico) são habilitados; outro erro vira `isError` com "Tentar novamente" | Fallback em qualquer erro; detectar a versão do backend por `/actuator/info` | Decisão do usuário; sem requisição extra para descobrir versão |
| Fila (RF-04) | `sort=prazoLimite&dir=asc` junto de `atrasada=true&emAberto=true`; o tamanho do pedido segue 100 e a ordenação no cliente fica | Pedir só 5 itens | Com o backend antigo (ignora `sort`), 5 itens perderiam a ordem por atraso da spec 013; a ordenação no cliente é idempotente com a da API; o total exato já vem de `totalElements` |
| Ordem do quadro (RF-05, RF-06) | Tabela única status → `sort`/`dir`/texto: A_FAZER `criadaEm desc`, "mais recentes primeiro"; EM_ANDAMENTO e EM_VALIDACAO `prazoLimite asc`, "prazo mais vencido primeiro"; CONCLUIDA e CANCELADA **sem entrada** (sem `sort`, sem texto) | Duas fontes (consulta e rótulo) | Evita a coluna dizer uma ordem e a consulta fazer outra |
| Encerradas | Não ordenar: a API só ordena por criação, prazo e prioridade, e "mais recentes" nas encerradas seria por criação, não por conclusão. Decisão do usuário | Ordenar por criação com rótulo "criadas mais recentes" | Evita um rótulo que pareça afirmar conclusão |
| Tipos | `SolicitacoesFilters` ganha `sort` e `dir`; `PainelPorPeriodo` espelha a resposta | `any` | Contrato explícito |

## Padrões de projeto aplicados

| Padrão | Onde | Problema que resolve | Custo aceito |
|---|---|---|---|
| Tabela de decisão (objeto constante por status) | `lib/ordemDoQuadro.ts` | Consulta e rótulo da coluna divergirem | Um arquivo novo pequeno |
| Adaptador de fonte (hook devolve o mesmo formato nas duas fontes) | `useIndicadoresDoPeriodo` | Componentes não saberem de qual API vêm os números | Os dois caminhos coexistem até a v1.5.0 sair de produção |

**Considerados e recusados:** feature flag por variável de ambiente (o 404 é o sinal real);
interceptor global de 404 (esconderia erro real em outras rotas); cache dos dois períodos em
`localStorage` (sem requisito).

## Arquivos a criar ou alterar

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| tipos | `src/features/solicitacoes/types/solicitacaoTypes.ts` | alterar: `sort`, `dir`, `PainelPorPeriodo` | (tipos) |
| api | `src/features/solicitacoes/api/solicitacoesApi.ts` | alterar: `obterPainel(dias, modeloId)` | `tests/unit/features/solicitacoes/api/solicitacoesApi.test.ts` |
| lib | `src/features/solicitacoes/lib/ordemDoQuadro.ts` | criar | `tests/unit/features/solicitacoes/lib/ordemDoQuadro.test.ts` |
| lib | `src/features/solicitacoes/lib/filtrosDaColuna.ts` | alterar: `sort`/`dir` por status | `tests/unit/features/solicitacoes/lib/filtrosDaColuna.test.ts` |
| hook | `src/features/solicitacoes/hooks/usePainelPorPeriodo.ts` | criar | `tests/unit/features/solicitacoes/hooks/usePainelPorPeriodo.test.ts` |
| hook | `src/features/solicitacoes/hooks/useIndicadoresDoPeriodo.ts` | alterar: painel primeiro, 013 no 404 | `tests/unit/features/solicitacoes/hooks/useIndicadoresDoPeriodo.test.ts` |
| hook | `src/features/solicitacoes/hooks/useHistoricoMetricas.ts` | alterar: série do painel, histórico no 404 | `tests/unit/features/solicitacoes/hooks/solicitacoesHooks.test.ts` |
| hook | `src/features/solicitacoes/hooks/useFilaDeAtencao.ts` | alterar: `sort`/`dir` | `tests/unit/features/solicitacoes/hooks/useFilaDeAtencao.test.ts` |
| lib | `src/features/solicitacoes/lib/leituraDosIndicadores.ts` | alterar: tempo médio em segundos; remove a amostra | `tests/unit/features/solicitacoes/lib/leituraDosIndicadores.test.ts` |
| componente | `src/features/solicitacoes/components/FaixaDeIndicadores.tsx` | alterar: sem "média de 100 de N" | `tests/unit/features/solicitacoes/components/FaixaDeIndicadores.test.tsx` |
| componente | `src/features/solicitacoes/components/TendenciaDoPeriodo.tsx` | alterar: criadas e concluídas por dia | `tests/unit/features/solicitacoes/components/TendenciaDoPeriodo.test.tsx` |
| componente | `src/features/solicitacoes/components/KanbanColumn.tsx` | alterar: texto da ordem no cabeçalho | `tests/unit/features/solicitacoes/components/KanbanColumn.test.tsx` |
| e2e | `tests/e2e/dashboard.spec.ts` e `tests/e2e/kanban.spec.ts` | alterar: cenários novos contra o backend de `develop` | (os próprios) |
| docs | `openspec/README.md` | alterar: linha da spec 015 | — |

Os caminhos exatos dos testes e das funções são conferidos na tarefa de leitura (T001); se
algum espelho não existir, a tarefa o cria.

## Contrato entre camadas

- `usePainelPorPeriodo(dias, {enabled})` devolve `{data, isLoading, isError, indisponivel,
  refetch}`; `indisponivel` é verdadeiro **somente** para `ApiError` com status 404.
- `useIndicadoresDoPeriodo` mantém o formato que a faixa já consome; só muda a origem.
- A tabela `ordemDoQuadro` é a única fonte de `sort`/`dir` por status e do texto do cabeçalho.
- O operador nunca chama o painel: `enabled` segue o mesmo critério do dashboard (perfil).

## Dependências externas

Nenhuma nova.

## Impacto no contrato de operação

Nenhum alvo ou variável novos. Pipeline: `make validate`; e2e pelo alvo existente, contra o
backend de `develop` (já com a spec 011).

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Backend antigo responde 404 com corpo diferente do esperado | baixa | O sinal é o status HTTP; teste com `ApiError` 404 |
| Duas fontes de indicadores divergem e o gestor vê saltos ao publicar o back | média | Esperado e documentado; a v1.5.0 sai de produção junto com a v1.6.0 |
| Rótulo "criadas mais recentes" estranho para quem espera "concluídas" | média | Texto honesto e issue de backend para ordenar por conclusão |
| `sort` ignorado pelo backend antigo faz o A Fazer continuar com as antigas primeiro | aceita | Comportamento igual ao de hoje; some com a v1.6.0 |
| Contagem de requisições do RNF-01 estoura por causa de efeito de dois hooks na mesma tela | média | Mesma chave de cache para faixa e tendência; teste conta chamadas |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| Contrato de operação | Tudo por `make`; nenhum alvo novo |
| Arquitetura limpa | Regras em `lib` e `hooks`; componentes só apresentam; API só em `*Api.ts` |
| Testes provam a entrega | Teste espelhado para cada arquivo de produção; fallback e 404 provados por hook |
| Simplicidade defensável | Uma tabela e um hook novos; flags e interceptors recusados |
| Compatibilidade com produção (9) | RF-07, RF-09 e RNF-03 provados com 404 e `sort` ignorado |
| Cobertura (10) | ≥ 95% por arquivo tocado, conferido com `make cover-arquivos` |
| Sem autoria de IA (5) | Commits só com o autor configurado |
| Documentação (12) | Linha da 015 em `openspec/README.md` |

## Ampliação: login (#131) e retorno do sistema (#126, sem backend)

Escrita depois das fases 1 a 3, a pedido do usuário (2026-10-10). Só front; nenhuma dependência
de backend nova.

### Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| Nome do produto (RF-13) | Constante única `NOME_DO_PRODUTO = 'Rei Auto Parts'` em `shared/lib` usada por login, layout e logo; `index.html` com o mesmo texto | Texto em cada arquivo | Evita voltar a divergir |
| Mostrar senha (RF-15) | Componente novo `shared/components/CampoDeSenha` sobre o `Input`, com botão "Mostrar senha"/"Ocultar senha" (`aria-pressed`) | Alterar o `Input` para todos | O `Input` serve a todos os campos; só a senha tem o botão |
| Mensagens do login (RF-17) | Função pura `mensagemDoLogin(error)` em `features/auth/lib`: 401, 429 e erro de rede (`TypeError`/sem resposta) | Mapear dentro do componente | Testável sem tela; reutilizável |
| Aviso de sucesso (RF-21) | `ToastProvider` + `useToast()` em `shared/components/Toast`, região `aria-live="polite"` no canto inferior, 4 s | Biblioteca de toast | Sem dependência nova; o requisito é pequeno |
| Esqueleto (RF-18) | `Skeleton` e `LoadingState` com `role="status"` e texto oculto; esqueletos de cartão no quadro e de linha nas tabelas | Spinner | Pede "forma do conteúdo" |
| Nova tentativa (RF-19) | `onRetry` ligado ao `refetch` nas telas de erro de carregamento; `ErrorState` ganha `role="alert"` | Botão "Recarregar página" | Sem perder estado |
| Erro de ação (RF-22) | O diálogo da ação **continua aberto** e mostra o erro dentro dele, com `role="alert"`; para ações sem diálogo, junto do botão | Toast de erro | Erro não some sozinho (RF-22) |
| Movimento (RF-23) | Variante `motion-reduce:` do Tailwind nas animações novas | Hook de preferência | Cobertura nativa do CSS |

### Arquivos a criar ou alterar

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| shared | `src/shared/lib/produto.ts` (`NOME_DO_PRODUTO`) | criar | `tests/unit/shared/lib/produto.test.ts` |
| shared | `src/shared/components/CampoDeSenha/CampoDeSenha.tsx` | criar | `tests/unit/shared/components/CampoDeSenha/CampoDeSenha.test.tsx` |
| auth | `src/features/auth/lib/mensagemDoLogin.ts` | criar | `tests/unit/features/auth/lib/mensagemDoLogin.test.ts` |
| auth | `src/features/auth/pages/LoginPage.tsx` | alterar | `tests/unit/features/auth/pages/LoginPage.test.tsx` |
| shared | `src/shared/components/Logo/Logo.tsx`, `src/app/layouts/AppLayout.tsx`, `index.html` | alterar | `Logo.test.tsx`, `AppLayout.test.tsx`, `BarraLateral.test.tsx` |
| shared | `src/shared/components/Toast/ToastProvider.tsx` (+ `useToast`) | criar | `tests/unit/shared/components/Toast/ToastProvider.test.tsx` |
| app | provedores do app (onde o `QueryClientProvider` é montado) | alterar | `tests/unit/app/providers/...` existente |
| shared | `LoadingState.tsx`, `Skeleton.tsx` (novo), `EmptyState.tsx`, `ErrorState.tsx` | alterar/criar | espelhos em `tests/unit/shared/components/...` |
| solicitacoes | `KanbanBoard.tsx` (esqueleto de cartões), telas com `ErrorState` sem `onRetry` | alterar | espelhos existentes |
| solicitacoes | `hooks/useExecutarAcao.ts` e ações de triar, comentar, anexar e editar | alterar: toast de sucesso | `tests/unit/features/solicitacoes/hooks/useExecutarAcao.test.ts` e ações |
| admin | criação de usuário (`NovoUsuarioPage`) | alterar: toast de sucesso | `tests/unit/features/admin/usuarios/pages/NovoUsuarioPage.test.tsx` |
| e2e | `tests/e2e/auth.spec.ts` | alterar: mensagens de login | (o próprio) |

Nomes e pontos exatos de montagem são conferidos na primeira tarefa de cada fase.

### Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Esqueleto e `role="status"` quebram muitos testes que procuram o texto "Carregando..." | alta | Manter o texto como conteúdo oculto do esqueleto; ajustar os testes sem afrouxar asserção |
| Toast que cobre botão no celular de 390 px | média | Posição no canto, largura máxima, teste visual em 390 px |
| O 429 do backend vem sem corpo legível | baixa | Decisão pelo status HTTP, não pela mensagem |
| Mudar o nome do produto em testes e e2e antigos | média | Constante única e busca por `RGM Auto Parts` |
