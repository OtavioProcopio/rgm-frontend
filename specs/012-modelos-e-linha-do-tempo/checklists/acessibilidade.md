# Checklist — Modelos e linha do tempo / acessibilidade

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

> **Estado da revisão (2026-10-08):** igual ao de `requisitos.md`. As quatro lacunas daqui
> (teclas das abas, foco ao expandir, data completa no toque e no leitor de tela, redução de
> movimento) viraram RF-19 e RNF-13. As caixas continuam sem marca.

## Teclado e foco

- [ ] O cartão inteiro do modelo abre por teclado (Enter) e tem contorno de foco visível (cenário "Cartão por teclado", RNF-05)
- [ ] As abas "Resumo" e "Histórico" são operáveis só com teclado e o painel escondido não entra na ordem de tabulação [LACUNA: a spec não diz as teclas das abas; o plano adota setas, Home e End]
- [ ] O controle "Mostrar N eventos anteriores" é alcançável por teclado e o foco não se perde ao expandir [LACUNA: a spec não diz onde fica o foco depois de expandir]
- [ ] A galeria ampliada continua abrindo no diálogo que já prende o foco, fecha com Esc e devolve o foco a quem abriu (RF-03)
- [ ] Trocar a foto grande por uma miniatura mantém o foco na miniatura escolhida

## Leitor de tela e texto

- [ ] A foto grande e as miniaturas têm texto alternativo com a identificação da foto, e o espaço sem foto não é lido como imagem sem nome
- [ ] A data completa (hoje só "ao passar o ponteiro") também chega a quem usa toque e leitor de tela [LACUNA: RF-12 e RF-14 dizem "ao passar o ponteiro ou focar"; no toque e no leitor de tela não há como ver a data completa]
- [ ] Cada grupo de dia da linha do tempo ("Hoje", "Ontem", a data) é um título ou rótulo de grupo que o leitor de tela anuncia
- [ ] A mudança de status ("A fazer → Em andamento") é lida como texto, e não só como dois selos coloridos
- [ ] As abas anunciam qual está selecionada

## Cor, contraste e alvo

- [ ] Nenhuma informação é transmitida só por cor: prazo atrasado, selos de status e prioridade têm texto, e o atraso tem o texto "atrasada há ..." (RF-12)
- [ ] O contraste mínimo (4,5:1 para texto, 3:1 para ícone e contorno de foco) vale para os elementos novos nos dois temas (RNF-06)
- [ ] Todo controle novo tem 44 px ou mais em 390 px com toque: abas, miniaturas, "Adicionar foto", "Mostrar N eventos anteriores" e o cartão (RNF-05)
- [ ] O balão de comentário e os eventos de peso menor mantêm o texto legível nos dois temas, inclusive os de peso menor (que têm cor mais fraca)

## Movimento

- [ ] Trocar de aba, trocar de foto e expandir o histórico não usam animação quando o usuário pediu redução de movimento [LACUNA: a spec não repete esta regra das specs 007 e 011 para esta feature]
