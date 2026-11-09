# Checklist — Descrição do que fazer na triagem (front) / requisitos

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

> Itens marcados `[LACUNA]` são pontos que o agente achou ao cruzar `spec.md` e `plan.md`;
> o revisor decide se viram requisito, ajuste de texto ou são aceitos como estão.

## Completude

- [ ] Todo requisito funcional (RF-01 a RF-06) tem ao menos um critério de aceite em DADO/QUANDO/ENTÃO
- [ ] Todo requisito não funcional (RNF-01 a RNF-04) tem critério mensurável [LACUNA: RNF-03 diz "rótulo associado e erro anunciado" sem teste de leitor de tela; é provado por consulta a rótulo e papel]
- [ ] O que está fora de escopo está escrito (instrução no card, edição posterior, triagens antigas, outras ações)
- [ ] A ordem de publicação com o backend está dita e a ausência de reserva está declarada (Princípio 9)
- [ ] O que acontece quando a triagem falha na API (conflito, recusa) está dito [LACUNA: a spec não diz; o comportamento é o de antes, com o erro da ação exibido e o formulário preservado]

## Clareza

- [ ] Nenhuma marca `[NECESSITA ESCLARECIMENTO]` restante
- [ ] "Só com espaços" (RF-02) tem uma só definição: após remover espaços das pontas, vazio
- [ ] Nenhum requisito descreve implementação em vez de comportamento

## Consistência

- [ ] RF-04 e RF-05 não se contradizem: a descrição vai na triagem; a foto não leva texto
- [ ] Nenhum requisito contradiz a constituição, em especial o Princípio 9
- [ ] O registro de que o código veio antes da spec está no topo e será repetido na convergência

## Testabilidade

- [ ] Todo critério de aceite pode virar cenário executável sem reinterpretação
- [ ] Todo caminho de erro relevante tem cenário próprio [LACUNA: falha da triagem na API e descrição já preenchida ao reabrir o formulário não têm cenário]
