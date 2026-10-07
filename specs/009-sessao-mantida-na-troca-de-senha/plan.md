# Plano de implementação — Sessão mantida na troca de senha e quadro do operador com o que ele abriu

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.

> **Layout e testes:** o código segue no layout legado (`app/src/features/...`), conforme o
> Princípio 7. Os testes moram em `app/tests/unit/`, no mesmo caminho que o arquivo testado
> tem em `app/src`. Não há `app/tests/bdd/` nem alvo `make bdd` (desvio herdado das features
> anteriores): cada cenário da spec vira um teste de módulo ou de componente, no arquivo
> indicado.

Prefixos: `SRC` = `app/src`, `TST` = `app/tests/unit`.

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| Quem guarda as credenciais novas | o provedor de autenticação ganha `renovarCredenciais(token, refreshToken)`, que grava os dois e sobe um contador `versaoDaSessao` exposto no contexto | gravar direto na tela de perfil; gravar dentro da função de API | o provedor já é quem grava as credenciais no login; a tela e o hook não precisam conhecer o armazenamento (RF-01) |
| Quem chama `renovarCredenciais` | `useAlterarSenha`, no sucesso da troca, quando a resposta traz as duas credenciais | a `PerfilPage` | componente fala com hook (Princípio 7); a página continua só mostrando sucesso ou erro (RF-02) |
| Como decidir se a resposta traz credenciais | função pura `credenciaisDaTroca(resposta)` em `lib/`: devolve o par quando `token` e `refreshToken` são textos não vazios; senão `null` | condição escrita dentro do hook | hooks estão fora da medição de cobertura; a regra precisa morar onde é medida (Princípio 10). Com `null`, nada é gravado (RF-04) |
| Falha na troca | nenhum código novo: `renovarCredenciais` só é chamado no sucesso | — | RF-05; provado por teste |
| Como o tempo real reabre na hora | `useSolicitacaoEvents` passa a depender de `versaoDaSessao`: quando ela muda, o efeito fecha a conexão atual e abre outra com a credencial nova | marca no cache de consultas; evento global do navegador; esperar a reconexão da feature 007 | resposta do usuário em 2026-10-07 ("reconectar na hora"). O hook já lê o contexto de autenticação; não cria canal novo (RF-03, RNF-02) |
| Aviso "sem atualização automática" durante a troca | nenhum código novo: o aviso só aparece com a conexão fechada há mais de 10 s, e a reabertura é imediata | suprimir o aviso explicitamente | o prazo da feature 007 já cobre; provado por teste |
| Tipo da resposta da troca | `SenhaAlteradaResponse` = dados do usuário mais `token` e `refreshToken` opcionais | campos obrigatórios | o backend v1.5.0 não os envia (RF-04, Princípio 9) |
| Regra da relação do operador | função pura `relacaoDoOperador(solicitacao, usuarioId)` em `lib/`: `'ATRIBUIDA'` se o id está em `responsavelIds`; senão `'ABERTA'` se é `abertaPorUsuarioId`; senão `null`. Rótulos no mesmo módulo | condição dentro do card | RNF-06: uma definição só, medida e testada (RF-07) |
| Quem calcula a relação | o `KanbanBoard`, só quando o perfil é operador, e repassa pronta por `KanbanColumn` até `KanbanCard` (propriedade opcional `relacao`) | o card ler o usuário autenticado | o card continua sem conhecer sessão; gestor e administrador nunca recebem a propriedade (RF-08) |
| De onde vem o id do operador | `usePerfil`, como `useAcoesPermitidas` já faz | incluir o id no usuário do contexto | o usuário do contexto só tem nome e perfil; mudar isso mexe no login e não é pedido aqui |
| Onde a marca aparece no card | etiqueta de texto na linha do tipo, sem cor de significado | cor de borda; ícone sozinho | texto dispensa legenda; cor fica para prioridade e prazo, como pede a #128 |
| Quadro vazio com ação | `EmptyState` ganha `action` opcional (um nó); o quadro passa o link "Nova solicitação" ou o botão "Limpar filtro" | componente próprio de quadro vazio | um ponto só; a #126 vai precisar da mesma propriedade (RF-06, RF-12) |
| Como o quadro sabe que há filtro | o quadro já recebe `modeloId`, `dataInicio` e `dataFim`; há filtro se algum estiver preenchido | propriedade `temFiltro` | deriva do que já chega |
| Como limpar o filtro | o quadro recebe `onLimparFiltro`; a `SolicitacoesPage` zera modelo e período | o quadro guardar o filtro | o filtro é estado da página |
| Para quem valem os dois textos de quadro vazio | só operador, como hoje | todos os perfis | RF-06 e RF-12 falam do operador; para gestor o quadro segue mostrando as colunas |
| RF-09, RF-10 e RF-11 | sem mudança de código: abrir solicitação já invalida as listas, e a aba pessoal já consulta por "aberta por mim" sem filtrar por responsável. A entrega é o teste que prova cada um | reescrever a aba pessoal | a spec registra que, se a tela já chega no resultado, a entrega é o teste; a paginação dela é da especificação 005 |
| Verificação de RNF-01 e RNF-02 | teste do hook de eventos com `EventSource` simulado (conexão nova aberta no mesmo ciclo em que a versão muda) e roteiro de medição com API simulada, registrado na convergência | e2e contra backend real | o e2e do repositório exige backend no ar |

