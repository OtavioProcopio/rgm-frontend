## Tipo de mudança

- [ ] `feat` — Nova funcionalidade / nova tela
- [ ] `fix` — Correção de bug
- [ ] `chore` — Configuração, dependências, manutenção
- [ ] `refactor` — Refatoração sem mudança de comportamento
- [ ] `test` — Adição ou correção de testes
- [ ] `docs` — Documentação
- [ ] `perf` — Melhoria de performance

---

## O que foi feito?

<!-- Descreva a mudança. Se for uma tela nova, descreva o fluxo coberto. -->

---

## Como testar?

<!-- Passos para validar manualmente ou rodar os testes relevantes. -->

```bash
# Exemplo:
cd app && npm run dev
# Acesse http://localhost:5173 → rota X
```

---

## Checklist

- [ ] CI passando (lint + typecheck + testes + build)
- [ ] Testes adicionados ou atualizados
- [ ] Nenhum endpoint inventado (todos validados contra `docs/swagger.json`)
- [ ] Sem `any` não justificado no TypeScript
- [ ] Sem chamada HTTP fora da camada `api/`
- [ ] Variáveis de ambiente novas adicionadas ao `app/.env.example`
