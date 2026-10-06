# Checklist — Tempo real que se recupera, formulários que previnem erro e diálogos em toda a aplicação / requisitos

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

## Completude

- [ ] Todo requisito funcional (RF-01 a RF-27) tem ao menos um critério de aceite em DADO/QUANDO/ENTÃO
- [ ] Todo requisito não funcional (RNF-01 a RNF-09) tem critério mensurável, com número e unidade
- [ ] O que está fora de escopo está escrito, com a issue que fica com cada item
- [ ] As quatro issues de origem (#121, #123, #124, #125) estão cobertas
- [ ] A spec lista todos os campos que ganham limite e o limite de cada um (RF-09, RF-10)
- [ ] A spec lista todas as confirmações que viram diálogo modal (RF-20)
- [ ] A spec lista todas as telas onde a área de toque e o foco são exigidos (RF-25)

## Clareza

- [ ] Nenhuma marca `[NECESSITA ESCLARECIMENTO]` restante
- [ ] Nenhum requisito cita componente, função ou biblioteca
- [ ] A spec diz o que é atualizado quando a conexão volta e o que não é (RF-01, RF-02)
- [ ] A spec diz quando a aplicação para de tentar reconectar (RF-05)
- [ ] A spec diz quando o aviso aparece, onde aparece e quando some (RF-06, RF-07)
- [ ] A spec diz quando a confirmação de descarte aparece e quando não aparece (RF-16 a RF-18)

## Consistência

- [ ] A spec não contradiz as issues de origem
- [ ] A spec não contradiz a feature 006 (diálogo do quadro, área de toque, foco)
- [ ] Os limites de RF-09 são os mesmos que o banco da API grava
- [ ] As seis respostas da tabela Esclarecimentos estão refletidas nos requisitos e nos cenários
- [ ] O que depende do backend (rgm-backend#98 e #109) está fora de escopo em todos os artefatos

## Testabilidade

- [ ] Cada cenário pode ser verificado por teste automatizado ou por medição descrita
- [ ] Os cenários de limite usam valores exatos na fronteira (255 e 256; 229 e 230; 7 e 8)
- [ ] Os caminhos de erro têm cenário próprio: falha de rede, sessão expirada, falha no envio
- [ ] Os requisitos de área de toque e de contraste dizem como são medidos
