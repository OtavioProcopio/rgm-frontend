# Checklist — Sistema de design e tema / requisitos

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

> Os 16 itens foram exibidos ao usuário e aprovados por ele em 2026-10-07 ("aprovados.").

## Completude

- [x] Todo requisito funcional (RF-01 a RF-23) tem ao menos um critério de aceite em DADO/QUANDO/ENTÃO
- [x] Todo requisito não funcional (RNF-01 a RNF-13) tem critério mensurável, com número e unidade
- [x] O que está fora de escopo está escrito, e cita a issue que cuida de cada item deixado de fora

## Clareza

- [x] Nenhuma marca `[NECESSITA ESCLARECIMENTO]` restante
- [x] Nenhum requisito admite duas leituras conflitantes
- [x] Nenhum requisito descreve implementação em vez de comportamento
- [x] A lista de papéis de cor de RF-01 é a que o usuário quer (11 papéis)
- [x] Está claro o que são as "16 telas" a que os requisitos se referem

## Consistência

- [x] Nenhum requisito contradiz outro
- [x] Nenhum requisito contradiz a constituição
- [x] Vocabulário do domínio é o mesmo em todo o documento
- [x] RF-22 (o que mantém cor) e RF-21 (prioridade e prazo como destaque) não se contradizem
- [x] RNF-07 (disposição preservada) lista como exceção todo requisito que muda aparência de propósito

## Testabilidade

- [x] Todo critério de aceite pode virar cenário executável sem reinterpretação
- [x] Todo caminho de erro relevante tem cenário próprio
- [x] As cinco respostas do esclarecimento têm cenário próprio
