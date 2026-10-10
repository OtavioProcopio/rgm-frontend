# Especificação — Pacote de correções do frontend (#153, #146, #139, #141 e #138)

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: issues `rgm-frontend#153`, `#146`, `#139`, `#141` e `#138`. Base: `develop`
(`e5f2e6d`). Todas são correções do que já existe; nenhuma depende de mudança no backend.

> **Registro de processo (honestidade):** o RF-01 (#153) foi **codificado e aberto como PR #154
> antes desta spec existir**, sem passar por `/bu:specify`, `/bu:plan` e `/bu:tasks`. Esta spec
> o absorve e a convergência o confronta com o código que já estava na branch. Os RF-02 a RF-05
> seguem o fluxo na ordem correta.

## Problema

1. **Perfil do operador pede o que a API vai recusar (#153).** A tela de perfil chama os
   indicadores agregados do sistema para qualquer perfil e mostra "Visão Geral do Sistema" ao
   operador. Com a `rgm-backend#97` (já em `develop`), o operador recebe 403 nesses indicadores:
   a seção sumiria por erro silencioso. O front precisa ser publicado **antes** do backend.
2. **Filtro com lista não volta a "Todos" (#146).** Depois de escolher um valor, o usuário não
   consegue voltar a "Todos os status", "Todas as máquinas" etc., porque o texto de apoio é uma
   opção desabilitada. Vale para os filtros do quadro e da lista de modelos da administração.
3. **Erro da API aparece cru (#139).** O operador que abre o endereço de uma solicitação que
   não é dele vê "Usuario nao tem acesso a esta solicitacao", sem acentos e sem saída; outras
   mensagens do backend também são repassadas como vieram (ex.: "Senha deve ter no minimo 8
   caracteres").
4. **Quadro vazio mente ao operador (#141).** Sem filtro de período, as colunas Concluída e
   Cancelada mostram só as encerradas dos últimos 30 dias. Quem tem solicitações só mais
   antigas vê "Você ainda não abriu nem recebeu solicitações", o que não é verdade.
5. **Teste e2e descreve a regra antiga (#138).** O cenário "uploader não aparece para OPERADOR
   não-responsável e não-autor" espera ver a seção Evidências, mas o backend atual responde 403
   a esse operador. A suíte e2e não passa inteira.

**Custo de não resolver:** o card de perfil do operador some quando o backend subir; o
usuário fica preso num filtro e vê mensagens quebradas; o operador antigo acha que perdeu o
histórico; e a esteira e2e deixa de ser confiável.

## Objetivo

- Perfil do operador sem chamada aos indicadores agregados e sem a seção; gestor e
  administrador inalterados.
- Todo filtro com lista permite voltar a "Todos" por mouse e teclado; campo obrigatório de
  formulário continua sem opção vazia escolhível.
- Acesso negado ao detalhe, e as mensagens de erro frequentes, saem em português correto, com
  caminho de volta.
- Operador com histórico antigo entende que o quadro está limitado a 30 dias; operador sem
  nenhuma solicitação continua vendo o convite para abrir a primeira.
- Suíte e2e coerente com a regra de visibilidade vigente.

## Fora de escopo

- Melhorias visuais do quadro e do card (#129), retorno do sistema (#126), login (#131),
  seleção com busca (#132).
- Dashboard por período e indicadores de gestão (#149, #150) e ordenação do quadro (#142).
- Limpeza, `make fmt` global e nova versão em produção (#151).
- Qualquer mudança no backend, inclusive o texto das mensagens que ele devolve.
- Novo filtro de período para o operador além do recorte de 30 dias existente.

## Personas e cenários de uso

- **Operador de chão de fábrica:** abre o perfil, o quadro e, às vezes, um link que recebeu;
  precisa que nada quebre e que cada tela diga o que fazer.
- **Gestor e administrador:** filtram o quadro e a lista de modelos várias vezes por dia e
  esperam poder limpar o filtro sem recarregar a página.
- **Quem mantém a esteira:** precisa de e2e verde para confiar na release.

## Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | A tela de perfil só busca e só mostra os indicadores agregados do sistema para gestor e administrador | obrigatório |
| RF-02 | Todo filtro com lista permite escolher de novo a opção "Todos" depois de ter escolhido um valor | obrigatório |
| RF-03 | Campo obrigatório de formulário com lista não oferece opção vazia escolhível | obrigatório |
| RF-04 | O acesso negado ao detalhe da solicitação mostra mensagem própria, com acentos, e oferece voltar ao quadro | obrigatório |
| RF-05 | Os erros de senha, de acesso negado, de sessão expirada e de conflito de edição têm texto próprio em português, sem repassar o texto cru do backend; os demais ficam como estão | obrigatório |
| RF-06 | O quadro do operador distingue "nunca teve solicitação" de "tem solicitações só fora do recorte de 30 dias": neste caso mostra as colunas vazias com o aviso "Últimos 30 dias", só texto, sem filtro novo | obrigatório |
| RF-07 | O e2e de evidências tem dois cenários na regra vigente: operador sem relação com a solicitação não abre o detalhe; operador autor de solicitação encerrada vê Evidências sem o botão de anexar | obrigatório |
| RF-08 | A suíte e2e inteira passa contra o backend de `develop` | obrigatório |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Cobertura dos arquivos tocados | ≥ 95% de linhas por arquivo (Princípio 10) |
| RNF-02 | Compatibilidade com o backend da v1.5.0 em produção (Princípio 9) | Com o backend antigo, o perfil do operador abre sem erro visível e sem 403 |
| RNF-03 | Verificação | `make validate` com 0 falhas e 0 erros de lint e de tipos |
| RNF-04 | Sem requisição extra para decidir o vazio do quadro (RF-06) | No máximo 1 requisição adicional, de página de tamanho 1, e só quando as cinco colunas somam zero |

## Critérios de aceite

```gherkin
# language: pt
Funcionalidade: Pacote de correções do frontend

  Cenário: Operador abre o perfil sem pedir indicadores agregados
    Dado que estou autenticado como operador
    Quando abro a tela de perfil
    Então nenhuma requisição aos indicadores agregados do sistema é feita
    Mas vejo meus dados de perfil
    E não vejo a seção "Visão Geral do Sistema"

  Cenário: Gestor e administrador continuam vendo a visão geral
    Dado que estou autenticado como gestor
    Quando abro a tela de perfil
    Então vejo a seção "Visão Geral do Sistema"

  Cenário: Voltar a "Todos" em um filtro do quadro
    Dado que escolhi a prioridade "Alta" no filtro do quadro
    Quando escolho a opção "Todas as prioridades" pelo mouse ou pelo teclado
    Então o filtro de prioridade fica vazio
    E o quadro volta a listar solicitações de todas as prioridades

  Cenário: Voltar a "Todas" nos filtros da lista de modelos
    Dado que escolhi uma máquina e um status na lista de modelos
    Quando escolho "Todas" na máquina e "Todos" no status
    Então os dois filtros ficam vazios

  Cenário: Campo obrigatório não aceita opção vazia
    Dado um formulário com um campo de lista obrigatório
    Quando abro as opções do campo
    Então a opção vazia de apoio não é escolhível

  Cenário: Acesso negado ao detalhe
    Dado que sou operador e abro o endereço de uma solicitação que não abri nem recebi
    Quando a API responde acesso negado
    Então vejo "Você não tem acesso a esta solicitação."
    E vejo uma ação para voltar ao quadro
    Mas não vejo o texto cru do backend

  Cenário: Mensagem frequente do backend com texto próprio
    Dado que o backend recusa uma senha curta
    Quando o erro chega à tela
    Então vejo a mensagem própria em português com acentuação correta

  Cenário: Operador com encerradas só fora dos 30 dias
    Dado que sou operador e todas as minhas solicitações foram encerradas há mais de 30 dias
    Quando abro o quadro
    Então não vejo "Você ainda não abriu nem recebeu solicitações"
    E vejo um aviso de que o quadro mostra os últimos 30 dias

  Cenário: Operador sem nenhuma solicitação
    Dado que sou operador e nunca abri nem recebi solicitação
    Quando abro o quadro
    Então vejo o convite para abrir a primeira solicitação

  Cenário: E2e de evidências: operador sem relação
    Dado um operador sem relação com a solicitação
    Quando ele abre o endereço do detalhe
    Então vê que não tem acesso e não vê a seção Evidências nem o botão de anexar

  Cenário: E2e de evidências: autor de solicitação encerrada
    Dado um operador que abriu uma solicitação já encerrada
    Quando ele abre o detalhe
    Então vê a seção Evidências
    Mas não vê o botão de anexar
```

## Ambiguidades

Nenhuma ambiguidade aberta (ver Esclarecimentos).

## Métricas de sucesso

- A suíte e2e passa inteira (hoje 53 de 54).
- Nenhuma chamada a `/api/solicitacoes/metricas` do perfil do operador na rodada de
  integração (hoje: 1 por abertura do perfil).
- Zero mensagem de erro sem acentuação no detalhe da solicitação.

## Esclarecimentos

| Pergunta | Resposta | Data |
|---|---|---|
| RF-05: quais mensagens do backend ganham texto próprio? | Senha, acesso negado, sessão expirada e conflito de edição; as demais ficam como estão | 2026-10-10 |
| RF-06: o aviso dos 30 dias leva a alguma ação? | Só texto, colunas vazias; sem filtro de período novo | 2026-10-10 |
| RF-07: como fica o e2e de evidências? | Dois cenários: acesso negado ao operador sem relação e autor de solicitação encerrada sem botão de anexar | 2026-10-10 |
| RF-06: se a consulta de "tem solicitação fora do recorte" falhar? | Colunas vazias com o aviso "Últimos 30 dias"; o quadro não afirma que o operador nunca teve solicitação | 2026-10-10 |
| Revisão do checklist `requisitos.md`: lacunas restantes | Aceitas como estão: EXTERNO não tem tela de perfil com senha; frases de senha são as duas citadas; "Voltar ao quadro" leva a `/app/solicitacoes` em todos os perfis; RF-08 é provado pela rodada e2e | 2026-10-10 |
