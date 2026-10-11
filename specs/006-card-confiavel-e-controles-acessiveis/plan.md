# Plano de implementação — Card confiável e controles acessíveis

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.

> **Cenários de aceite:** o repositório não tem `app/tests/bdd/` nem alvo `make bdd` (ver
> `.specify/memory/as-is.md`, seção 4). Cada cenário da spec vira um teste de componente ou
> de módulo, no arquivo indicado nas tarefas.

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| Onde mora a regra do selo | função pura `situacaoDoPrazo(solicitacao, agora)` em `features/solicitacoes/lib/prazoSolicitacao.ts` | manter dentro do `KanbanCard` | `components/` fica fora da medição de cobertura; a regra precisa ser medida (RNF-02) |
| Tamanho do prazo | `prazoLimite − criadaEm`, os dois vindos da API | tabela de horas por prioridade | RNF-01 |
| Campos novos no tipo | `prazoLimite`, `tempoRestanteSegundos`, `tempoResolucaoSegundos` opcionais em `Solicitacao` | obrigatórios | eventos de tempo real e respostas antigas podem não trazê-los |
| "Agora" | lido uma vez por montagem do card, como hoje | relógio que atualiza a cada minuto | fora do pedido; o quadro já se atualiza por evento |
| Como evitar o corte | cabeçalho e rodapé do card com quebra de linha e encolhimento dos textos | aumentar a largura mínima da coluna | a coluna larga só troca o corte por rolagem horizontal mais cedo |
| Navegação | `Link` do roteador | `useNavigate` num botão | link continua abrindo em nova aba e é anunciado como link (RF-13) |
| Verificação de RNF-03 | script de captura com API simulada, medindo `scrollWidth` contra `clientWidth` em cada card | teste de unidade | jsdom não calcula layout; o e2e do repositório exige backend |
| Contorno de foco | regra global em `globals.css` para `:focus-visible` de links, botões, abas e campos de seleção, com a cor de destaque | classe de foco repetida em cada componente | um ponto só; cobre também os controles que não usam `Button` (RF-16, RF-17) |
| Altura do botão | `Button` com `size`: `md` (44 px, padrão) e `sm` (36 px) | subir todos os botões sem opção | tabelas densas no computador (decisão na spec) |
| Ação destrutiva | variante `danger` no `Button` | classes de cor passadas por quem usa, como o `ConfirmDialog` faz hoje | RF-20; o `ConfirmDialog` passa a usar a variante |
| Área de toque no card | altura e largura mínimas de 44 px só com ponteiro de toque (`pointer: coarse`) | 44 px sempre | no computador o card fica denso como hoje (RF-15) |
| Erro associado ao campo | `aria-describedby` apontando para o id da mensagem, em `Input`, `Select` e `Textarea` | `aria-errormessage` | suporte mais amplo em leitores de tela |
| Base do diálogo | componente próprio `Dialog` com `role="dialog"`, `aria-modal`, ciclo de foco e Esc tratados no componente | elemento `<dialog>` nativo com `showModal()`; biblioteca de diálogo | o ambiente de teste (jsdom) não implementa `showModal()`, e a regra precisa de teste; biblioteca seria dependência nova (RNF-07) |
| Nome do diálogo | propriedade `titulo` obrigatória, aplicada como `aria-label` | `aria-labelledby` apontando para o título do formulário | os formulários de ação têm títulos próprios e não expõem id; o nome acessível não pode depender do conteúdo |
| Rolagem da página | `overflow: hidden` no `body` enquanto houver diálogo aberto, restaurando o valor anterior | `inert` no restante da página | simples e suficiente junto com o ciclo de foco |
| Onde fica | `shared/components/Dialog/` | dentro de `features/solicitacoes` | será usado pelo detalhe e pelo `ConfirmDialog` na continuação |
| RF-30 | fora desta entrega | — | decisão na spec |

## Padrões de projeto aplicados

| Padrão | Onde | Problema que resolve | Custo aceito |
|---|---|---|---|
| nenhum | — | — | — |

## Arquivos a criar ou alterar

