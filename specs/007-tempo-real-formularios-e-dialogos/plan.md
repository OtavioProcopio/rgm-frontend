# Plano de implementação — Tempo real que se recupera, formulários que previnem erro e diálogos em toda a aplicação

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.

> **Layout e testes:** o repositório ainda está no layout legado (`app/src/features/...`, teste
> ao lado do arquivo), registrado em `.specify/memory/as-is.md`. Este plano segue esse
> layout, como as features 001 a 006. Não há `app/tests/bdd/` nem alvo `make bdd`: cada
> cenário da spec vira um teste de módulo ou de componente, no arquivo indicado.

> **Medição feita antes do plano (2026-10-06, API simulada, 390 px com ponteiro de toque):**
> 26 controles abaixo de 44 px e 3 botões de ícone sem nome nas telas de RF-25. Os arquivos
> da parte 4 saem dessa medição.

Prefixo: `SRC` = `app/src`.

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| Onde a conexão de tempo real é aberta | uma vez, no layout da área logada | manter nas três páginas que a abrem hoje (quadro, painel, detalhe) | o aviso fica no cabeçalho de todas as telas (RF-06); com uma conexão por página, as demais telas não saberiam o estado. Uma conexão só também deixa de reabrir a cada troca de tela |
| Como o estado da conexão chega ao cabeçalho | valor no cache de consultas, em chave própria (`solicitacoesKeys.conexao()`), como já é feito com a marca de atualização | contexto React novo; estado global novo | reaproveita o mecanismo existente; nenhum provedor novo |
| Como saber que é reconexão | contador de aberturas dentro do hook: a partir da segunda abertura, atualiza as consultas | evento `connected` do servidor | a abertura da conexão é padrão do navegador e independe da versão da API (RNF-09); cobre também a reconexão automática do navegador |
| O que é atualizado na reconexão | listas, detalhes, históricos e evidências de solicitações que estão no cache | recarregar tudo | só o que depende do tempo real; consulta sem tela aberta só é refeita quando voltar a ser usada |
| Espera entre tentativas | função pura `esperaDaTentativa(n)`: 3 s, 6 s, 12 s, 24 s, 30 s, 30 s… | espera fixa de 3 s (hoje); variação aleatória | RF-04 e RNF-02; variação aleatória não foi pedida |
| Sessão expirada × falha de rede | função pura `sessaoExpirou(erro)`: recusa da renovação com status 400, 401 ou 403 é sessão expirada; qualquer outra falha (sem resposta, 5xx) tenta de novo | tratar toda falha como sessão expirada (hoje) | RF-03 e RF-05 |
| Aviso de 10 s | hook que lê o estado da conexão e arma um temporizador de 10 s a partir do instante da queda | o hook de conexão decidir o que é "tempo demais" | a conexão informa o fato; quem mostra decide o prazo (RF-06, RF-07) |
| Anúncio do aviso | região `role="status"` sempre presente no cabeçalho, com o texto só quando há aviso | `role="alert"` | `status` anuncia sem interromper nem mover o foco (RF-08) |
| Limites | constantes em `SRC/shared/lib/limites.ts`; os esquemas usam `.max()` e os campos recebem `maxLength` com a mesma constante | números nos esquemas | RNF-03 |
| Contador | `Input` e `Textarea` mostram "Restam N caracteres" quando recebem `maxLength` e o texto passa de 90% dele; a conta fica em função pura `caracteresRestantes` | componente de contador separado em cada formulário | um ponto só; todo campo com limite ganha o contador sem mudar o formulário (RF-12) |
| Contador em campo não controlado | o campo acompanha o próprio tamanho pelo evento de digitação | exigir campo controlado | os formulários usam registro não controlado; valor inicial vindo de edição só é contado a partir da primeira tecla |
| Regra de senha | `SRC/shared/lib/senha.ts`: mínimo, mensagem e função `erroDaSenha`; os dois esquemas e a tela de redefinição usam esse módulo | manter três cópias | RF-13, RNF-04 |
| Edição no detalhe | validação pelo esquema `editarSolicitacaoSchema`, com os mesmos limites | manter a validação à mão dentro da página | página fica fora da medição de cobertura; a regra precisa de teste |
| Confirmação como diálogo | `ConfirmDialog` passa a renderizar dentro do `Dialog`; quem usa deixa de fornecer moldura | componente novo de confirmação modal | os quatro usos ganham o modal de uma vez (RF-20) |
| Foco inicial seguro | "Cancelar" continua sendo o primeiro botão do `ConfirmDialog`; o `Dialog` já foca o primeiro controle | propriedade de foco inicial | RF-21 e RF-22 sem API nova |
| Bloqueio durante o envio | propriedade `bloqueado` no `Dialog`: Esc e clique fora não chamam `onClose` | cada formulário avisar o diálogo | RF-23; quem abre o diálogo já sabe se está enviando |
| Como o diálogo de ação sabe que está enviando | contagem de mutações em andamento (`useIsMutating`) | cada uma das seis ações repassar seu estado | com o diálogo modal aberto, as únicas mutações possíveis são as dele; evita mexer em seis arquivos |
| Como o diálogo de ação sabe que há algo preenchido | marca "alterado" ao primeiro evento de digitação ou mudança vindo de dentro do diálogo | cada formulário expor seu estado; comparar valores no DOM | os seis formulários têm estados diferentes (registro, estado local, arquivo); o evento cobre todos sem mudá-los. Custo: digitar e apagar ainda conta como alterado |
| Desistir × concluir | `AcaoProps` ganha `onCancelar` (desistência, passa pela confirmação) separado de `onClose` (ação concluída, fecha direto) | um `onClose` só | hoje o mesmo retorno serve para os dois casos; a confirmação não pode aparecer depois de uma ação bem-sucedida |
| Confirmação de descarte dentro do diálogo | o mesmo diálogo troca o conteúdo para a pergunta, mantendo o formulário montado e oculto | segundo diálogo por cima do primeiro | duas camadas com ciclo de foco competem pelo Tab; o formulário oculto preserva o que foi digitado |
| Controles ocultos no ciclo de foco | o `Dialog` ignora controles dentro de elemento oculto | — | necessário para a decisão anterior |
| Fundo do diálogo | o painel do `Dialog` ganha fundo opaco do tema | deixar por conta do conteúdo | os blocos de ação e de confirmação têm fundo translúcido no tema escuro; sobre a camada escura ficam ilegíveis |
| Onde mora o diálogo de ação | componente `DialogoDaAcao` em `features/solicitacoes/actions`, usado pelo quadro e pelo detalhe | repetir nos dois lugares | RF-19: uma apresentação só |
| Área de toque nas demais telas | classes de área mínima só com ponteiro de toque, como na feature 006 | 44 px sempre | no computador as telas continuam densas |
| Caixa de seleção | a área de toque é o rótulo que a envolve (mínimo de 44 px); a medição conta o rótulo | aumentar a caixa | a caixa nativa de 13 px continua sendo o desenho; o alvo é a linha inteira |
| Verificação de RNF-06 e RNF-07 | script de medição com API simulada, registrado na convergência | teste de unidade | jsdom não calcula layout; o e2e do repositório exige backend |

