# openspec/ — registro histórico (congelado)

Esta pasta descreve o comportamento da interface **até a v1.5.0** e não recebe mais
alterações. O padrão de especificação do repositório é o Byte Union: funcionalidade nova
nasce em `specs/NNN-slug/` (spec, plan, checklists e tasks), conforme o Princípio 12 de
`.specify/project.md`.

- `specs/` — as 8 capacidades da interface na v1.5.0. Leia como ponto de partida; o que
  mudou depois está na tabela abaixo.
- `changes/archive/` — as 4 mudanças feitas em OpenSpec, todas entregues e sincronizadas.
  Não há mudança aberta.
- Os comandos `/opsx:*` e as skills `openspec-*` foram removidos de `.claude/`. O histórico
  segue recuperável pelo git.

## O que mudou depois da v1.5.0

Quando uma feature em `specs/` altera comportamento descrito aqui, vale a feature. A linha
entra nesta tabela na mesma entrega.

| Capacidade (`openspec/specs/`) | Feature que altera o comportamento |
|---|---|
| `solicitacoes-kanban` | `specs/001-responsaveis-disponiveis-fora-da-administracao` — o modal de triagem do quadro passa a listar responsáveis também para gestor |
