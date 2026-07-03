# RGM Frontend

Interface web do sistema de gerenciamento de solicitações de manutenção industrial.

**Stack:** React 19 · TypeScript · Vite 6 · TanStack Query · React Router v7 · React Hook Form + Zod · Tailwind CSS 4 · Vitest

## Quick Start

```bash
# Sobe tudo (PostgreSQL + MinIO + Backend + Frontend)
cd ../rgm-infra && docker compose -f docker-compose.dev.yml up -d
```

**URLs locais:**

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api |
| Swagger | http://localhost:8080/swagger-ui.html |

Login padrão (perfil `dev`): `admin@rgm.com` / `admin123`

## Desenvolvimento

```bash
# Ciclo rápido (lint + typecheck + testes + build, sem coverage)
docker exec rgm-frontend-dev sh -c "cd /workspace && npm run check"

# Pipeline completo (inclui coverage 85%)
docker exec rgm-frontend-dev sh -c "cd /workspace && npm run validate"

# Apenas testes
docker exec rgm-frontend-dev sh -c "cd /workspace && npm run test:run"
```

## Variáveis de ambiente

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Copie `app/.env.example` para `app/.env` para desenvolvimento local.

## Qualidade

| Métrica | Meta |
|---------|------|
| Cobertura de linhas | 95% |
| Cobertura de branches | 95% |
| Lint (ESLint) | 0 erros |
| Typecheck | 0 erros |

## 📚 Documentação

| | |
|---|---|
| 🏗️ [Referência Técnica](../docs/frontend-project.md) | Arquitetura, estrutura de diretórios, padrões e convenções |
| 🔌 [Contrato da API](../../rgm-backend/docs/swagger.json) | Swagger JSON — fonte de verdade dos endpoints |
| 📋 [Casos de Uso](../../rgm-backend/docs/casos-de-uso.md) | Regras de negócio do backend |