## Padrões de projeto aplicados

| Padrão | Onde | Problema que resolve | Custo aceito |
|---|---|---|---|
| nenhum | — | — | — |

Considerados e recusados: **Observer** próprio para avisar a troca de credenciais (o contexto
React já notifica quem o lê); **Strategy** para os textos do quadro vazio (são dois casos e
uma condição).

## Arquivos a criar ou alterar

### Parte 1 — Sessão mantida na troca de senha (RF-01 a RF-05)

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| core/domain | `SRC/features/auth/types/authTypes.ts` | alterar: tipo `SenhaAlteradaResponse` | — (só tipos) |
| core/domain | `SRC/features/auth/lib/credenciaisDaTroca.ts` | criar: `credenciaisDaTroca` | `TST/features/auth/lib/credenciaisDaTroca.test.ts` (criar) |
| clients | `SRC/features/auth/api/perfilApi.ts` | alterar: `alterarSenha` devolve `SenhaAlteradaResponse` | — (fora da medição; coberto pelo teste do hook) |
| infra | `SRC/app/providers/authContext.ts` | alterar: `renovarCredenciais` e `versaoDaSessao` no contexto | `TST/app/providers/AuthProvider.test.tsx` |
| infra | `SRC/app/providers/AuthProvider.tsx` | alterar: implementa os dois | `TST/app/providers/AuthProvider.test.tsx` (criar) |
| presenters | `SRC/features/auth/hooks/useAlterarSenha.ts` | alterar: no sucesso, chama `renovarCredenciais` quando há credenciais | `TST/features/auth/hooks/authHooks.test.ts` |
| presenters | `SRC/features/auth/pages/PerfilPage.tsx` | sem mudança de código | `TST/features/auth/pages/PerfilPage.test.tsx`: continua na tela com a mensagem de sucesso; erro não renova |
| presenters | `SRC/features/solicitacoes/hooks/useSolicitacaoEvents.ts` | alterar: `versaoDaSessao` entra nas dependências do efeito | `TST/features/solicitacoes/hooks/useSolicitacaoEvents.test.ts` |
| presenters | `SRC/features/solicitacoes/hooks/useSemAtualizacao.ts` | sem mudança de código | `TST/features/solicitacoes/hooks/useSemAtualizacao.test.ts`: sem aviso quando a conexão reabre antes de 10 s |

### Parte 2 — Quadro do operador (RF-06 a RF-12)

| Camada | Arquivo | Ação | Teste espelhado |
|---|---|---|---|
| core/domain | `SRC/features/solicitacoes/lib/relacaoDoOperador.ts` | criar: `relacaoDoOperador`, `ROTULO_DA_RELACAO` | `TST/features/solicitacoes/lib/relacaoDoOperador.test.ts` (criar) |
| presenters | `SRC/shared/components/EmptyState/EmptyState.tsx` | alterar: propriedade `action` | `TST/shared/components/EmptyState/EmptyState.test.tsx` |
| presenters | `SRC/features/solicitacoes/components/KanbanCard.tsx` | alterar: propriedade `relacao` e a etiqueta | `TST/features/solicitacoes/components/KanbanCard.test.tsx` |
| presenters | `SRC/features/solicitacoes/components/KanbanColumn.tsx` | alterar: repassa `relacaoDe` ao card | `TST/features/solicitacoes/components/KanbanColumn.test.tsx` |
| presenters | `SRC/features/solicitacoes/components/KanbanBoard.tsx` | alterar: dois textos de quadro vazio do operador, ações, cálculo da relação, `onLimparFiltro` | `TST/features/solicitacoes/components/KanbanBoard.test.tsx` |
| presenters | `SRC/features/solicitacoes/pages/SolicitacoesPage.tsx` | alterar: fornece `onLimparFiltro` | `TST/features/solicitacoes/pages/SolicitacoesPage.test.tsx` |
| presenters | `SRC/features/solicitacoes/hooks/useAbrirSolicitacao.ts` | sem mudança de código | `TST/features/solicitacoes/hooks/solicitacoesHooks.test.ts`: abrir invalida as listas (RF-09) |
| presenters | `SRC/features/solicitacoes/pages/PessoalTab.tsx` | sem mudança de código | `TST/features/solicitacoes/pages/PessoalTab.test.tsx`: lista e contagens com solicitações abertas pelo operador e não atribuídas a ele (RF-10, RF-11) |

### Documentação

| Arquivo | Ação |
|---|---|
| `openspec/README.md` | acrescentar a linha desta feature à tabela, se algum comportamento descrito em `openspec/specs/` mudar (troca de senha, quadro do operador) |

### Rastreabilidade

