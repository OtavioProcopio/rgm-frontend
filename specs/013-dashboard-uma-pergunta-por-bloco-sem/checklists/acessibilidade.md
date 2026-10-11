# Checklist — Dashboard: uma pergunta por bloco / acessibilidade

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

## Percepção

- [ ] Todo estado de cor (bom, atenção, ruim) tem texto ou ícone equivalente (RNF-05, RF-05)
- [ ] O contraste mínimo vale para texto e para elementos gráficos, nos dois temas (RNF-04)
- [ ] O gráfico de tendência tem alternativa em texto com os mesmos números (RF-08)
- [ ] O gráfico vazio explica o motivo em texto (RF-09)

## Operação

- [ ] Todo controle do painel (período, distribuição, "Ver todas", itens da fila, partes da distribuição) é alcançável e acionável por teclado (RNF-05)
- [ ] Todo alvo de toque tem pelo menos 44 × 44 px (RNF-06)
- [ ] Nenhuma informação depende só de passar o mouse; o valor de cada ponto do gráfico também aparece por foco ou toque [LACUNA: RF-08 diz "ao tocar ou passar o mouse"; falta dizer "ao focar com o teclado"]

## Compreensão

- [ ] Carregamento, vazio e erro de cada bloco são anunciados a leitor de tela (RNF-05)
- [ ] Nenhuma animação contínua; as transições respeitam `prefers-reduced-motion` (RNF-07)
- [ ] O controle de período diz qual opção está escolhida por texto, não só por cor (RF-07) [LACUNA: a spec não diz isso; o plano usa um controle segmentado com estado exposto]
- [ ] A ordem de leitura (fila, indicadores, tendência, distribuição) é a mesma na tela e na ordem do teclado, em 1440 × 900 e em 390 × 844 (RF-17)
