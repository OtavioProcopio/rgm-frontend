# Checklist — Testes em app/tests espelhando o caminho / requisitos

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

## Completude

- [ ] Todo requisito funcional (RF-01 a RF-11) tem ao menos um critério de aceite em DADO/QUANDO/ENTÃO
- [ ] Todo requisito não funcional (RNF-01 a RNF-06) tem critério mensurável, com número e unidade
- [ ] O que está fora de escopo está escrito
- [ ] A spec diz o destino de cada tipo de arquivo de teste: unidade e componente, utilitários, teste do servidor web e roteiros de ponta a ponta
- [ ] A spec diz o que acontece com a documentação que cita o lugar antigo (RF-11)

## Clareza

- [ ] Nenhuma marca `[NECESSITA ESCLARECIMENTO]` restante
- [ ] A regra de espelhamento tem um exemplo de caminho antes e depois (RF-01)
- [ ] A spec deixa claro que nenhum teste muda de conteúdo ou de nome (RF-03, RF-07)

## Consistência

- [ ] A spec não contradiz o plano de adoção do `as-is.md`
- [ ] O conflito com o Princípio 7 da constituição está identificado e tem saída definida no plano
- [ ] As quatro respostas da tabela Esclarecimentos estão refletidas nos requisitos e nos cenários
- [ ] O backend e a feature 007 estão fora de escopo em todos os artefatos

## Testabilidade

- [ ] Os números de partida (119 arquivos, 777 testes, 99,71% de linhas) estão na spec e podem ser conferidos
- [ ] Cada cenário pode ser verificado por comando ou por contagem
- [ ] Há cenário para a trava aceitar o lugar novo e recusar o antigo
