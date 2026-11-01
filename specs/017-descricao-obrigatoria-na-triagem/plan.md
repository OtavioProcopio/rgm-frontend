# Plano de implementação — Descrição do que fazer, obrigatória na triagem

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.
> `SRC` = `app/src`, `TST` = `app/tests`. Base: `main` com a spec 016. Publicação: junto do
> backend com a spec 014, backend primeiro; sem reserva para backend anterior.

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| Onde mora o valor | Campo `descricao` do formulário da triagem, no mesmo esquema de validação | Estado local fora do formulário (como era `nota`) | RF-02 e RF-06: a validação e os erros ficam juntos |
| Validação | `trim`, mínimo 1 e máximo `LIMITES.textoLongo` no `triarSolicitacaoSchema` | Validar no componente | Regra em `schemas/`, medida pela cobertura (Princípio 10) |
| Envio | `descricao` entra no payload de `triar` | Comentário depois da triagem (primeira versão, descartada) | RF-04: é decisão, e o comentário podia falhar depois de a triagem passar |
| Foto | Continua pelo fluxo de `useExecutarAcao`, sem `descricao` | Manter texto na foto | RF-05 |
| Contrato | `TriarSolicitacaoRequest.descricao: string`; `docs/swagger.json` com `descricao` obrigatória | — | Princípio de não inventar endpoint: o contrato é o do backend |
| Teste e2e | O auxiliar `escolherPrioridadeEPrimeiroResponsavel` preenche a descrição | Preencher em cada roteiro | Um ponto de mudança |

## Arquivos a criar ou alterar

| Camada | Arquivo | Ação | Teste |
|---|---|---|---|
| domain | `SRC/features/solicitacoes/schemas/solicitacaoSchema.ts` (`descricao`) | alterar | `TST/unit/features/solicitacoes/schemas/solicitacaoSchema.test.ts` |
| domain | `SRC/features/solicitacoes/types/solicitacaoTypes.ts` (`TriarSolicitacaoRequest`) | alterar | tipos (`tsc`) |
| presenter | `SRC/features/solicitacoes/components/TriagemModal.tsx` | alterar | `TST/unit/features/solicitacoes/components/TriagemModal.test.tsx` |
| presenter | `SRC/features/solicitacoes/actions/TriarAction.tsx` (sem `nota`) | alterar | `TST/unit/features/solicitacoes/actions/TriarAction.test.tsx` |
| e2e | `TST/e2e/fixtures.ts`, `kanban.spec.ts`, `evidencia-galeria.spec.ts` | alterar | roteiros e2e |
| docs | `docs/swagger.json`, `openspec/README.md` (linha) | alterar | — |

## Contrato entre camadas

- **UI → hook:** `onConfirm(data, foto)` com `data = { prioridade, responsavelIds, descricao }`.
- **Hook → API:** `PATCH /api/solicitacoes/{id}/triar` com os três campos.
- **Compatibilidade:** backend sem a spec 014 ignora `descricao`; ver "Ordem de publicação" na spec.

## Dependências externas

Nenhuma nova.

## Impacto no contrato de operação

Nenhum. `make validate` e e2e como antes.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Front publicado contra backend antigo perde a instrução sem aviso | média | Ordem de publicação na spec |
| E2E não rodou neste ambiente | certa nesta rodada | Rodar `make e2e` antes do merge; registrado na convergência |
| Instrução só no histórico, longe de quem executa | média | Fora de escopo; evolução com campo próprio (spec do backend) |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| P7 — mapa de pastas | Regra em `schemas/`; sem `fetch` fora do cliente HTTP; componente fala com hook |
| P8 — linguagem ubíqua | `descricao`, `triagem`; testes `it('deve ... quando ...')` |
| P9 — compatibilidade | Dependência do backend declarada, com ordem de publicação |
| P10 — cobertura | Regra nova em `schemas/`, medida |
| P11 — padrão de teste | Testes novos e alterados em AAA, um comportamento por teste, consulta por papel/rótulo |
| P12 — uma fonte | Spec em `specs/017`; linha na tabela de `openspec/README.md` |
