# Evidencias Specification

## Purpose

Interface de anexo de evidencias nos 5 pontos do fluxo Kanban onde uma foto
faz sentido, reaproveitando o texto que cada modal ja coleta como a
`descricao` da evidencia — nunca duplicando um campo de texto so para isso.
Alem disso, a pagina de detalhe da solicitacao mantem um uploader avulso
(GERAL) e uma lista de todas as evidencias anexadas.

## Requirements

### Requirement: Evidencia opcional na triagem
O sistema SHALL permitir, no modal de triagem, anexar uma foto opcional do
que precisa ser feito, com uma nota opcional (relevante apenas quando ha
foto), enviada com `tipo=INSTRUCAO_SERVICO` apos a triagem ser confirmada.

#### Scenario: Triagem com foto e nota
- **WHEN** o gestor anexa uma foto e preenche a nota antes de confirmar a
  triagem
- **THEN** apos a solicitacao ir para EM_ANDAMENTO, a foto e enviada como
  evidencia INSTRUCAO_SERVICO com a nota como descricao

#### Scenario: Triagem sem foto
- **WHEN** o gestor confirma a triagem sem anexar foto
- **THEN** nenhuma evidencia e enviada; a triagem prossegue normalmente

### Requirement: Evidencia obrigatoria ao enviar para validacao
O sistema SHALL exigir, no modal de envio para validacao, que o usuario
preencha primeiro a descricao do servico realizado e so entao anexe a foto
obrigatoria — a foto e enviada com `tipo=SERVICO_REALIZADO` e a descricao
digitada como `descricao` da propria evidencia, sem duplicar o campo.

#### Scenario: Ordem correta: descricao antes da foto
- **WHEN** o usuario tenta anexar a foto antes de preencher a descricao
  minima exigida
- **THEN** o envio da foto e bloqueado ate a descricao ser valida

#### Scenario: Envio bloqueado sem evidencia anexada
- **WHEN** a foto ainda nao foi anexada com sucesso
- **THEN** o botao de confirmar envio para validacao permanece desabilitado

#### Scenario: Fluxo completo
- **WHEN** a descricao e preenchida e a foto e anexada com sucesso
- **THEN** o botao de confirmar e habilitado, e a submissao registra o mesmo
  texto como comentario da atividade e como descricao da evidencia

### Requirement: Evidencia opcional ao concluir
O sistema SHALL permitir, no modal de conclusao, anexar uma foto opcional de
conclusao, reaproveitando o campo "Comentario final" ja existente como a
descricao da evidencia, com `tipo=CONCLUSAO`.

#### Scenario: Conclusao com foto
- **WHEN** o gestor preenche o comentario final e anexa uma foto antes de
  concluir
- **THEN** apos a conclusao, a foto e enviada como evidencia CONCLUSAO com o
  comentario final como descricao

#### Scenario: Cancelamento via mesmo modal nao anexa foto
- **WHEN** o gestor usa o mesmo modal para cancelar (em vez de concluir)
- **THEN** nenhuma foto de conclusao e oferecida nesse caminho

### Requirement: Evidencia opcional ao devolver
O sistema SHALL permitir, no modal de devolucao, anexar uma foto opcional do
que ainda precisa ser corrigido, reaproveitando o campo "Motivo" ja existente
como a descricao da evidencia, com `tipo=DEVOLUCAO`.

#### Scenario: Devolucao com foto
- **WHEN** o gestor preenche o motivo e anexa uma foto antes de devolver
- **THEN** apos a devolucao, a foto e enviada como evidencia DEVOLUCAO com o
  motivo como descricao

### Requirement: Evidencia avulsa (GERAL) na pagina de detalhe
O sistema SHALL manter, na pagina de detalhe da solicitacao, um uploader
independente dos modais de transicao, para anexar evidencias a qualquer
momento (tipo GERAL por padrao), alem de listar e permitir excluir
evidencias existentes.

#### Scenario: Upload avulso
- **WHEN** o usuario com acesso anexa um arquivo pelo uploader da pagina de
  detalhe (fora de qualquer modal de transicao)
- **THEN** a evidencia e criada com tipo GERAL

#### Scenario: Excluir evidencia
- **WHEN** o usuario com permissao exclui uma evidencia da lista
- **THEN** ela e removida da lista apos a confirmacao da API
