# Checklist — Testes em app/tests espelhando o caminho / requisitos

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

## Completude

- [x] Todo requisito funcional (RF-01 a RF-11) tem ao menos um critério de aceite em DADO/QUANDO/ENTÃO
- [x] Todo requisito não funcional (RNF-01 a RNF-06) tem critério mensurável, com número e unidade
- [x] O que está fora de escopo está escrito
- [x] A spec diz o destino de cada tipo de arquivo de teste: unidade e componente, utilitários, teste do servidor web e roteiros de ponta a ponta
- [x] A spec diz o que acontece com a documentação que cita o lugar antigo (RF-11)

## Clareza

- [x] Nenhuma marca `[NECESSITA ESCLARECIMENTO]` restante
- [x] A regra de espelhamento tem um exemplo de caminho antes e depois (RF-01)
- [x] A spec deixa claro que nenhum teste muda de conteúdo ou de nome (RF-03, RF-07)

## Consistência

- [x] A spec não contradiz o plano de adoção do `as-is.md`
- [x] O conflito com o Princípio 7 da constituição está identificado e tem saída definida no plano
- [x] As quatro respostas da tabela Esclarecimentos estão refletidas nos requisitos e nos cenários
- [x] O backend e a feature 007 estão fora de escopo em todos os artefatos

## Testabilidade

- [x] Os números de partida (119 arquivos, 777 testes, 99,71% de linhas) estão na spec e podem ser conferidos
- [x] Cada cenário pode ser verificado por comando ou por contagem
- [x] Há cenário para a trava aceitar o lugar novo e recusar o antigo
