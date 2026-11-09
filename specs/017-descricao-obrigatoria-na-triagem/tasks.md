# Tarefas — Descrição do que fazer, obrigatória na triagem

> Ordem de dependência; teste antes da implementação.
> Nomes de teste: "deve … quando …"; blocos Arrange/Act/Assert; um comportamento por teste.
> `SRC` = `app/src`, `TST` = `app/tests`.

## Fase 1 — Esquema, tela e envio (RF-01 a RF-06)

- [x] T001 Teste do `triarSolicitacaoSchema`: aceita com descrição; recusa descrição só com espaços (RF-02)
- [x] T002 Teste do `triarSolicitacaoSchema`: recusa descrição ausente e com mais de 2000 caracteres; apara as pontas (RF-02, RF-03, RF-04)
- [x] T003 Teste do `TriagemModal`: campo visível sem foto, com `maxLength` de 2000 (RF-01, RF-03)
- [x] T004 Teste do `TriagemModal`: confirmar sem descrição mostra o erro e não chama `onConfirm`; os três erros juntos (RF-02, RF-06)
- [x] T005 Teste do `TriagemModal`: confirma com a descrição digitada e entrega aparada (RF-04)
- [x] T006 Teste do `TriarAction`: `triar` recebe a descrição; a foto segue sem texto; nenhum comentário é criado (RF-04, RF-05)
- [x] T007 Implementar `solicitacaoSchema`, `solicitacaoTypes`, `TriagemModal` e `TriarAction`
- [x] T008 Ajustar o auxiliar e2e e os roteiros que chamam `/triar` (RF-04)

## Fase 2 — Documentação e validação

- [x] T009 Atualizar `docs/swagger.json` e a tabela de `openspec/README.md`
- [~] T010 `make validate` verde e `make e2e` contra o backend com a spec 014, com a saída real no `Convergence`

## Rastreabilidade

| Requisito | Tarefas |
|---|---|
| RF-01 | T003, T007 |
| RF-02 | T001, T002, T004, T007 |
| RF-03 | T002, T003, T007 |
| RF-04 | T002, T005, T006, T007, T008 |
| RF-05 | T006 |
| RF-06 | T004 |
| RNF-01, RNF-02 | T010 |
| RNF-03 | T003, T004 |
| RNF-04 | T006 |

## Convergence

> Seção **append-only**, escrita por `/bu:converge`. Cada rodada acrescenta um bloco;
> nada é reescrito.

### Rodada 1 — 2026-11-01

Evidência de execução:

- `npm run validate` (o que `make validate` chama): lint 0 erros (2 avisos que já existiam em
  `NovaSolicitacaoPage`), tipos sem erro, 226 arquivos e 3464 testes sem falha, cobertura global
  99,91% de linhas, build concluído.
- **Não executado:** `make e2e`. Os roteiros foram ajustados (auxiliar que preenche a descrição e
  as chamadas diretas a `/triar`), mas não rodaram contra o backend com a spec 014. T010 fica
  parcial (`[~]`) até isso rodar.

| Requisito | Estado | Evidência |
|---|---|---|
| RF-01 | realizado | `TriagemModal`; teste "deve mostrar o campo obrigatório de descrição do que fazer mesmo sem foto…" |
| RF-02 | realizado | `triarSolicitacaoSchema`; testes do esquema (ausente, só espaços) e "deve exigir a descrição quando só ela está faltando" |
| RF-03 | realizado | `maxLength` 2000 no campo e no esquema; testes do limite (2000 aceita, 2001 recusa) |
| RF-04 | realizado | `TriarAction` envia `data` com `descricao`; "deve entregar a descrição sem os espaços das pontas…"; nenhum `comentar` no código |
| RF-05 | realizado | `TriarAction.test.tsx`: foto como `INSTRUCAO_SERVICO` sem `descricao`; aviso e "Tentar novamente" mantidos |
| RF-06 | realizado | "deve exigir a prioridade e um responsável…" agora também espera o erro da descrição |
| RNF-01 | realizado | cobertura global 99,91%; arquivos tocados acima de 95% |
| RNF-02 | realizado | `npm run validate` verde |
| RNF-03 | realizado | consultas por rótulo e por texto de erro nos testes; sem teste de leitor de tela |
| RNF-04 | realizado | `TriarAction` sem chamada extra |

Desvio de processo: código antes da spec (declarado no topo da spec).
