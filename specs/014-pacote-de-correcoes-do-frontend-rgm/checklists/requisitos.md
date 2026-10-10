# Checklist — Pacote de correções do frontend / requisitos

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

> Itens marcados `[LACUNA]` são pontos que o agente achou ao cruzar `spec.md` e `plan.md`;
> o revisor decide se viram requisito, ajuste de texto ou são aceitos como estão.

## Completude

- [ ] Todo requisito funcional (RF-01 a RF-08) tem ao menos um critério de aceite em DADO/QUANDO/ENTÃO [LACUNA: RF-03 e RF-08 não têm cenário próprio; RF-08 é "a suíte inteira passa", provado pela rodada e2e, não por cenário]
- [ ] Todo requisito não funcional (RNF-01 a RNF-04) tem critério mensurável, com número e unidade
- [ ] O que está fora de escopo está escrito e cita a issue que cuida de cada item deixado de fora (#129, #126, #131, #132, #149, #150, #142, #151)
- [ ] O que acontece com o perfil EXTERNO na tela de perfil está dito [LACUNA: o RF-01 diz "só gestor e administrador"; EXTERNO não tem login com senha e não chega a essa tela, mas a spec não afirma isso]
- [ ] O que o usuário vê quando a consulta de "tem solicitação fora do recorte" falha está dito (RF-06) [LACUNA: a spec não diz; o plano assume mostrar o convite de nova solicitação, o que repete a mentira de #141 só em caso de falha]

## Clareza

- [ ] Nenhuma marca `[NECESSITA ESCLARECIMENTO]` restante
- [ ] "Recorte de 30 dias" tem uma só definição: encerradas (concluída e cancelada) dos últimos 30 dias, quando não há filtro de período
- [ ] "Erros de senha" (RF-05) tem lista fechada [LACUNA: a spec cita o "mínimo de 8 caracteres" e "senha atual incorreta"; outras frases de senha do backend não estão listadas]
- [ ] "Voltar ao quadro" (RF-04) diz para qual rota leva, em cada perfil
- [ ] Nenhum requisito descreve implementação em vez de comportamento

## Consistência

- [ ] RF-02 e RF-03 não se contradizem: o mesmo componente é escolhível nos filtros e desabilitado nos formulários
- [ ] Nenhum requisito contradiz a constituição, em especial o Princípio 9 (backend v1.5.0 em produção continua funcionando)
- [ ] O registro de que o RF-01 foi codificado antes da spec está no topo da spec e será repetido na convergência

## Testabilidade

- [ ] Todo critério de aceite pode virar cenário executável sem reinterpretação
- [ ] Todo caminho de erro relevante tem cenário próprio [LACUNA: falha da contagem do RF-06 e falha de rede no detalhe não têm cenário]
- [ ] Os dois cenários e2e do RF-07 dizem como a solicitação é encerrada na preparação (pela API, com o administrador), sem depender do front
