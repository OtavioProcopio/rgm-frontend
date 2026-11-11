# Checklist — Catálogo de modelos com destaque / requisitos

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

> Itens marcados `[LACUNA]` são pontos que o agente achou ao cruzar `spec.md` e `plan.md`;
> o revisor decide se viram requisito, ajuste de texto ou são aceitos como estão.

## Completude

- [ ] Todo requisito funcional (RF-01 a RF-23) tem ao menos um critério de aceite em DADO/QUANDO/ENTÃO [LACUNA: RF-06 (ordem) e RF-12 (pré-carga dos vizinhos) não têm cenário próprio; são provados por teste de hook]
- [ ] Todo requisito não funcional (RNF-01 a RNF-07) tem critério mensurável, com número e unidade
- [ ] O que está fora de escopo está escrito (editar fotos, PDF, comparar, ordenação, administração)
- [ ] A ordem de publicação com o backend está dita, sem reserva (Princípio 9)
- [ ] O que o usuário vê enquanto a galeria carrega e quando ela falha está dito (RF-12, RF-21)
- [ ] O que acontece com um modelo que sai do filtro enquanto está em destaque (por exemplo, é desativado por outra pessoa) está dito [LACUNA: a spec não diz; o plano deixa o destaque como está até o próximo filtro]

## Clareza

- [ ] Nenhuma marca `[NECESSITA ESCLARECIMENTO]` restante
- [ ] "Primeiro modelo do filtro" tem uma só definição: o primeiro na ordem de código, versão maior primeiro
- [ ] "Botão com 0 desabilitado, exceto o escolhido" (RF-03) cobre o caso de o escolhido ter 0 por causa de outro filtro
- [ ] O padrão "só ativos" (RF-05) muda o que a grade de hoje mostra e está nos Esclarecimentos como decisão a confirmar
- [ ] Nenhum requisito descreve implementação em vez de comportamento

## Consistência

- [ ] RF-18 (histórico do navegador) e RF-07 (reiniciar ao filtrar) não se contradizem: o reinício não cria entrada extra
- [ ] RF-14 e RF-10 não se contradizem: a mesma seta troca modelo fora da faixa e foto dentro dela
- [ ] Nenhum requisito contradiz a constituição, em especial o Princípio 9

## Testabilidade

- [ ] Todo critério de aceite pode virar cenário executável sem reinterpretação
- [ ] Todo caminho de erro relevante tem cenário próprio (lista, contagens, fotos extras, endereço)
- [ ] A transição de foto é verificada pelo estado final e pela classe de movimento reduzido, não pelo tempo
