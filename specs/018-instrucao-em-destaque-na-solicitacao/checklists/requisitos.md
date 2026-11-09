# Checklist — Instrução em destaque na solicitação / requisitos

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

> Itens marcados `[LACUNA]` são pontos que o agente achou ao cruzar `spec.md` e `plan.md`;
> o revisor decide se viram requisito, ajuste de texto ou são aceitos como estão.

## Completude

- [ ] Todo requisito funcional (RF-01 a RF-10) tem ao menos um critério de aceite em DADO/QUANDO/ENTÃO
- [ ] Todo requisito não funcional (RNF-01 a RNF-06) tem critério mensurável, com número e unidade [LACUNA: RNF-04 mistura contraste, região nomeada e foco; o contraste AA é provado pelos tokens do sistema de design, não por medição nova]
- [ ] O que está fora de escopo está escrito (cartão, edição, triagens antigas, recolher a instrução, outras ações)
- [ ] A ordem de publicação com o backend está dita e a ausência de reserva está declarada (Princípio 9)
- [ ] O que o usuário vê enquanto o detalhe carrega e quando ele falha está dito [LACUNA: a spec não diz; é o comportamento atual da página, sem mudança]

## Clareza

- [ ] Nenhuma marca `[NECESSITA ESCLARECIMENTO]` restante
- [ ] "Triada antes do campo" (RF-03) tem uma só definição: em andamento, em validação ou concluída, sem texto de instrução
- [ ] "Antes dos dados da solicitação" (RF-01) diz o que vem depois: prazo, responsáveis, abertura, status, prioridade, tipo, descrição, modelo
- [ ] Nenhum requisito descreve implementação em vez de comportamento

## Consistência

- [ ] RF-05 substitui o rótulo e o nome do campo da spec 017 (RF-01 e RF-02 de lá); a linha do `openspec/README.md` é ajustada
- [ ] "Descrição" e "O que precisa ser feito" não aparecem com o mesmo significado em nenhuma tela
- [ ] Nenhum requisito contradiz a constituição, em especial o Princípio 9

## Testabilidade

- [ ] Todo critério de aceite pode virar cenário executável sem reinterpretação
- [ ] Todo caminho de erro relevante tem cenário próprio (campo vazio, conflito, rede) [LACUNA: falha de rede na triagem não tem cenário próprio; o RF-08 a cobre junto do conflito]
- [ ] Nenhuma tarefa de teste existe só para cobrir linha: cada uma nomeia o comportamento que prova
