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
| `solicitacoes-kanban` | `specs/002-acoes-da-solicitacao-reutilizaveis` — quadro e detalhe usam os mesmos formulários de ação; as ações oferecidas seguem `acoesPermitidas` da API quando ela informa; soltar um card em "Cancelada" abre o formulário de cancelamento |
| `evidencias` | `specs/003-falhas-visiveis-de-upload-e-exportacao` — evidência aceita JPEG, PNG, GIF, WebP, PDF e MP4 até 10 MB; foto que acompanha triagem, devolução ou abertura e falha gera aviso com "Tentar novamente"; a foto da conclusão é enviada antes de concluir |
| `solicitacoes-kanban`, `modelos`, `metricas-dashboard` | `specs/003-falhas-visiveis-de-upload-e-exportacao` — falha na exportação de PDF aparece junto do botão |
| `solicitacoes-kanban` | `specs/004-tempo-real-no-quadro-e-no` — o detalhe também ouve os eventos e se atualiza; comentário e anexo de outro usuário atualizam o histórico; formulário de ação aberto mostra "Atualizada por outro usuário"; o nginx repassa a rota de eventos sem buffer |