## Padrões de projeto aplicados

| Padrão | Onde | Problema que resolve | Custo aceito |
|---|---|---|---|
| nenhum | — | — | — |

Considerados e recusados: **Observer** próprio para o estado da conexão (o cache de consultas
já notifica quem lê a chave); **State** para a máquina de reconexão (são três estados e uma
função de espera; um objeto por estado seria mais código que o problema).

## Arquivos a criar ou alterar

### Parte 1 — Tempo real (RF-01 a RF-08)

| Camada | Arquivo | Ação | Teste |
|---|---|---|---|
| core/domain | `SRC/features/solicitacoes/lib/reconexao.ts` | criar: `esperaDaTentativa`, `sessaoExpirou` | `reconexao.test.ts` ao lado |
| presenters | `SRC/features/solicitacoes/hooks/solicitacoesKeys.ts` | alterar: chave `conexao()` | `solicitacoesHooks.test.ts` |
| presenters | `SRC/features/solicitacoes/hooks/useSolicitacaoEvents.ts` | alterar: atualiza na reconexão, espera crescente, para em sessão expirada, publica o estado da conexão | `useSolicitacaoEvents.test.ts` |
| presenters | `SRC/features/solicitacoes/hooks/useSemAtualizacao.ts` | criar: verdadeiro quando a conexão está fechada há mais de 10 s | `useSemAtualizacao.test.ts` ao lado |
| presenters | `SRC/features/solicitacoes/components/AvisoSemAtualizacao.tsx` | criar: região de status com o aviso | `AvisoSemAtualizacao.test.tsx` ao lado |
| presenters | `SRC/app/layouts/AppLayout.tsx` | alterar: abre a conexão e mostra o aviso no cabeçalho | — (layout fora da medição; coberto pelos testes do hook e do aviso) |
| presenters | `SRC/features/solicitacoes/pages/SolicitacoesPage.tsx`, `DashboardPage.tsx`, `SolicitacaoDetalhePage.tsx` | alterar: deixam de abrir a conexão | testes existentes das páginas |

### Parte 2 — Formulários (RF-09 a RF-18)

