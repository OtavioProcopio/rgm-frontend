# Checklist — Sistema de design e tema / requisitos

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

## Completude

- [ ] Todo requisito funcional (RF-01 a RF-23) tem ao menos um critério de aceite em DADO/QUANDO/ENTÃO
- [ ] Todo requisito não funcional (RNF-01 a RNF-13) tem critério mensurável, com número e unidade
- [ ] O que está fora de escopo está escrito, e cita a issue que cuida de cada item deixado de fora

## Clareza

- [ ] Nenhuma marca `[NECESSITA ESCLARECIMENTO]` restante
- [ ] Nenhum requisito admite duas leituras conflitantes
- [ ] Nenhum requisito descreve implementação em vez de comportamento
- [ ] A lista de papéis de cor de RF-01 é a que o usuário quer (11 papéis)
- [ ] Está claro o que são as "16 telas" a que os requisitos se referem

## Consistência

- [ ] Nenhum requisito contradiz outro
- [ ] Nenhum requisito contradiz a constituição
- [ ] Vocabulário do domínio é o mesmo em todo o documento
- [ ] RF-22 (o que mantém cor) e RF-21 (prioridade e prazo como destaque) não se contradizem
- [ ] RNF-07 (disposição preservada) lista como exceção todo requisito que muda aparência de propósito

## Testabilidade

- [ ] Todo critério de aceite pode virar cenário executável sem reinterpretação
- [ ] Todo caminho de erro relevante tem cenário próprio
- [ ] As cinco respostas do esclarecimento têm cenário próprio
