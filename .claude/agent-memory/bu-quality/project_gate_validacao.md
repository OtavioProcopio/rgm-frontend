---
name: gate-de-validacao-rgm-frontend
description: O que `make validate` realmente roda neste repo e como medir cobertura por arquivo e testes novos
metadata:
  type: project
---

`make validate` aqui = lint + typecheck + vitest com cobertura global 95% + build (npm run validate).
Não roda fmt, it nem bdd, e o Makefile chama npm/npx direto (sem docker compose exec dev): desvio
herdado das specs anteriores, já declarado em tasks.md; não é achado novo de cada feature.

**Why:** a constituição (Princípio 1) descreve outra pipeline; reprovar por isso toda vez é ruído.

**How to apply:** cobertura por arquivo se mede com `make cover-arquivos ARQUIVOS="src/..."` (demora ~6 min,
rodar em background). Princípio 11: auditar só testes novos/alterados (diff contra HEAD), não a suíte inteira.
A branch costuma estar sem commits da feature (mudanças só em working tree/stage): autoria não tem o que checar.
