.PHONY: help setup install dev build lint fmt format typecheck test test-watch test-run cover coverage check validate

# CAMINHO= limita fmt, lint e test a um arquivo ou pasta, relativo a app/.
# Exemplo: make test CAMINHO=tests/unit/shared/lib

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

lint: ## Executar verificação de linter (ESLint); aceita CAMINHO=
	cd app && npx eslint $(if $(CAMINHO),$(CAMINHO),.)

fmt: ## Formatar código com Prettier; aceita CAMINHO=
	cd app && npx prettier --write $(if $(CAMINHO),$(CAMINHO),.)

format: fmt ## O mesmo que fmt (nome antigo)

typecheck: ## Verificar erros de tipo do código e dos testes (tsc)
	cd app && npm run typecheck

# ── Testes ───────────────────────────────────────────────────

test: ## Executar os testes do Vitest uma única vez; aceita CAMINHO=
	cd app && npm run test:run -- $(CAMINHO)

test-watch: ## Executar testes do Vitest em modo interativo (watch)
	cd app && npm run test

test-run: test ## O mesmo que test (nome antigo)

cover: ## Rodar testes com relatório de cobertura V8 (coverage/); falha abaixo de 95%
	cd app && npm run test:coverage

coverage: cover ## O mesmo que cover (nome antigo)

# ── Validação Global ──────────────────────────────────────────

check: ## Lint + Typecheck + Testes sem cobertura + Build
	cd app && npm run check

validate: ## Pipeline completo XP: lint + typecheck + coverage 85% + build
	cd app && npm run validate

build: ## Gerar build de produção otimizado na pasta dist
	cd app && npm run build
