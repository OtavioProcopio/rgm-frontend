# Checklist — Dashboard: uma pergunta por bloco / desempenho

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

- [ ] RNF-02 diz em que ambiente se mede (API local, 583 solicitações) e a medição é repetível com os dados de teste existentes
- [ ] RNF-03 (no máximo 10 requisições ao carregar) conta só o carregamento da aba, e a spec diz que as visões tipo e prioridade da distribuição carregam quando escolhidas [LACUNA: a spec não diz isso; o plano faz 5 requisições no carregamento e +4 por visão escolhida]
- [ ] O que acontece quando há mais de 100 atrasadas ou mais de 100 concluídas no período está dito [LACUNA: a spec não diz; o plano limita a 100 por consulta e declara a amostra na tela (R2, R3)]
- [ ] Trocar o período não recarrega a fila de atenção (que não depende do período) [LACUNA: a spec não diz; o plano refaz só as três consultas do período]
- [ ] A atualização por eventos em tempo real continua como está e está fora de escopo (Fora de escopo)
- [ ] O meio de medir o RNF-02 e o RNF-03 (rede do navegador no roteiro de capturas) está definido
