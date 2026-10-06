# Checklist — Card confiável e controles acessíveis / requisitos

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

## Completude

- [ ] Todo requisito funcional obrigatório tem ao menos um critério de aceite em DADO/QUANDO/ENTÃO
- [ ] Todo requisito não funcional tem critério mensurável, com número e unidade
- [ ] O que está fora de escopo está escrito, com a issue que fica com cada item
- [ ] As quatro issues de origem estão cobertas

## Clareza

- [ ] Nenhuma marca `[NECESSITA ESCLARECIMENTO]` restante
- [ ] Nenhum requisito cita componente, função ou biblioteca
- [ ] A spec diz quando o selo de prazo aparece e quando não aparece

## Consistência

- [ ] A spec não contradiz as issues de origem
- [ ] A spec não contradiz as features 002 a 005
- [ ] O requisito desejável do diálogo (envio em andamento) está marcado como fora desta entrega em todos os artefatos

## Testabilidade

- [ ] Cada cenário pode ser verificado por teste automatizado ou por medição descrita
- [ ] Os requisitos de largura, área de toque e contraste dizem como são medidos
