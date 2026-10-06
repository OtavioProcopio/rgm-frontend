# Plano de implementação — Tempo real no quadro e no detalhe

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.

> **Cenários de aceite:** o repositório não tem `app/tests/bdd/` nem alvo `make bdd` (ver
> `.specify/memory/as-is.md`, seção 4). Cada cenário da spec vira um teste de componente ou
> de módulo com o nome do cenário, no arquivo indicado nas tarefas.

## Contrato dos eventos (conferido no backend em `develop`, 2026-10-05)

| Evento SSE | Corpo | Quando |
|---|---|---|
| `solicitacao` | `{ tipo, solicitacao }`, com `tipo` em `aberta`, `editada`, `triada`, `enviada_validacao`, `devolvida`, `encerrada`, `cancelada`, `responsaveis_alterados` | toda mudança na solicitação. `solicitacao.responsavelIds` vem vazio, exceto em `responsaveis_alterados`; `acoesPermitidas` vem nulo |
| `solicitacao_atividade` | `{ tipo, solicitacaoId }`, com `tipo` em `comentada`, `evidencia_adicionada` | o histórico mudou sem mudar a solicitação |
| `connected` e comentário `ping` | — | abertura da conexão e sinal a cada 25 s |

A v1.5.0 envia só `solicitacao`, com o mesmo corpo, nas mudanças de status.

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| Servidor web | bloco `location /api/solicitacoes/events` antes de `location /api/` em `nginx.conf`, com `proxy_buffering off`, `proxy_cache off`, `Connection ''` e `proxy_read_timeout 1h` | desligar o buffer em todo `/api/` | só a rota de eventos muda (RF-01 a RF-03) |
| Prova da configuração | teste que lê `nginx.conf` e confere o bloco, a ordem e os valores | subir nginx no teste | não há compose de teste no repositório; o teste impede que o bloco seja removido ou reordenado |
| Leitura do evento | funções puras em `features/solicitacoes/lib/eventosSolicitacao.ts`: `lerEventoSolicitacao`, `lerEventoAtividade`, `mesclarSolicitacaoDoEvento` | interpretar dentro do hook | `hooks/` não é medido; o que decide o que entra no cache é regra (Princípio 10) |
| Detalhe aberto | `setQueryData` do detalhe com a mescla, só se o detalhe já está em cache, e em seguida invalidação do detalhe (que inclui as atividades) | só `setQueryData`, como a issue sugere | o evento vem sem responsáveis e sem ações (RF-05, RF-09) |
| Mescla | mantém `responsavelIds` do cache, exceto em `responsaveis_alterados`; zera `acoesPermitidas` para valer a regra local até a confirmação | copiar o evento inteiro | idem |
| Evento ilegível | invalida as listas mesmo assim | ignorar | mantém o comportamento de hoje e a compatibilidade com a v1.5.0 (RNF-03) |
| Aviso no formulário | o hook de eventos incrementa uma marca por solicitação no cache de consultas; `useExecutarAcao` compara a marca com a que viu ao abrir e ignora as que chegam enquanto a própria ação executa | contexto React novo; `isMutating` global | sem provedor novo; a ação do próprio usuário também gera evento e não pode avisar "outro usuário" |
| Quais eventos avisam | só `solicitacao`; `solicitacao_atividade` (comentário, anexo) não avisa | avisar em todos | comentário não muda o que o formulário de ação decide (RF-07 fala em "solicitação que mudou") |
| Onde ouvir | `useSolicitacaoEvents()` também em `SolicitacaoDetalhePage` | provedor global de eventos | hoje só a listagem e o painel abrem a conexão; o detalhe não ouvia nada |

## Padrões de projeto aplicados

| Padrão | Onde | Problema que resolve | Custo aceito |
|---|---|---|---|
| nenhum | — | — | — |

## Arquivos a criar ou alterar

| Camada | Arquivo | Ação | Teste |
|---|---|---|---|
| infra | `nginx.conf` | alterar: bloco da rota de eventos | `app/nginxConf.test.ts` |
| core/domain | `app/src/features/solicitacoes/lib/eventosSolicitacao.ts` | criar | `app/src/features/solicitacoes/lib/eventosSolicitacao.test.ts` |
| hook | `app/src/features/solicitacoes/hooks/solicitacoesKeys.ts` | alterar: chave `atualizacao(id)` | — |
| hook | `app/src/features/solicitacoes/hooks/useSolicitacaoEvents.ts` | alterar: detalhe, atividades, evidências, marca | `useSolicitacaoEvents.test.ts` |
| hook | `app/src/features/solicitacoes/hooks/useExecutarAcao.ts` | alterar: devolve `atualizadaPorOutro` | `useExecutarAcao.test.ts` |
| presenters | `app/src/features/solicitacoes/actions/AcaoErro.tsx` → `AcaoAvisos.tsx` | alterar: mostra também "Atualizada por outro usuário" | testes das ações |
| presenters | `app/src/features/solicitacoes/actions/*Action.tsx` | alterar: usam `AcaoAvisos` | `SolicitacaoAcoes.test.tsx` |
| presenters | `app/src/features/solicitacoes/pages/SolicitacaoDetalhePage.tsx` | alterar: chama `useSolicitacaoEvents()` | `SolicitacaoDetalhePage.test.tsx` |
| teste | `app/src/test-utils/mockEventSource.ts` | criar: dublê de `EventSource` com corpo | — |

## Contrato entre camadas

- `lerEventoSolicitacao(data)` → `{ tipo, solicitacao } | null`; `lerEventoAtividade(data)` → `{ tipo, solicitacaoId } | null`.
- `mesclarSolicitacaoDoEvento(atual, evento)` → `Solicitacao`.
- `useExecutarAcao` → `{ erro, aviso, atualizadaPorOutro, executar }`.

## Dependências externas

Nenhuma nova.

## Impacto no contrato de operação

Nenhum alvo novo. `nginx.conf` muda; a imagem do frontend precisa ser reconstruída para valer.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Outro proxy na frente do nginx (definido no `rgm-infra`) continua segurando os eventos | média | fora deste repositório; registrar no PR e conferir no `rgm-infra` antes de publicar |
| Evento da própria ação chega depois que ela terminou e o formulário ainda está aberto | baixa | o formulário fecha no mesmo passo em que a ação termina; o aviso só existe junto do formulário |
| Muitas consultas refeitas com muitos eventos | baixa | só consultas ativas são refeitas; o detalhe só é tocado se estiver em cache |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| Contrato de operação (1) | Só `make validate`; nenhum alvo novo |
| Arquitetura limpa (2) e mapa do legado (7) | Regra em `lib/`, conexão em `hooks/`, tela em `actions/` e `pages/` |
| Testes provam a entrega (3, 11) | Teste novo ou alterado com `it('deve ... quando ...')`, Arrange/Act/Assert, consulta por papel e texto |
| Simplicidade defensável (4) | Sem provedor nem biblioteca nova |
| Autoria (5) e idioma (6) | Commits só com o autor do git; artefatos em português |
| Linguagem ubíqua (8) | Tipos de evento como a API envia (`triada`, `responsaveis_alterados`, ...) |
| Compatibilidade com o backend (9) | Evento ilegível ou ausente não quebra; com a v1.5.0 as listas atualizam como hoje |
| Cobertura não regride (10) | Regra em `lib/`; nenhuma exclusão acrescentada |
| Uma fonte de especificação (12) | Spec nesta pasta; linha acrescentada em `openspec/README.md` |
