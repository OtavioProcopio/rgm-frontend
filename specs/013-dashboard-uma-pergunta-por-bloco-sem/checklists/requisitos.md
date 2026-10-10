# Checklist — Dashboard: uma pergunta por bloco / requisitos

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

> Itens marcados `[LACUNA]` são pontos que o agente achou ao cruzar `spec.md` e `plan.md`;
> o revisor decide se viram requisito, ajuste de texto ou são aceitos como estão.

## Completude

- [ ] Todo requisito funcional (RF-01 a RF-20) tem ao menos um critério de aceite em DADO/QUANDO/ENTÃO [LACUNA: RF-16 (alturas iguais), RF-19 (aba Modelos sem "0h") e RF-20 (aba Pessoal vazia) não têm cenário próprio]
- [ ] Todo requisito não funcional (RNF-01 a RNF-08) tem critério mensurável, com número e unidade
- [ ] O que está fora de escopo está escrito e cita a issue que cuida de cada item deixado de fora (#126 toasts e esqueletos, spec 014 quadro)
- [ ] Os dados que o painel mostra hoje e deixam de aparecer estão listados: "Usuários", "Modelos", a tabela "Distribuição detalhada por status", as barras por status, tipo e prioridade como três blocos, a pílula "Monitoramento em Tempo Real" e a descrição com o total (RF-12, RF-13, RF-14)
- [ ] O que a fila faz com mais de 5 atrasadas, com nenhuma e com falha na consulta está dito (RF-03, RF-04, RF-15)
- [ ] O que o gestor vê quando o período escolhido não tem concluídas nem período anterior está dito (RF-06)

## Clareza

- [ ] Nenhuma marca `[NECESSITA ESCLARECIMENTO]` restante
- [ ] "Em atraso" tem uma só definição em todo o documento: SLA vencido, em aberto, critério do backend (Esclarecimento 6)
- [ ] "Mais atrasada primeiro" tem uma leitura só [LACUNA: o plano só garante a ordem exata até 100 atrasadas, porque a API não ordena (R2 do plano); a spec não diz isso]
- [ ] RF-08 diz o que "abertas" e "concluídas" significam no gráfico [LACUNA: a série da API é por data de criação ("criadas neste dia que hoje estão abertas ou concluídas"); a spec fala em "abertas e concluídas no período" sem essa ressalva, e o plano a resolve só na legenda]
- [ ] "Período anterior de mesmo tamanho" tem uma leitura só (7 dias contra os 7 anteriores, 30 contra 30, 90 contra 90)
- [ ] Nenhum requisito descreve implementação em vez de comportamento

## Consistência

- [ ] Nenhum requisito contradiz outro
- [ ] Nenhum requisito contradiz a constituição, em especial o Princípio 9 (backend v1.5.0 em produção) para o campo `responsaveis` da fila (RF-02) [LACUNA: o plano cobre com reserva; a spec não menciona o caso de a API não trazer o nome]
- [ ] RF-03 e RF-11 dizem "quadro de solicitações filtrado" [LACUNA: o plano abre a visão **Lista** da página Solicitações, porque o Kanban só filtra por modelo e data; confirmar que é isso que se quer]
- [ ] O Esclarecimento 1 (variação onde há dado) continua verdadeiro com a fonte que o plano escolheu (listagem por data de conclusão, não o histórico)
- [ ] Vocabulário do domínio é o mesmo em todo o documento (atrasada, em aberto, concluída, período)

## Testabilidade

- [ ] Todo critério de aceite pode virar cenário executável sem reinterpretação
- [ ] Todo caminho de erro relevante tem cenário próprio [LACUNA: há cenário de erro só para a distribuição; fila, indicadores e tendência com falha não têm]
- [ ] Os números do critério de aceite (123 atrasadas, 5 itens, 30 dias) podem ser reproduzidos com dados de teste controlados
- [ ] "Variação" e "cor de estado" de cada indicador têm valores de teste definidos (limites de 0 e de 10% das abertas)
