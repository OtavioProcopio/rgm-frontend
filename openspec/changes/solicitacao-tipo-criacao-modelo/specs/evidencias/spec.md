## MODIFIED Requirements

### Requirement: Evidencia obrigatoria ao enviar para validacao
O sistema SHALL exigir, no modal de envio para validacao, que o usuario
preencha primeiro a descricao do servico realizado e so entao anexe a foto
obrigatoria — a foto e enviada com `tipo=SERVICO_REALIZADO` e a descricao
digitada como `descricao` da propria evidencia, sem duplicar o campo.

Essa exigencia SHALL ser condicional ao tipo da solicitacao: para o tipo
CRIACAO (que o backend nao exige evidencia para validar), o modal SHALL
habilitar o envio apenas com a descricao/comentario preenchido, sem exigir
nenhuma foto anexada.

#### Scenario: Ordem correta: descricao antes da foto
- **WHEN** o usuario tenta anexar a foto antes de preencher a descricao
  minima exigida
- **THEN** o envio da foto e bloqueado ate a descricao ser valida

#### Scenario: Envio bloqueado sem evidencia anexada
- **WHEN** a solicitacao exige evidencia (REPARO, REENGENHARIA) e a foto
  ainda nao foi anexada com sucesso
- **THEN** o botao de confirmar envio para validacao permanece desabilitado

#### Scenario: Fluxo completo
- **WHEN** a descricao e preenchida e a foto e anexada com sucesso
- **THEN** o botao de confirmar e habilitado, e a submissao registra o mesmo
  texto como comentario da atividade e como descricao da evidencia

#### Scenario: CRIACAO nao exige evidencia
- **WHEN** o usuario preenche o comentario de uma solicitacao CRIACAO em
  EM_ANDAMENTO, sem anexar nenhuma evidencia
- **THEN** o botao de enviar para validacao fica habilitado mesmo sem foto
