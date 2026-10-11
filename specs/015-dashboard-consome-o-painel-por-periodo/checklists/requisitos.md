# Checklist — Dashboard sobre o painel por período / requisitos

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

> Itens marcados `[LACUNA]` são pontos que o agente achou ao cruzar `spec.md` e `plan.md`;
> o revisor decide se viram requisito, ajuste de texto ou são aceitos como estão.

## Completude

- [ ] Todo requisito funcional (RF-01 a RF-12) tem ao menos um critério de aceite em DADO/QUANDO/ENTÃO [LACUNA: RF-02 (legibilidade do tempo médio), RF-06 (ordem das colunas Em Andamento, Em Validação, Concluída e Cancelada e o texto do cabeçalho), RF-10 (menos requisições) e RF-12 (distribuição inalterada) não têm cenário próprio]
- [ ] Todo requisito não funcional (RNF-01 a RNF-04) tem critério mensurável, com número e unidade
- [ ] O que está fora de escopo está escrito e cita a issue que cuida de cada item deixado de fora (#150, `rgm-backend#127`, #129, #126, #151)
- [ ] O texto exato do cabeçalho de cada coluna está dito [LACUNA: a spec diz "texto curto"; o plano propõe um texto por status (ex.: "mais recentes primeiro", "prazo mais vencido primeiro") sem aprovação]
- [ ] O que a tendência passa a mostrar está dito [LACUNA: a spec 013 mostrava "abertas e concluídas"; o painel entrega "criadas e concluídas por dia", então a legenda e a leitura mudam; a spec só cita "criadas e concluídas"]

## Clareza

- [ ] Nenhuma marca `[NECESSITA ESCLARECIMENTO]` restante
- [ ] "Mais recentes primeiro" nas colunas Concluída e Cancelada tem uma só leitura [LACUNA: a API ordena por **data de criação**, não de conclusão; a coluna pode mostrar uma encerrada hoje abaixo de outra encerrada ontem mas criada depois. O plano rotula "criadas mais recentes primeiro"; falta decisão sobre abrir issue no backend para ordenar por conclusão]
- [ ] "Total exato" da fila diz onde aparece (contador da fila e "Ver todas")
- [ ] "Menos requisições" tem número (RNF-01: ≤ 3 contra 5 hoje) e diz quais contam: indicadores gerais, fila e painel
- [ ] Nenhum requisito descreve implementação em vez de comportamento

## Consistência

- [ ] RF-07 (404 usa o plano antigo) não contradiz RF-08 (outro erro mostra erro): o sinal é só o status 404
- [ ] Nenhum requisito contradiz a constituição, em especial o Princípio 9: com o backend v1.5.0 tudo funciona (RNF-03)
- [ ] RF-04 e RF-09 convivem: pedir ordenação não pode fazer a fila piorar com o backend antigo (o plano mantém a ordenação no cliente)

## Testabilidade

- [ ] Todo critério de aceite pode virar cenário executável sem reinterpretação
- [ ] Todo caminho de erro relevante tem cenário próprio: 404, erro do servidor, rede [LACUNA: falha de rede no painel não tem cenário; é tratada como "outro erro"]
- [ ] O e2e prova o RF-05 e o RF-07 sem depender de um backend antigo: o 404 é simulado pelo teste, e a ordem é provada contra o backend de `develop` [LACUNA: como o e2e simula o 404 do painel não está dito]
