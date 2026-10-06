# As-is — rgm-frontend

Retrato do repositório em `develop` @ `d8ebfa0` (2026-10-05), produzido por `/bu:reverse`.
Nenhum arquivo de código foi alterado para gerar este documento.

## 1. Retrato

Interface web do sistema RGM: quadro Kanban de solicitações de manutenção sobre modelos de
fundição, com evidências, galeria de modelos, métricas e área administrativa. Consome a API
do `rgm-backend` e é servida por nginx, que também faz o proxy de `/api/`.

- **Stack:** React 19, TypeScript 6, Vite 8, React Router 8, TanStack Query 5,
  react-hook-form com Zod 4, Tailwind 4 (`app/package.json`).
- **Tamanho:** 193 arquivos de produção e 105 de teste; 19.887 linhas de TypeScript
  (`inventory.py`).
- **Entrypoint:** `app/src/main.tsx`, rotas em `app/src/app/router.tsx`.
- **Versão em produção:** `v1.5.0` (tag em `main`); `develop` está 4 commits à frente, todos
  de dependências.
- **Repos irmãos:** `rgm-backend` (Spring Boot) e `rgm-infra` (compose e deploy).

## 2. Domínio identificado

| Elemento | Onde | Observação |
|---|---|---|
| Tipos de solicitação, status, prioridade | `app/src/features/solicitacoes/types/solicitacaoTypes.ts` | espelham os enums da API |
| Permissão por perfil | `app/src/shared/lib/permissions.ts` | espelha `PerfilUsuario` do backend |
| Permissão por solicitação | `app/src/features/solicitacoes/pages/SolicitacaoDetalhePage.tsx:78-85`, `:213-224` e `app/src/features/solicitacoes/components/KanbanBoard.tsx:109-114`, `:138-170` | regra escrita duas vezes, dentro de componente |
| Transições do quadro | `KanbanBoard.tsx:71-92` (`NEXT_STATUS`, `getMoveType`) | regra de negócio em componente |
| Rótulos e mensagens de erro | `app/src/features/solicitacoes/lib/solicitacaoMessages.ts` e um `lib/*Messages.ts` por feature | rótulos de enum repetidos em filtros e badges |
| Validação de formulário | `app/src/features/*/schemas/*.ts` (Zod) | |
| Sessão | `app/src/shared/api/authToken.ts`, `app/src/app/providers/AuthProvider.tsx` | `AuthUser` só tem nome e perfil; o id vem de `usePerfil` |

## 3. Arquitetura as-is × alvo

O projeto é organizado por feature (`features/<área>/{api,hooks,components,pages,schemas,types,lib}`),
não por camada. A direção das dependências é boa na maior parte; a diferença para o padrão
Byte Union é de pastas e de onde mora a regra.

| Área hoje | Camada alvo | O que impede migrar agora |
|---|---|---|
| `features/*/api/*Api.ts`, `shared/api/httpClient.ts` | `adapters/clients` | só mudança de pasta; `fetch` já está concentrado em `httpClient.ts` |
| `features/*/hooks` | adaptador entre UI e caso de uso | hooks chamam a API direto; não há camada de caso de uso |
| `features/*/components`, `features/*/pages`, `app/layouts`, `shared/components` | `adapters/presenters` | páginas concentram busca, permissão e mutação (`SolicitacaoDetalhePage.tsx`, 548 linhas) |
| `features/*/schemas`, `features/*/types`, `features/*/lib`, `shared/lib` | `core/domain` | `lib/` mistura rótulo de tela com regra |
| `shared/config`, `shared/lib/theme.ts`, `app/providers` | `infra/tools` e `infra/init` | renomeação |
| testes ao lado do arquivo (`X.test.tsx`) | `app/tests/unit/<caminho espelhado>` | 96 arquivos a mover; `vitest.config.ts` e imports relativos |

Acoplamento entre features: `features/solicitacoes` importa `features/admin` (API de
usuários em `KanbanBoard.tsx:5` e `SolicitacaoDetalhePage.tsx:41`; hooks de modelos e
máquinas), `features/evidencias` e `features/auth`.

## 4. Contrato de operação

