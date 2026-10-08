# Checklist — Sistema de design e tema / acessibilidade

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

> Os 13 itens foram exibidos ao usuário e aprovados por ele em 2026-10-07 ("aprovados.").

## Contraste

- [x] A spec fixa o contraste mínimo de texto normal (4,5:1) e de texto grande (3:1), e diz o que é texto grande (RNF-01)
- [x] A spec fixa o contraste mínimo de borda de campo, ícone que informa e contorno de foco (RNF-02)
- [x] Os dois critérios valem para os dois temas e para as 16 telas
- [x] O caso apontado na issue ("Sem prioridade") tem cenário próprio

## Cor e significado

- [x] A spec exige que nenhuma informação dependa só de cor (RF-23)
- [x] A spec diz quais elementos mantêm cor própria e quais ficam neutros (RF-20, RF-21, RF-22)
- [x] Todo elemento que mantém cor tem texto ou ícone exigido junto

## Teclado e leitor de tela

- [x] O controle de tema tem requisito de uso por teclado, de fechar com Esc e de informar a opção ativa (RF-15)
- [x] As três sobreposições de foto têm requisito de foco preso, Esc e retorno do foco (RF-08)
- [x] A área de toque de 44 px e o contorno de foco das especificações anteriores continuam exigidos (RNF-08)

## Preferências do usuário

- [x] A primeira visita respeita a preferência de tema do sistema (RF-11)
- [x] A escolha explícita do usuário prevalece sobre o sistema (cenário "Escolha explícita não segue o sistema")
- [x] A spec diz o que acontece com quem já tinha tema guardado (RF-14)
