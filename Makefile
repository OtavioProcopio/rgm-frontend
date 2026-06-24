.PHONY: help setup install dev build lint format typecheck test test-run check

help: ## Mostrar ajuda com todos os comandos disponíveis
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Setup & Dependências ──────────────────────────────────────

setup: ## Configurar ambiente (criar .env se não existir e instalar dependências)
	@test -f app/.env || cp app/.env.example app/.env
	$(MAKE) install

install: ## Instalar dependências do Node.js
	cd app && npm install

# ── Execução ─────────────────────────────────────────────────

dev: ## Executar servidor de desenvolvimento do Vite (com hot-reload)
	cd app && npm run dev

# ── Qualidade de Código & Linter ─────────────────────────────

lint: ## Executar verificação de linter (ESLint)
	cd app && npm run lint

format: ## Formatar código com Prettier
	cd app && npm run format

typecheck: ## Verificar erros de tipo com TypeScript Compiler (tsc)
	cd app && npm run typecheck

# ── Testes ───────────────────────────────────────────────────

test: ## Executar testes do Vitest em modo interativo (watch)
	cd app && npm run test

test-run: ## Executar suite de testes do Vitest uma única vez
	cd app && npm run test:run

# ── Validação Global ──────────────────────────────────────────

check: ## Validar tudo (Lint + Typecheck + Testes + Build)
	cd app && npm run check

build: ## Gerar build de produção otimizado na pasta dist
	cd app && npm run build
