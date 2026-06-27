# RGM Frontend — Definição Técnica do Projeto

## 1. Objetivo do projeto

Este projeto é o front-end web do sistema RGM.

O sistema deve consumir a API do backend RGM, exposta via Spring Boot, usando os contratos definidos no arquivo `swagger.json`.

O front-end será desenvolvido com:

- React
- Vite
- TypeScript
- React Router
- TanStack Query
- React Hook Form
- Zod
- ESLint
- Prettier
- Vitest
- Testing Library

O foco do projeto é construir uma aplicação com boa organização, clareza arquitetural, facilidade de manutenção e padrão profissional de engenharia.

---

## 2. Regra principal para o agente

O agente deve sempre consultar os arquivos de referência antes de implementar qualquer feature.

Arquivos de referência esperados:

```txt
swagger.json
docs/frontend-project.md
````

O agente não deve inventar endpoints, payloads, enums ou respostas da API.

Sempre que precisar criar uma chamada HTTP, deve verificar o contrato no `swagger.json`.

---

## 3. Escopo funcional do front-end

O front-end deve cobrir os principais módulos do backend:

```txt
Auth
Solicitações
Evidências
Modelos
Administração
Usuários
```

Fluxos principais:

1. Login do usuário.
2. Controle de sessão com JWT.
3. Listagem de solicitações.
4. Criação de solicitação.
5. Detalhamento de solicitação.
6. Triagem de solicitação.
7. Envio para validação.
8. Devolução para correção.
9. Encerramento ou cancelamento.
10. Comentários em solicitações.
11. Upload e listagem de evidências.
12. Listagem e cadastro de modelos.
13. Administração de usuários.

---

## 4. Stack oficial

A stack oficial do projeto é:

```txt
React
Vite
TypeScript
React Router
TanStack Query
React Hook Form
Zod
Vitest
Testing Library
ESLint
Prettier
```

Evitar adicionar bibliotecas novas sem necessidade real.

Antes de instalar uma nova dependência, o agente deve justificar:

* Qual problema ela resolve.
* Por que a solução nativa ou já existente não basta.
* Qual impacto ela terá na manutenção do projeto.

---

## 5. Estrutura de diretórios

O projeto deve usar arquitetura orientada por features.

Estrutura base:

```txt
app/
  public/
  src/
    app/
      App.tsx
      main.tsx
      router.tsx

      providers/
        AppProviders.tsx
        QueryProvider.tsx
        AuthProvider.tsx

      layouts/
        PublicLayout.tsx
        AppLayout.tsx
        AdminLayout.tsx

    shared/
      api/
        httpClient.ts
        apiError.ts
        authToken.ts

      config/
        env.ts

      components/
        Button/
          Button.tsx
          Button.test.tsx
        Input/
        Modal/
        DataTable/
        PageHeader/
        LoadingState/
        EmptyState/
        ErrorState/

      hooks/
        useDebounce.ts
        usePagination.ts

      lib/
        date.ts
        formatters.ts
        permissions.ts

      types/
        api.ts
        page.ts

    features/
      auth/
        api/
          authApi.ts
        hooks/
          useLogin.ts
          useLogout.ts
        pages/
          LoginPage.tsx
        schemas/
          loginSchema.ts
        types/
          authTypes.ts

      solicitacoes/
        api/
          solicitacoesApi.ts
        hooks/
          useSolicitacoes.ts
          useSolicitacao.ts
          useAbrirSolicitacao.ts
          useTriarSolicitacao.ts
          useEnviarParaValidacao.ts
          useDevolverSolicitacao.ts
          useEncerrarSolicitacao.ts
          useRegistrarComentario.ts
        pages/
          SolicitacoesPage.tsx
          NovaSolicitacaoPage.tsx
          SolicitacaoDetalhePage.tsx
        components/
          SolicitacaoCard.tsx
          SolicitacaoForm.tsx
          SolicitacaoStatusBadge.tsx
          SolicitacaoFilters.tsx
          SolicitacaoTimeline.tsx
          TriagemModal.tsx
          EncerramentoModal.tsx
          DevolucaoModal.tsx
        schemas/
          solicitacaoSchema.ts
        types/
          solicitacaoTypes.ts

      evidencias/
        api/
          evidenciasApi.ts
        hooks/
          useEvidencias.ts
          useUploadEvidencia.ts
        components/
          EvidenciaUploader.tsx
          EvidenciaList.tsx
          EvidenciaPreview.tsx
        types/
          evidenciaTypes.ts

      modelos/
        api/
          modelosApi.ts
        hooks/
          useModelos.ts
          useModelo.ts
          useCriarModelo.ts
          useEditarModelo.ts
          useAtualizarFotoCapa.ts
        pages/
          ModelosPage.tsx
          ModeloDetalhePage.tsx
          NovoModeloPage.tsx
        components/
          ModeloCard.tsx
          ModeloForm.tsx
          ModeloStatusBadge.tsx
          EventosModeloList.tsx
        schemas/
          modeloSchema.ts
        types/
          modeloTypes.ts

      admin/
        usuarios/
          api/
            usuariosApi.ts
          hooks/
            useUsuarios.ts
            useCriarUsuario.ts
            useEditarUsuario.ts
          pages/
            UsuariosPage.tsx
          components/
            UsuarioForm.tsx
            UsuarioTable.tsx
          schemas/
            usuarioSchema.ts
          types/
            usuarioTypes.ts

    styles/
      globals.css
