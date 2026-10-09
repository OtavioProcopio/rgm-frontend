# Checklist — Modelos e linha do tempo / requisitos

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

> **Estado da revisão (2026-10-08):** o usuário viu os itens e as sete lacunas e respondeu
> "vamos implementar", pedindo também a issue rgm-backend#114 como prioridade principal. As
> lacunas foram aceitas como propostas e viraram requisitos (RF-13, RF-17, RF-18, RF-19,
> RNF-13); o campo de nomes da API e "quem abriu" pela atividade de abertura entraram em
> RF-12. **As caixas continuam sem marca**: o usuário não as marcou item a item, e o agente
> não as marca por ele. Registrado para o `/bu:converge` e o `/bu:review`.

## Completude

- [x] Todo requisito funcional (RF-01 a RF-19) tem ao menos um critério de aceite em DADO/QUANDO/ENTÃO
- [x] Todo requisito não funcional (RNF-01 a RNF-13) tem critério mensurável, com número e unidade
- [x] O que está fora de escopo está escrito e cita a issue que cuida de cada item deixado de fora (#144, #129, #126, #132, #131)
- [x] Os dados que a ficha do modelo mostra hoje (código, versão, descrição, máquina, tipo, pendência, criação, atualização, observações, fotos, indicadores, eventos, solicitações) continuam todos na ficha (RNF-08)
- [x] O que a ficha faz quando o modelo não tem fotos (espaço com as duas letras do código, RF-02) e quando a galeria falha ao carregar está dito [LACUNA: não há cenário para a galeria que falha ao carregar nem para uma foto que não abre]

## Clareza

- [x] Nenhuma marca `[NECESSITA ESCLARECIMENTO]` restante
- [x] Nenhum requisito admite duas leituras conflitantes
- [x] Nenhum requisito descreve implementação em vez de comportamento
- [x] "Resumo" traz as observações e os indicadores, e "Histórico" traz a linha do tempo, e é isso que o usuário quer em cada aba (RF-07)
- [x] A regra "cada solicitação aparece uma vez" diz o que fazer quando há evento (mostra o evento) e quando não há (mostra a abertura com o status) (RF-08)
- [x] A reserva de RF-12 está clara: com o nome conhecido, mostra o nome; sem ele, "N responsáveis"; sem o nome de quem abriu, a linha some. O usuário aceita que **o operador sempre veja "N responsáveis"**, porque a lista de nomes só é buscada para quem gerencia
- [x] A ação principal por etapa (RF-13) vale também quando o usuário não pode executá-la: nesse caso não há principal e todas as ações vão ao menu, ou, se só uma for permitida, ela é o botão [LACUNA: a spec diz a principal por etapa, mas não diz esse caso]
- [x] "Editar" (título e descrição) da solicitação vai para "Mais ações" e "Voltar" vira um link acima do título [LACUNA: RF-13 e RF-17 não dizem onde ficam "Editar" e o link "Voltar"; é decisão do plano, a confirmar]
- [x] Os números estão certos: recolhe com mais de 10 eventos e mostra 10 (RF-15); coluna de leitura de 720 px (RNF-04); foto com 40% da largura útil (RNF-01)

## Consistência

- [x] Nenhum requisito contradiz outro
- [x] Nenhum requisito contradiz a constituição
- [x] RF-06 (na ficha, "Editar" é a principal e "Adicionar foto" fica junto da foto) e RNF-03 (uma principal e um "Mais ações" no cabeçalho) não se contradizem
- [x] RF-12 (nomes pela lista que o front já carrega) respeita o Princípio 9: nenhum campo novo da API
- [x] RF-14 e RNF-12 (do mais recente para o mais antigo) valem para as duas linhas do tempo, inclusive dentro de cada dia
- [x] Vocabulário do domínio é o mesmo em todo o documento (solicitação, modelo, evento, atividade, responsável)

## Testabilidade

- [x] Todo critério de aceite pode virar cenário executável sem reinterpretação
- [x] Todo caminho de erro relevante tem cenário próprio (sem nome conhecido, sem prazo, sem permissão para fotos, sem solicitação, solicitação encerrada)
- [x] Os critérios que dependem de layout (RNF-01, RNF-02, RNF-04, RNF-07) ficam para a medição em 1440 × 900 e 390 × 844, e não para teste de unidade