| Camada | Arquivo | Ação | Teste |
|---|---|---|---|
| core/domain | `app/src/features/solicitacoes/types/solicitacaoTypes.ts` | alterar: campos de prazo | — (só tipos) |
| core/domain | `app/src/features/solicitacoes/lib/prazoSolicitacao.ts` | criar: `situacaoDoPrazo`, `formatarDuracao`, `idadeEmDias` | `prazoSolicitacao.test.ts` ao lado |
| presenters | `app/src/features/solicitacoes/components/KanbanCard.tsx` | alterar: selo e idade usam a regra; sai a tabela de horas | `KanbanCard.test.tsx` |
| presenters | `app/src/features/solicitacoes/pages/SolicitacoesTab.tsx` | alterar: legenda do indicador | `SolicitacoesTab.test.tsx`, se cobrir a legenda |
| presenters | `app/src/features/solicitacoes/components/KanbanCard.tsx` | alterar: quebra de linha; `Link` | `KanbanCard.test.tsx` |
| presenters | `app/src/features/solicitacoes/components/KanbanColumn.test.tsx`, `KanbanBoard.test.tsx` | alterar: os cards passam a precisar de roteador nos testes | — |
| presenters | `app/src/styles/globals.css` | alterar: contorno de foco global | medição (RNF-05) |
| presenters | `app/src/shared/components/Button/Button.tsx` | alterar: `size`, variante `danger`, altura mínima | `Button.test.tsx` |
| presenters | `app/src/shared/components/Input/Input.tsx`, `Select/Select.tsx`, `Textarea/Textarea.tsx` | alterar: erro associado | testes ao lado de cada um |
| presenters | `app/src/shared/components/ConfirmDialog/ConfirmDialog.tsx` | alterar: usa a variante `danger` | `ConfirmDialog.test.tsx` |
| presenters | `app/src/features/solicitacoes/components/KanbanCard.tsx` | alterar: área de toque e nome do botão de avançar | `KanbanCard.test.tsx` |
| presenters | `app/src/shared/components/Dialog/Dialog.tsx` | criar | `Dialog.test.tsx` ao lado |
| core/domain | `app/src/features/solicitacoes/lib/acoesSolicitacao.ts` | alterar: `rotuloDaAcao(acao)` para o nome do diálogo | `acoesSolicitacao.test.ts` |
| presenters | `app/src/features/solicitacoes/components/KanbanBoard.tsx` | alterar: usa `Dialog` | `KanbanBoard.test.tsx` |

`KanbanCard.tsx` é alterado por três partes (prazo, cortes, toque); as mudanças entram na
ordem das tarefas, num arquivo só.

## Contrato entre camadas

- `situacaoDoPrazo(solicitacao, agoraMs)` devolve `null` (sem selo) ou
`{ tom: 'neutro' | 'atencao' | 'atraso' | 'ok', rotulo: string }`.

- `Button` aceita `size?: 'md' | 'sm'` e `variant?: 'primary' | 'secondary' | 'ghost' | 'danger'`.
Quem não passa nada recebe `md` e `primary`.

- `<Dialog titulo onClose>{conteúdo}</Dialog>`: montado significa aberto. `onClose` é chamado
por Esc e por clique fora. O foco inicial vai para o primeiro controle focável do conteúdo
ou, se não houver, para o próprio diálogo.

## Dependências externas

Nenhuma nova.

## Impacto no contrato de operação

Nenhum.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Relógio do navegador diferente do servidor | baixa | Para "atrasada" vale primeiro o campo da API; o relógio local só calcula o tempo exibido |
| Backend em produção sem os campos | baixa | Card fica sem selo (decisão na spec) |
| RNF-03 sem teste automatizado no repositório | certa | Medição registrada na convergência; teste e2e fica para quando o e2e rodar sem backend |
| Botões 8 px mais altos desalinharem cabeçalhos e tabelas | média | Conferir as telas principais por captura antes e depois |
| RNF-04 e RNF-05 sem teste automatizado no repositório | certa | Medição por script com API simulada, registrada na convergência |
| Fechar por clique fora com formulário preenchido perde o que foi digitado | média | Os formulários de ação são curtos; confirmação ao descartar fica com OtavioProcopio/rgm-frontend#123 |
| `shared/components` fora da medição de cobertura esconder RNF-06 | a conferir | Verificar a configuração de cobertura na tarefa T020 e registrar na convergência |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| Contrato de operação | Validação por `make validate`; nenhum alvo novo |
| Arquitetura limpa | Regras em `lib/` (funções puras); componentes só apresentam |
| Testes provam a entrega | Teste antes da implementação; um comportamento por teste |
| Simplicidade defensável | Nenhuma dependência nova; nenhum padrão novo |
| Autoria | Commits e PR só com o autor do `git config` |
| Idioma | Artefatos em português |
| Compatibilidade com produção (9) | Campos de prazo opcionais; o resto é só apresentação |
| Cobertura não regride (10) | Mínimo intocado e nenhuma exclusão nova |