```

---

## 6. Regras de arquitetura

### 6.1 Pages

Arquivos em `pages/` devem representar telas completas.

Uma page pode:

* Ler parâmetros de rota.
* Organizar componentes.
* Chamar hooks da feature.
* Controlar estado simples de tela.

Uma page não deve:

* Fazer `fetch` diretamente.
* Ter regra de negócio complexa.
* Manipular token diretamente.
* Fazer parsing manual de resposta HTTP.

---

### 6.2 Components

Arquivos em `components/` devem ser componentes visuais ou interativos.

Componentes devem receber dados via props.

Evitar componentes com responsabilidade excessiva.

Exemplo ruim:

```tsx
function SolicitacoesPage() {
  // busca dados
  // filtra dados
  // chama API
  // controla modal
  // valida permissão
  // renderiza tabela
  // renderiza formulário
}
```

Exemplo melhor:

```tsx
function SolicitacoesPage() {
  return (
    <>
      <SolicitacaoFilters />
      <SolicitacoesList />
    </>
  );
}
```

---

### 6.3 Hooks

Hooks devem concentrar integração com TanStack Query, mutations e regras de estado reutilizáveis.

Exemplo:

```ts
export function useSolicitacoes(filters: SolicitacaoFilters) {
  return useQuery({
    queryKey: ['solicitacoes', filters],
    queryFn: () => solicitacoesApi.listar(filters),
  });
}
```

---

### 6.4 API Layer

Arquivos `api/*.ts` devem apenas conversar com o backend.

Eles não devem:

* Renderizar componentes.
* Acessar DOM.
* Controlar modal.
* Fazer lógica visual.
* Mostrar toast diretamente.

Exemplo:

```ts
export const solicitacoesApi = {
  listar: (params: SolicitacaoFilters) =>
    httpClient.get<PageResponse<Solicitacao>>('/solicitacoes', { params }),

  buscarPorId: (id: string) =>
    httpClient.get<Solicitacao>(`/solicitacoes/${id}`),
};
```

---

### 6.5 Schemas

Formulários devem usar Zod para validação.

Schemas ficam em:

```txt
features/<feature>/schemas/
```

Exemplo:

```ts
export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
});
```

---

### 6.6 Types

Types da API devem ficar próximos da feature.

Exemplo:

```txt
features/solicitacoes/types/solicitacaoTypes.ts
```

Types compartilhados ficam em:

```txt
shared/types/
```

---

## 7. Variáveis de ambiente

As variáveis públicas do Vite devem começar com `VITE_`.

Arquivo `.env.example` do frontend:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Arquivo recomendado:

```txt
app/.env.example
```

O projeto deve possuir um arquivo:

```txt
src/shared/config/env.ts
```

Exemplo:

```ts
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
};

if (!env.apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL não configurada');
}
```

---

## 8. Integração com backend

A URL base da API deve vir de:

```txt
VITE_API_BASE_URL
```

Exemplo local:

```txt
http://localhost:8080/api
```

O agente deve sempre consultar `swagger.json` antes de criar ou alterar:

* endpoint;
* payload;
* response;
* enum;
* status code;
* tipo de dado;
* nome de propriedade.

---

## 9. Autenticação

O backend usa autenticação JWT.

O front-end deve implementar:

* tela de login;
* armazenamento de access token;
* armazenamento de refresh token, se disponível no contrato;
* envio de `Authorization: Bearer <token>`;
* logout;
* proteção de rotas privadas;
* redirecionamento para `/login` quando não autenticado.

Tokens devem ser manipulados apenas por:

```txt
shared/api/authToken.ts
features/auth/
```

Não espalhar `localStorage.getItem` pelo projeto.

---

## 10. Perfis e autorização no front-end

Perfis esperados:

```txt
ADMINISTRADOR
GESTOR
OPERADOR
EXTERNO
```

O front-end não substitui a autorização do backend.

A regra principal de segurança sempre pertence ao backend.

O front-end deve usar permissões apenas para:

* esconder botões;
* esconder menus;
* melhorar experiência do usuário;
* evitar ações visivelmente inválidas.

Arquivo recomendado:

```txt
shared/lib/permissions.ts
```

Exemplo:

```ts
export function canAccessAdmin(perfil: PerfilUsuario) {
  return perfil === 'ADMINISTRADOR';
}

export function canManageModelos(perfil: PerfilUsuario) {
  return perfil === 'ADMINISTRADOR' || perfil === 'GESTOR';
}
```

---

## 11. Rotas recomendadas

Rotas públicas:

```txt
/login
```

Rotas privadas:

```txt
/app
/app/solicitacoes
/app/solicitacoes/nova
/app/solicitacoes/:id
/app/modelos
/app/modelos/novo
/app/modelos/:id
/app/admin/usuarios
```

Rotas admin devem ser visíveis apenas para usuários com perfil `ADMINISTRADOR`.

---

## 12. Tratamento de erro

Todos os erros HTTP devem passar por uma camada comum.

Arquivo recomendado:

```txt
shared/api/apiError.ts
```

O front-end deve tratar pelo menos:

```txt
400 - Requisição inválida
401 - Não autenticado
403 - Sem permissão
404 - Recurso não encontrado
409 - Conflito de estado
422 - Regra de negócio violada
500 - Erro interno
```

Evitar mensagens genéricas como:

```txt
Erro ao salvar
```

Preferir mensagens úteis:

```txt
Não foi possível abrir a solicitação porque o modelo está inativo.
```

Quando o backend retornar mensagem, ela deve ser reaproveitada quando fizer sentido.

---

## 13. TanStack Query

Usar TanStack Query para todo estado vindo do servidor.

Não usar `useEffect + fetch` manual em páginas.

Padrão de query keys:

```ts
export const solicitacoesKeys = {
  all: ['solicitacoes'] as const,
  lists: () => [...solicitacoesKeys.all, 'list'] as const,
  list: (filters: SolicitacaoFilters) =>
    [...solicitacoesKeys.lists(), filters] as const,
  details: () => [...solicitacoesKeys.all, 'detail'] as const,
  detail: (id: string) => [...solicitacoesKeys.details(), id] as const,
};
```

Após mutations, invalidar queries relacionadas.

Exemplo:

```ts
queryClient.invalidateQueries({
  queryKey: solicitacoesKeys.all,
});
```

---

## 14. Formulários

Formulários devem usar:

```txt
React Hook Form
Zod
@hookform/resolvers
```

Não criar validações manuais espalhadas no JSX.

Cada formulário deve ter:

* schema Zod;
* type inferido do schema;
* mensagens de erro claras;
* estado de loading;
* bloqueio contra duplo submit.

---

## 15. Upload de arquivos

Uploads devem usar `FormData`.

Não definir manualmente o header:

```txt
Content-Type: multipart/form-data
```

O browser deve definir automaticamente o boundary.

O front-end deve validar antes do envio:

* tamanho máximo;
* tipo de arquivo permitido;
* campo obrigatório.

A regra oficial de tipos permitidos deve seguir o backend e/ou a issue aberta sobre MIME types.

---

## 16. Componentes compartilhados

Componentes em `shared/components` devem ser genéricos.

Exemplos:

```txt
Button
Input
Select
Textarea
Modal
DataTable
PageHeader
LoadingState
EmptyState
ErrorState
ConfirmDialog
StatusBadge
```

Componentes específicos ficam dentro da feature.

Exemplo:

```txt
features/solicitacoes/components/SolicitacaoStatusBadge.tsx
```

---

## 17. Padrão de código

Regras:

* Usar TypeScript estrito.
* Evitar `any`.
* Evitar componentes muito grandes.
* Evitar lógica duplicada.
* Evitar chamadas HTTP fora da camada `api`.
* Evitar strings mágicas espalhadas.
* Centralizar enums e constantes.
* Nomear funções de forma clara.
* Não misturar regra de tela com regra de API.

Exemplo ruim:

```ts
if (status === 'EM_VALIDACAO') {
  // ...
}
```

Se a regra se repetir, criar helper:

```ts
export function isSolicitacaoEmValidacao(status: StatusSolicitacao) {
  return status === 'EM_VALIDACAO';
}
```

---

## 18. ESLint, Prettier e qualidade

O projeto deve possuir scripts:

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 0.0.0.0",
    "lint": "eslint .",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "check": "npm run lint && npm run typecheck && npm run test:run && npm run build"
  }
}
```

Antes de abrir Pull Request, o comando abaixo deve passar:

```bash
npm run check
```

---

## 19. Testes

Usar:

```txt
Vitest
Testing Library
```

Prioridade de testes:

1. Helpers de permissão.
2. Schemas Zod.
3. Componentes compartilhados.
4. Hooks com TanStack Query.
5. Fluxos críticos: login, abrir solicitação, triagem, encerramento.

Não é necessário testar detalhes internos de implementação.

Testar comportamento observável.

---

## 20. Git Flow

Fluxo oficial:

```txt
main      -> versão estável
develop   -> integração
feature/* -> novas funcionalidades
fix/*     -> correções
chore/*   -> configuração, estrutura e manutenção
docs/*    -> documentação
```

Exemplos:

```bash
git checkout develop
git pull
git checkout -b feature/frontend-base-setup
```

Commits devem seguir padrão simples:

```txt
chore: setup Vite React project
feat: add authentication flow
feat: add solicitacoes list page
fix: handle unauthorized API response
docs: add frontend project guide
```

---

## 21. Pull Requests

Cada PR deve ter escopo pequeno.

Evitar PRs com muitas features misturadas.

Ordem recomendada:

```txt
1. chore/frontend-base-setup
2. feature/auth-flow
3. feature/solicitacoes-list
4. feature/solicitacao-detail
5. feature/solicitacao-actions
6. feature/evidencias
7. feature/modelos
8. feature/admin-usuarios
```

---

## 22. CI/CD

O projeto deve ter GitHub Actions para validar:

```txt
npm ci
npm run lint
npm run typecheck
npm run test:run
npm run build
```

Workflow sugerido:

```yaml
name: Frontend CI

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  check:
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: app

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: app/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npm run typecheck

      - name: Test
        run: npm run test:run

      - name: Build
        run: npm run build
```

---

## 23. Dev Container

Como o projeto roda em Dev Container, o Vite deve escutar em:

```txt
0.0.0.0
```

Script recomendado:

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0"
  }
}
```

O `.devcontainer/devcontainer.json` deve encaminhar a porta:

```json
{
  "forwardPorts": [5173],
  "portsAttributes": {
    "5173": {
      "label": "Vite Frontend",
      "onAutoForward": "openBrowser"
    }
  }
}
```

---

## 24. Definition of Done

Uma tarefa só deve ser considerada concluída quando:

```txt
- Código implementado.
- TypeScript sem erro.
- ESLint sem erro.
- Build funcionando.
- Testes relevantes criados ou atualizados.
- Nenhum endpoint inventado.
- Integração validada com swagger.json.
- Código sem duplicação óbvia.
- Nomes claros.
- PR pequeno e revisável.
```

---

## 25. Ordem inicial de implementação

O agente deve seguir esta ordem:

### Etapa 1 — Base

```txt
- Conferir estrutura Vite React TS.
- Configurar aliases.
- Configurar ESLint/Prettier.
- Configurar Router.
- Configurar TanStack Query.
- Criar AppProviders.
- Criar layouts básicos.
- Criar httpClient.
- Criar env.ts.
```

### Etapa 2 — Auth

```txt
- Criar authApi.
- Criar LoginPage.
- Criar useLogin.
- Criar AuthProvider.
- Criar PrivateRoute.
- Criar logout.
- Guardar tokens.
```

### Etapa 3 — Solicitações

```txt
- Criar types base.
- Criar solicitacoesApi.
- Criar useSolicitacoes.
- Criar SolicitacoesPage.
- Criar filtro por status.
- Criar detalhe da solicitação.
- Criar criação de solicitação.
```

### Etapa 4 — Ações da solicitação

```txt
- Triar.
- Enviar para validação.
- Devolver.
- Encerrar.
- Comentar.
- Atualizar cache após mutations.
```

### Etapa 5 — Evidências

```txt
- Listar evidências.
- Upload de evidência.
- Preview.
- Validação de arquivo.
```

### Etapa 6 — Modelos

```txt
- Listar modelos.
- Criar modelo.
- Editar modelo.
- Detalhar modelo.
- Foto de capa.
```

### Etapa 7 — Admin

```txt
- Usuários.
- Máquinas.
- Prestadores externos.
- Ações administrativas.
```

---

## 26. Restrições para o agente

O agente não deve:

```txt
- Criar endpoint que não existe no swagger.json.
- Alterar arquitetura sem justificar.
- Misturar features diferentes no mesmo PR.
- Colocar regra de negócio complexa dentro de componente visual.
- Usar any sem justificativa.
- Fazer fetch diretamente em pages.
- Espalhar localStorage pelo código.
- Ignorar erros HTTP.
- Criar dependência nova sem necessidade.
- Fazer refatoração ampla junto com feature.
```

---

## 27. Resultado esperado

O resultado esperado é um front-end profissional, modular e sustentável, capaz de evoluir junto com o backend RGM.

O projeto deve ser simples o suficiente para manter, mas organizado o suficiente para não virar código descartável.

```

Esse arquivo já serve bem como “contrato de trabalho” para o agente.  
O próximo markdown útil seria um `docs/agent-tasks.md`, com a ordem exata dos prompts/tarefas para ele executar em branches pequenas.
```
