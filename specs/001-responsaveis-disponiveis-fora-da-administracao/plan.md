# Plano de implementação — Responsáveis disponíveis fora da administração

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.

> **Cenários de aceite:** o repositório não tem `app/tests/bdd/` nem alvo `make bdd` (ver
> `.specify/memory/as-is.md`, seção 4). Cada cenário da spec vira um teste de componente ou
> de módulo com o nome do cenário, no arquivo indicado nas tarefas.

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| Onde mora o hook | `features/admin/usuarios/hooks/useResponsaveisDisponiveis.ts` | `shared/hooks` | o dado é de usuários; `shared` não pode importar feature. Solicitações passa a depender de um hook público, não da API interna (RF-04) |
| Onde mora o filtro de perfil | função pura em `features/admin/usuarios/lib/responsaveisDisponiveis.ts` | filtro dentro do hook | `hooks/` está fora da medição de cobertura; a regra precisa ser medida (Princípio 10) |
| Quem dispara a busca | `canManageSolicitacoes(perfil)` (GESTOR e ADMINISTRADOR) | `canAccessAdmin`, usado hoje no quadro | a API libera `/api/admin/usuarios` para os dois perfis (`SecurityConfig.java:44-48` do backend); o quadro restringia a administrador por engano (RF-03) |
| Chave de cache | `usuariosKeys.list({ page: 0, size: 100, ativo: true })`, `staleTime` de 5 minutos | chave solta `['admin','usuarios','triagem']` | chave derivada da constante da feature; uma só entre as telas (RNF-01) |

## Padrões de projeto aplicados

| Padrão | Onde | Problema que resolve | Custo aceito |
|---|---|---|---|
| nenhum | — | — | — |

> Recusado: contexto React com a lista de responsáveis. O cache do TanStack Query já
> compartilha o resultado entre telas.

## Arquivos a criar ou alterar

| Camada | Arquivo | Ação | Teste |
|---|---|---|---|
| core/domain | `app/src/features/admin/usuarios/lib/responsaveisDisponiveis.ts` | criar | `app/src/features/admin/usuarios/lib/responsaveisDisponiveis.test.ts` |
| hook | `app/src/features/admin/usuarios/hooks/useResponsaveisDisponiveis.ts` | criar | `app/src/features/admin/usuarios/hooks/useResponsaveisDisponiveis.test.ts` |
| presenters | `app/src/features/solicitacoes/components/KanbanBoard.tsx` | alterar: usa o hook | `app/src/features/solicitacoes/components/KanbanBoard.test.tsx` |
| presenters | `app/src/features/solicitacoes/pages/SolicitacaoDetalhePage.tsx` | alterar: usa o hook | `app/src/features/solicitacoes/pages/SolicitacaoDetalhePage.test.tsx` |

## Contrato entre camadas

Tela → `useResponsaveisDisponiveis()` → `usuariosApi.listar` → `filtrarResponsaveisDisponiveis`.
O hook devolve `{ responsaveis, isLoading }`; erro de busca resulta em lista vazia, como hoje.

## Dependências externas

Nenhuma nova.

## Impacto no contrato de operação

Nenhum.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Mais de 100 usuários ativos: quem passa do 100º não aparece | baixa hoje | fora de escopo declarado; registrado na feature 005 |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| Contrato de operação (1) | Só `make validate`; nenhum alvo novo |
| Arquitetura limpa (2) e mapa do legado (7) | Regra em `lib/`, acesso a dados em `hooks/`, tela em `components/` e `pages/`; nenhuma pasta nova com nomenclatura Byte Union; componente não importa `*Api.ts` |
| Testes provam a entrega (3, 11) | Teste novo com `it('deve ... quando ...')`, blocos Arrange/Act/Assert, consulta por papel e texto |
| Simplicidade defensável (4) | Ver padrões aplicados e recusados |
| Autoria (5) e idioma (6) | Commits só com o autor do git; artefatos em português |
| Linguagem ubíqua (8) | Termos de domínio em português, como na API |
| Compatibilidade com o backend (9) | Usa só endpoint que já existe na v1.5.0 |
| Cobertura não regride (10) | Regra nova em `lib/`, que é medida; nenhuma exclusão acrescentada |
| Uma fonte de especificação (12) | Spec nesta pasta; linha acrescentada em `openspec/README.md` |