| Camada | Arquivo | Ação | Teste |
|---|---|---|---|
| core/domain | `SRC/shared/lib/limites.ts` | criar: constantes de limite, `mensagemDeLimite`, `caracteresRestantes` | `limites.test.ts` ao lado |
| core/domain | `SRC/shared/lib/senha.ts` | criar: mínimo, mensagem, `erroDaSenha` | `senha.test.ts` ao lado |
| core/domain | `SRC/features/solicitacoes/schemas/solicitacaoSchema.ts` | alterar: limites em todos os textos; `editarSolicitacaoSchema` | `solicitacaoSchema.test.ts` |
| core/domain | `SRC/features/admin/modelos/schemas/modeloSchema.ts` | alterar: limites | `modeloSchema.test.ts` |
| core/domain | `SRC/features/admin/maquinas/schemas/maquinaSchema.ts` | alterar: limite | `maquinaSchema.test.ts` |
| core/domain | `SRC/features/admin/usuarios/schemas/usuarioSchema.ts` | alterar: limites; senha pela regra única | `usuarioSchema.test.ts` |
| core/domain | `SRC/features/auth/schemas/perfilSchema.ts` | alterar: senha pela regra única | `perfilSchema.test.ts` |
| presenters | `SRC/shared/components/Input/Input.tsx`, `Textarea/Textarea.tsx` | alterar: contador a partir de 90% do `maxLength`, associado ao campo | testes ao lado |
| presenters | formulários de solicitação (`NovaSolicitacaoPage`, `ComentarioForm`, `TriagemModal`, `DevolucaoModal`, `EncerramentoModal`, `EnviarValidacaoModal`, formulário de cancelamento), de modelo, de máquina e de usuário | alterar: `maxLength` com a constante em cada campo de texto | testes ao lado dos componentes |
| presenters | `SRC/features/admin/usuarios/pages/EditarUsuarioPage.tsx` | alterar: redefinição usa `erroDaSenha` | `EditarUsuarioPage.test.tsx` |
| presenters | `SRC/features/evidencias/components/EvidenciaList.tsx` | alterar: pede confirmação, citando o arquivo, antes de chamar a exclusão | `EvidenciaList.test.tsx` |
| presenters | `SRC/features/solicitacoes/pages/SolicitacaoDetalhePage.tsx` | alterar: valida a edição pelo esquema; confirma o descarte quando há alteração | `SolicitacaoDetalhePage.test.tsx` |

### Parte 3 — Diálogo (RF-19 a RF-24, RF-18)

| Camada | Arquivo | Ação | Teste |
|---|---|---|---|
| presenters | `SRC/shared/components/Dialog/Dialog.tsx` | alterar: `bloqueado`, ignora controles ocultos, fundo opaco | `Dialog.test.tsx` |
| presenters | `SRC/shared/components/ConfirmDialog/ConfirmDialog.tsx` | alterar: renderiza no `Dialog`; `cancelLabel`; bloqueia durante o envio | `ConfirmDialog.test.tsx` |
| presenters | `SRC/features/solicitacoes/types/acaoProps.ts` | alterar: `onCancelar` | — (só tipos) |
| presenters | `SRC/features/solicitacoes/actions/DialogoDaAcao.tsx` | criar: diálogo da ação, com bloqueio no envio e confirmação de descarte | `DialogoDaAcao.test.tsx` ao lado |
| presenters | `SRC/features/solicitacoes/actions/TriarAction.tsx`, `ResponsaveisAction.tsx`, `EnviarValidacaoAction.tsx`, `DevolverAction.tsx`, `EncerrarAction.tsx`, `CancelarAction.tsx`, `AcaoSolicitacaoAtiva.tsx` | alterar: o botão de desistir chama `onCancelar` | testes ao lado de cada um |
| presenters | `SRC/features/solicitacoes/components/KanbanBoard.tsx` | alterar: usa `DialogoDaAcao` | `KanbanBoard.test.tsx` |
| presenters | `SRC/features/solicitacoes/components/SolicitacaoAcoes.tsx` | alterar: usa `DialogoDaAcao` | `SolicitacaoAcoes.test.tsx` |
| presenters | `SRC/features/admin/usuarios/pages/UsuariosPage.tsx`, `components/DeleteUsuarioDialog.tsx` | alterar: sem moldura própria; exclusão usa `ConfirmDialog` | testes ao lado |
| presenters | `SRC/features/admin/modelos/pages/ModeloDetalhePage.tsx`, `components/GaleriaCarousel.tsx` | alterar: sem moldura nem camada própria | testes ao lado |

### Parte 4 — Toque e foco (RF-25 a RF-27)