| Requisito | Onde |
|---|---|
| RF-01 | `credenciaisDaTroca`, `AuthProvider`, `useAlterarSenha` |
| RF-02 | `useAlterarSenha`, teste da `PerfilPage` |
| RF-03, RNF-02 | `useSolicitacaoEvents`, teste de `useSemAtualizacao` |
| RF-04 | `credenciaisDaTroca`, tipo opcional |
| RF-05 | teste de `useAlterarSenha` e da `PerfilPage` |
| RF-06, RF-12 | `EmptyState`, `KanbanBoard`, `SolicitacoesPage` |
| RF-07, RF-08, RNF-06 | `relacaoDoOperador`, `KanbanBoard`, `KanbanColumn`, `KanbanCard` |
| RF-09 | teste de `useAbrirSolicitacao` |
| RF-10, RF-11 | teste da `PessoalTab` |
| RNF-01 | teste do hook e roteiro de medição |
| RNF-03 | `make coverage`, conferido por arquivo alterado |
| RNF-04 | `package.json` sem mudança |
| RNF-05 | nota de publicação no PR |

## Contrato entre camadas

- `PerfilPage` → `useAlterarSenha` → `perfilApi.alterarSenha` → API. No sucesso, o hook
  passa a resposta por `credenciaisDaTroca`; com o par em mãos, chama
  `renovarCredenciais` do contexto. Sem o par, não chama nada. O erro segue para a página,
  que já o mostra.
- `renovarCredenciais` grava as credenciais e sobe `versaoDaSessao`. `useSolicitacaoEvents`,
  montado no layout da área logada, refaz o efeito: fecha a conexão antiga e abre outra com
  a credencial recém-gravada.
- `SolicitacoesPage` → `KanbanBoard` (filtros e `onLimparFiltro`). O quadro lê o perfil pelo
  contexto e o id por `usePerfil`; para operador, calcula a relação de cada card com
  `relacaoDoOperador` e a repassa pela coluna até o card.

## Dependências externas

| Dependência | Versão | Justificativa | Simulada nos testes por |
|---|---|---|---|
| nenhuma nova | — | — | — |

## Impacto no contrato de operação

Nenhum. Sem alvo novo no `Makefile`, sem serviço novo, sem variável de ambiente nova.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| A API derruba a conexão antes de a resposta chegar; o navegador tenta reconectar sozinho com a credencial antiga e recebe 401 | média | o efeito refeito fecha essa conexão e abre outra; o temporizador de reconexão pendente é cancelado na limpeza do efeito, que já existe. Teste cobre a ordem "queda, depois versão nova" |
| Refazer o efeito zera o contador de aberturas, e a primeira abertura depois da troca não atualiza as listas | baixa | o intervalo sem conexão é de milissegundos; se a medição mostrar perda, o contador sai do efeito |
| Publicar este frontend com backend v1.5.0: o quadro vazio do operador diria "não abriu nem recebeu" a quem abriu e não vê | baixa | RNF-05: backend antes, na v1.6.0; nota no PR |
| `usePerfil` ainda carregando quando o quadro desenha: card sem marca por um instante | alta, sem impacto | sem id a função devolve `null`; a marca aparece quando o perfil chega |
| Teste novo do provedor mexe em `window.location` | baixa | o teste cobre só `renovarCredenciais` e `versaoDaSessao`; login e saída não são tocados |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| 1 Contrato de operação | só alvos existentes do `Makefile` da raiz (`make validate`, `make coverage`); nenhuma ferramenta chamada direto |
| 2 Arquitetura limpa | regra em `lib/` (domínio), sem importar hook nem componente; componente fala com hook; API só pelo `perfilApi` |
| 3 Testes provam a entrega | todo arquivo alterado tem teste espelhado na tabela; um comportamento por teste, blocos Arrange/Act/Assert, nome `deve ... quando ...` |
| 4 Simplicidade defensável | nenhum padrão; três arquivos novos de produção, dois deles funções puras |
| 5 Autoria | commits e PR sem crédito a ferramenta de IA |
| 6 Idioma | artefatos e textos de tela em português; identificadores técnicos em inglês |
| 7 Mapa de pastas do legado | nada criado fora do layout existente; testes em `app/tests/unit` no caminho espelhado; nenhum `fetch` fora do `httpClient` |
| 8 Linguagem ubíqua | `relacaoDoOperador`, `credenciaisDaTroca`, `renovarCredenciais`, `versaoDaSessao`; nenhum termo existente renomeado |
| 9 Compatibilidade com a v1.5.0 | credenciais opcionais na resposta (RF-04); ordem de publicação do quadro declarada na spec (RNF-05) |
| 10 Cobertura não regride | as duas regras novas ficam em `lib/`, medidas; nenhuma exclusão acrescentada, limites intocados |
| 11 Padrão de teste no que for tocado | todo teste novo ou alterado nos arquivos listados segue o Princípio 3 |
| 12 Uma fonte de especificação | tudo em `specs/009-...`; `openspec/` só ganha linha na tabela do README, se couber |