| Alvo exigido | Hoje | Diferença |
|---|---|---|
| `Makefile` em `app/` | `Makefile` na raiz, que entra em `app/` | local |
| `make infra`, `make init`, `make down`, `make ps`, `make logs` | não há | não existe `docker-compose.yml` no repositório; o de `.devcontainer/` serve só ao devcontainer |
| `make install` | `install` (`npm install`) | roda na máquina, não num serviço `dev` |
| `make fmt` | `format` (Prettier) | nome |
| `make lint` | `lint` (ESLint) e `typecheck` (`tsc --noEmit`) | dois alvos |
| `make test` | `test` (watch) e `test-run` | `test` não é headless |
| `make cover` | `coverage` | limite de 95% em `app/vitest.config.ts:48-53` |
| `make it` | não há | |
| `make bdd` | não há alvo; `npm run e2e` (Playwright, 9 specs em `app/e2e/`) exige backend no ar | |
| `make validate` | `validate`: lint → typecheck → cobertura → build | roda headless; é o que a CI repete em `.github/workflows/ci.yml` |
| `make run` | `dev` | nome |

Versões de Node divergem: `Dockerfile:4` usa 26, a CI usa 22 (`.github/workflows/ci.yml:32`)
e não há `.nvmrc` nem `engines`.

## 5. Testes

- **Medição de 2026-10-05 (`make validate`):** 96 arquivos, 523 testes, todos passando;
  cobertura de 99,45% de statements, 98,79% de branches, 100% de funções e 99,43% de linhas.
- **A cobertura não mede a interface.** `app/vitest.config.ts:22-45` exclui `pages/`,
  `components/` de feature, todos os `hooks/`, as `*Api.ts`, layouts, providers e rotas.
  O número acima vale para `schemas/`, `lib/`, `shared/components` e pouco mais. Os testes
  de página e de componente existem e rodam, mas não entram na conta.
- **Padrão:** Vitest com Testing Library, teste ao lado do arquivo, nome em inglês
  (`it('renders the upload button')`), sem blocos Arrange/Act/Assert marcados.
- **E2E:** 9 specs Playwright em `app/e2e/`; não rodam na CI.

## 6. Riscos

1. **Falha silenciosa:** 11 pontos capturam erro de upload ou de exportação e só registram
   no console (issue #112).
2. **Regra de permissão duplicada em componente**, já divergente: a lista de responsáveis
   é carregada para GESTOR no detalhe (`SolicitacaoDetalhePage.tsx:90`) e só para
   ADMINISTRADOR no quadro (`KanbanBoard.tsx:131`).
3. **Listas truncadas:** o quadro busca 200 solicitações de uma vez
   (`features/solicitacoes/hooks/useKanbanSolicitacoes.ts:12`); o que passa do limite some
   da tela (issue #114).
4. **Tempo real:** o proxy de `/api/` tem buffer ligado e `proxy_read_timeout 60s`
   (`nginx.conf:31`), valendo também para o SSE (issue #113).
5. **Tokens:** access token na query string do SSE
   (`features/solicitacoes/hooks/useSolicitacaoEvents.ts:31`); ver `rgm-backend#93`.
6. **Dois padrões de especificação** até esta data: OpenSpec (`openspec/`, 8 capacidades,
   3 mudanças abertas e já entregues) e Byte Union. **Resolvido em 2026-10-05:** mudanças
   sincronizadas e arquivadas, ferramental OpenSpec removido de `.claude/`, `openspec/`
   congelado (Princípio 12 de `.specify/project.md`).
7. **Aviso de lint** conhecido: `react-hooks/incompatible-library` em
   `NovaSolicitacaoPage.tsx:75` (`watch` do react-hook-form).

## 7. Plano de adoção em ondas

### Onda 1 — especificação única e constituição

- `.specify/project.md`, constituição e `openspec/` congelado.
- **Pronto quando:** não há mudança OpenSpec aberta e toda issue nova nasce em `specs/NNN-slug/`.
- **Risco de parar no meio:** baixo.

### Onda 2 — contrato de operação

- Alvos `fmt`, `cover`, `run`, `bdd` no `Makefile` como nomes do padrão, mantendo os atuais;
  `test` headless; versão única de Node declarada.
- **Pronto quando:** `make validate` e os alvos do padrão rodam sem passo manual.
- **Risco de parar no meio:** baixo; os alvos antigos continuam funcionando.

### Onda 3 — cobertura que mede a interface

- Retirar, pasta a pasta, as exclusões de `hooks/`, `components/` e `pages/` do
  `vitest.config.ts`, começando pelo que cada feature tocar.
- **Pronto quando:** a lista de exclusões só tem tipos, entrypoint e utilitários de teste.
- **Risco de parar no meio:** número de cobertura cai antes de subir; por isso é por pasta.

### Onda 4 — regra fora do componente e camadas

- Regra de permissão e de transição sai das páginas para módulos puros testados sem
  renderizar (issue #115 é o primeiro passo); depois, decidir numa spec própria se as pastas
  migram para `adapters/`, `core/` e `infra/`.
- **Pronto quando:** nenhuma página decide permissão por conta própria.
- **Risco de parar no meio:** duas formas de decidir permissão convivendo.