| Camada | Arquivo | Ação | Teste |
|---|---|---|---|
| presenters | `SRC/features/solicitacoes/pages/DashboardPage.tsx` | alterar: abas do painel (42 px) | medição |
| presenters | `SRC/features/solicitacoes/components/HistoricoChart.tsx` | alterar: botões de período (32 px) | medição |
| presenters | `SRC/features/modelos/components/ModeloCard.tsx` | alterar: link "Ver detalhes" (28 px) | medição |
| presenters | `SRC/features/auth/pages/PerfilPage.tsx` | alterar: botões de mostrar senha (18 px, sem nome) | `PerfilPage.test.tsx`: nome acessível |
| presenters | `SRC/features/admin/usuarios/components/UsuariosFilters.tsx`, `pages/EditarUsuarioPage.tsx` | alterar: campos de 40 px | medição |
| presenters | `SRC/features/admin/usuarios/components/UsuarioForm.tsx`, `SRC/features/solicitacoes/components/TriagemModal.tsx`, `AlterarResponsaveisModal.tsx` | alterar: linha da caixa de seleção com 44 px | medição |
| presenters | `SRC/features/admin/modelos/components/ModeloActionsMenu.tsx`, `pages/NovoModeloPage.tsx`, `pages/EditarModeloPage.tsx` | alterar: links de 16 a 36 px | medição |
| presenters | `SRC/shared/components/Combobox/Combobox.tsx` | alterar: nome acessível nos dois botões de ícone | `Combobox.test.tsx` |

Os arquivos da parte 4 são os que a medição apontou. Se a medição final achar outro controle
abaixo de 44 px nas telas de RF-25, ele entra na mesma parte e é registrado na convergência.

## Contrato entre camadas

- `esperaDaTentativa(tentativa: number): number` — milissegundos; `tentativa` começa em 1.
- `sessaoExpirou(erro: unknown): boolean`.
- Chave `solicitacoesKeys.conexao()` guarda `{ aberta: boolean; desde: number }`.
- `useSemAtualizacao(): boolean`.
- `caracteresRestantes(tamanho: number, limite: number): number | null` — nulo abaixo de 90%.
- `erroDaSenha(senha: string): string | null`.
- `<Dialog titulo onClose bloqueado?>`.
- `<ConfirmDialog ... cancelLabel?>` — abre como diálogo modal; quem usa só monta e desmonta.
- `AcaoProps = { solicitacao; onClose; onCancelar }` — `onClose` ao concluir, `onCancelar` ao desistir.
- `<DialogoDaAcao acao solicitacao onClose />` — montado significa aberto.

## Dependências externas

Nenhuma nova.

## Impacto no contrato de operação

Nenhum. Validação por `make validate`.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| A conexão única no layout muda quando os eventos chegam (agora em todas as telas) | baixa | Os manipuladores só invalidam e mesclam cache; teste do hook cobre montar e desmontar |
| Renovação da sessão recusada com status diferente de 400, 401 ou 403 por erro do servidor ser tratada como rede e tentar para sempre | baixa | Teto de 30 s entre tentativas; o aviso fica visível |
| Reconexão dispara muitas consultas de uma vez | baixa | Só consultas com tela aberta são refeitas na hora |
| Limite de 2.000 e senha de 8 só no frontend: outra interface da API continua aceitando mais | certa | Fora de escopo; OtavioProcopio/rgm-backend#98 e #109 |
| Texto já gravado acima do limite novo não pode ser salvo de novo sem encurtar | baixa | O campo mostra o limite; registrar na convergência se houver caso |
| "Alterado" por evento gera confirmação a mais (digitou e apagou) | média | Aceito na decisão; pergunta a mais é menos grave que perda de texto |
| `useIsMutating` contar mutação de fora do diálogo | baixa | Diálogo é modal; não há como iniciar outra mutação com ele aberto |
| `ConfirmDialog` como modal mudar o layout das telas de administração | média | Capturas antes e depois das quatro confirmações |
| Esc na galeria fechar a confirmação e a galeria juntas | média | A galeria já trata Esc com a confirmação aberta; teste cobre |
| RNF-06 e RNF-07 sem teste automatizado no repositório | certa | Medição por script com API simulada, registrada na convergência |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| Contrato de operação | Validação por `make validate`; nenhum alvo novo |
| Arquitetura limpa | Regras em `lib/` e `schemas/` (funções puras); hooks e componentes só orquestram e apresentam |
| Testes provam a entrega | Teste antes da implementação; um comportamento por teste; nomes no padrão "deve … quando …" |
| Simplicidade defensável | Nenhuma dependência nova; nenhum padrão novo; dois padrões recusados com motivo |
| Autoria | Commits e PR só com o autor do `git config` |
| Idioma | Artefatos em português |
| Compatibilidade com produção (9) | Nada depende de mudança na API; a reconexão usa só o que a v1.5.0 já oferece |
| Cobertura não regride (10) | Mínimo intocado e nenhuma exclusão nova; regras novas em módulos medidos |
| Byte Union como padrão único (12) | Spec, plano, checklist e tarefas em `specs/007-*`, pelas skills `/bu:` |
