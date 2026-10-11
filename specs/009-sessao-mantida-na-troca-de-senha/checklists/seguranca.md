# Checklist — Sessão mantida na troca de senha e quadro do operador / segurança

> Avalia a **qualidade da especificação**, não do código. `[x]` significa "requisito
> aprovado por revisor humano". O agente não se autoaprova.

## Sessão e credenciais

- [ ] A spec diz que as credenciais anteriores deixam de ser usadas depois da troca (RF-01)
- [ ] A spec diz o que acontece com as credenciais quando a troca falha (RF-05)
- [ ] A spec diz o que acontece quando a resposta não traz credenciais novas (RF-04)
- [ ] A spec deixa explícito que as outras sessões do usuário caem, e que isso é desejado (Fora de escopo)
- [ ] A spec deixa explícito que a redefinição de senha pelo administrador derruba a sessão do usuário afetado (Fora de escopo)
- [ ] A spec não muda onde as credenciais ficam guardadas e aponta a issue que trata disso (Fora de escopo)

## Visibilidade

- [ ] Nenhum requisito faz a tela mostrar ao operador algo que a API não devolve
- [ ] A marca de relação do card não aparece para perfis que veem todas as solicitações (RF-08)
- [ ] A ordem de publicação com o backend está declarada, com a consequência de publicar fora dela (RNF-05)

## Exposição

- [ ] Nenhum requisito pede para exibir, registrar ou enviar credencial fora da chamada de troca de senha
- [ ] Nenhuma mensagem nova de tela revela se uma conta existe ou qual é a senha
