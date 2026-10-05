# rgm-frontend

> Identidade e princípios **deste** projeto. Este arquivo **é versionado** — é o que o time
> compartilha. Os princípios da organização ficam em `.specify/memory/constitution.md`, que o
> `/bu:constitution` gera a cada clone e o `.gitignore` mantém fora do git.

## Identidade

- **Projeto**: rgm-frontend
- **Tipo**: frontend
- **Stack**: React 19, TypeScript 6, Vite 8, React Router 8, TanStack Query 5, react-hook-form com Zod, Tailwind 4, Vitest e Playwright
- **Domínio**: interface web do sistema RGM, em que operadores, gestores e administradores da fábrica abrem e acompanham chamados de manutenção de modelos de fundição em quadro Kanban, com evidências, métricas e administração.
- **Cobertura mínima acordada**: 95%

## Princípios específicos deste projeto

> Entram aqui, e só aqui, as regras que valem para **este** repositório e que não estão nos
> princípios da organização. Cada princípio declara o que **proíbe** — princípio que não
> proíbe nada não é portão.

### Princípio 7 — Mapa de pastas do legado

O projeto nasceu organizado por feature, antes do padrão da organização. Cada pasta
responde por uma camada Byte Union:

| Pasta em `app/src` | Camada Byte Union |
|---|---|
| `features/*/api`, `shared/api` | `adapters/clients` |
| `features/*/hooks`, `shared/hooks` | adaptador entre a UI e a regra |
| `features/*/components`, `features/*/actions`, `features/*/pages`, `shared/components`, `app/layouts` | `adapters/presenters` |
| `features/*/schemas`, `features/*/types`, `features/*/lib`, `shared/lib`, `shared/types` | `core/domain` |
| `shared/config`, `app/providers`, `app/routes` | `infra` |

O teste fica ao lado do arquivo que ele prova (`X.tsx` e `X.test.tsx`), e o contrato de
operação é o `Makefile` da raiz.

**Proíbe:** criar pasta com a nomenclatura Byte Union (`adapters`, `core`, `infra`,
`tests/unit`) ao lado das existentes enquanto a migração não for decidida numa spec própria;
chamar `fetch` fora de `shared/api/httpClient.ts`; e importar `*Api.ts` em componente ou
página nova — componente fala com hook.

### Princípio 8 — Linguagem ubíqua em português

O domínio é nomeado em português no código (`Solicitacao`, `Evidencia`, `responsavelIds`) e
espelha o contrato da API.

**Proíbe:** traduzir ou renomear termo de domínio existente. Termos técnicos (`hook`,
`Modal`, `Page`, `Request`) seguem em inglês. Teste novo usa `it('deve ... quando ...')`.

### Princípio 9 — Compatibilidade com o backend em produção

A v1.5.0 do backend está em produção e as duas partes são publicadas em separado.

**Proíbe:** depender de campo, endpoint ou evento que só existe depois da v1.5.0 do backend
sem comportamento de reserva para quando ele faltar, a menos que a spec declare a ordem de
publicação. Texto ou regra de permissão no cliente nunca concede o que a API recusa.

### Princípio 10 — Cobertura não regride

`app/vitest.config.ts` exige 95% e a medição de 2026-10-05 registrou 99,45% no conjunto
medido.

**Proíbe:** baixar os limites, acrescentar entrada à lista de exclusões de cobertura, e
criar módulo de regra (permissão, validação, mapeamento de erro) em pasta excluída — regra
nova mora em `lib/` ou `schemas/`, onde é medida.

### Princípio 11 — Padrão de teste vale para o que for tocado

A suíte existente (523 testes) segue um padrão anterior ao da organização.

**Proíbe:** teste novo ou alterado fora do Princípio 3 (blocos Arrange/Act/Assert, um
comportamento por teste, consulta por papel e texto acessível). Não exige reescrever teste
que a mudança não toca.

### Princípio 12 — Uma fonte de especificação

Funcionalidade nova é especificada em `specs/NNN-slug/`, pelo fluxo Byte Union. A pasta
`openspec/` fica congelada como registro histórico do comportamento até a v1.5.0: as quatro
mudanças feitas nela estão arquivadas e sincronizadas, e os comandos `/opsx:*` e as skills
`openspec-*` saíram de `.claude/`. A feature que altera comportamento descrito em
`openspec/specs/` acrescenta a própria linha à tabela de `openspec/README.md`.

**Proíbe:** abrir mudança em `openspec/changes/`, alterar `openspec/specs/` e reinstalar
comando ou skill de OpenSpec no repositório.

## Emendas

| Versão | Data | O que mudou |
|---|---|---|
| 1.0.0 | 2026-10-05 | ratificação inicial |
