# Checklist — Tempo real que se recupera, formulários que previnem erro e diálogos em toda a aplicação / acessibilidade

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

## Teclado

- [ ] A spec exige que toda ação e toda confirmação possam ser concluídas e abandonadas só pelo teclado (RF-19, RF-20)
- [ ] A spec diz onde o foco começa numa confirmação destrutiva e que Enter não destrói (RF-21, RF-22)
- [ ] A spec diz para onde o foco volta quando o diálogo fecha (cenário "Esc fecha a ação do detalhe")
- [ ] A spec exige contorno de foco em todas as telas, nos dois temas, com contraste medido (RF-26, RNF-07)

## Tecnologia assistiva

- [ ] O aviso "Sem atualização automática" é anunciado sem mover o foco (RF-08)
- [ ] Todo diálogo tem nome que diz a ação e sobre o que ela age (RF-19, RF-20)
- [ ] Todo botão só de ícone tem nome (RF-27)
- [ ] O contador de caracteres é descrito como informação do campo, não só visual (RF-12)

## Toque

- [ ] A área mínima de 44 por 44 px vale para todas as telas listadas, com largura e tipo de ponteiro da medição definidos (RF-25, RNF-06)
- [ ] A spec não exige mudança de densidade no computador

## Prevenção de erro

- [ ] Toda ação que apaga dado pede confirmação e diz o que será apagado (RF-14, RF-20)
- [ ] Todo descarte de texto digitado pede confirmação (RF-16, RF-18)
- [ ] Nenhum diálogo some durante um envio (RF-23)
- [ ] Erro de envio mantém o que foi preenchido (RF-24)
