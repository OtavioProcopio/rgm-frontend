# Plano de implementação — Catálogo de modelos com destaque, filtros por botão e fotos navegáveis

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.
> `SRC` = `app/src`, `TST` = `app/tests`. Base: `develop` (`v1.7.0`). Publicação: backend com a
> spec 016 primeiro; sem reserva para backend anterior.

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| Carga por blocos | `useInfiniteQuery` sobre `GET /modelos` com `size=20`, `ordem=CODIGO` e os filtros; o total vem de `totalElements` da primeira página | Paginação numerada; baixar tudo | RF-16 e RF-17; o "n de total" é do servidor |
| Estado dos filtros | Na URL (`useSearchParams`), lido e escrito por uma função pura em `lib/` (`filtrosDoCatalogo`): valida valores, descarta o que não existe e devolve o padrão | `useState` local | RF-18: link compartilhável e Voltar do navegador |
| Histórico | Botões de filtro usam `navigate(…)` com nova entrada; busca, "Mostrar inativos" e troca de modelo usam `replace` | Tudo `replace` ou tudo nova entrada | RF-18 |
| Botões | Tipos de `useTiposModelo` (só ativos) e máquinas de `useMaquinas` (só ativas), os hooks que já existem; contagens de `GET /modelos/contagens` completadas com 0 para o que a API não devolveu | Derivar a lista de botões das contagens | Botão que a API omite (0) precisa existir esmaecido (RF-03) |
| Contagens | `useContagensDeModelos(filtros)` em consulta própria, com os mesmos filtros da lista (menos a página), `placeholderData` da anterior para os números não piscarem | Uma consulta por botão | RNF-01: 1 requisição de contagens por mudança de filtro |
| Busca | `useDebounce` (já existe) com 300 ms e `q` só com 2 ou mais caracteres | Filtrar no cliente | RF-04; a busca é no servidor, sem acento |
| Posição no catálogo | Função pura `posicaoNoCatalogo(modelos, total, codigoOuId)` devolve índice, anterior, próximo e se precisa de outro bloco | Lógica no componente | Regra testável fora de `pages/` (Princípio 10) |
| Navegação ao fim do bloco | `Próximo` no último carregado chama `fetchNextPage` e, quando chega, seleciona o primeiro novo | Desabilitar até o usuário carregar mais | RF-17 |
| Modelo do endereço | Se não está carregado, `fetchNextPage` em laço até achar ou até 5 blocos; senão o primeiro do filtro e `replace` do endereço | Buscar por id e mostrar fora da lista | RF-19; mantém "n de total" coerente |
| Fotos | O destaque usa `fotoCapaUrl` da lista; `useGaleriaModelo(id)` (já existe) carrega as demais; `prefetchQuery` da galeria dos vizinhos | Carregar a galeria de todos | RF-12, RNF-01 |
| Transição de foto | Duas camadas de imagem com `opacity`, em CSS (`transition`), desligada por `motion-reduce:`; a imagem nova só entra depois de carregada (`decode()`) | Biblioteca de carrossel | RF-09; RNF-04 |
| Miniaturas | Faixa com `role="group"`, botões de imagem, `aria-current` na atual e roving tabindex (setas movem o foco e a foto) | `tablist` | RF-10 |
| Foco e teclado | O ouvinte de ←/→ da página ignora campos e a faixa de miniaturas | Capturar sempre | RF-14 |
| Componentes | `CatalogoDeModelos` (página), `FiltrosDoCatalogo` + `BotaoDeFiltro`, `DestaqueDoModelo`, `GaleriaDoDestaque`, `ListaDoCatalogo` + `ItemDoCatalogo` | Um arquivo grande | Cada um com um motivo para mudar |
| `ModeloCard` | Sai da página; é removido se nenhum outro lugar o usa | Reaproveitar na lista | A lista tem outro desenho (miniatura + texto) |
| Contrato | `ModelosFilters` ganha `tipo`, `q`, `maquinaExata`, `ordem`; novo tipo `ContagensDeModelos`; `modelosApi.contagens(filtros)` | Nova API | Sem endpoint inventado: validado contra o swagger do backend 016 |

## Arquivos a criar ou alterar

| Camada | Arquivo | Ação | Teste |
|---|---|---|---|
| domain | `SRC/features/modelos/lib/filtrosDoCatalogo.ts` | criar | `TST/unit/features/modelos/lib/filtrosDoCatalogo.test.ts` |
| domain | `SRC/features/modelos/lib/posicaoNoCatalogo.ts` | criar | `TST/unit/features/modelos/lib/posicaoNoCatalogo.test.ts` |
| domain | `SRC/features/modelos/lib/botoesDoCatalogo.ts` (botões + contagens + zeros) | criar | `TST/unit/features/modelos/lib/botoesDoCatalogo.test.ts` |
| domain | `SRC/features/admin/modelos/types/modeloTypes.ts` (`ModelosFilters`, `ContagensDeModelos`) | alterar | tipos (`tsc`) |
| clients | `SRC/features/admin/modelos/api/modelosApi.ts` (`contagens`) | alterar | `TST/unit/features/admin/modelos/api/modelosApi.test.ts` |
| hook | `SRC/features/modelos/hooks/useCatalogoDeModelos.ts` (infinita) | criar | `TST/unit/features/modelos/hooks/useCatalogoDeModelos.test.tsx` |
| hook | `SRC/features/modelos/hooks/useContagensDeModelos.ts` | criar | `TST/unit/features/modelos/hooks/useContagensDeModelos.test.tsx` |
| hook | `SRC/features/modelos/hooks/useFiltrosDoCatalogo.ts` (URL) | criar | `TST/unit/features/modelos/hooks/useFiltrosDoCatalogo.test.tsx` |
| hook | `SRC/features/modelos/hooks/usePrefetchGaleria.ts` | criar | `TST/unit/features/modelos/hooks/usePrefetchGaleria.test.tsx` |
| presenter | `SRC/features/modelos/components/FiltrosDoCatalogo.tsx`, `BotaoDeFiltro.tsx` | criar | `TST/unit/features/modelos/components/FiltrosDoCatalogo.test.tsx` |
| presenter | `SRC/features/modelos/components/DestaqueDoModelo.tsx` | criar | `TST/unit/features/modelos/components/DestaqueDoModelo.test.tsx` |
| presenter | `SRC/features/modelos/components/GaleriaDoDestaque.tsx` | criar | `TST/unit/features/modelos/components/GaleriaDoDestaque.test.tsx` |
| presenter | `SRC/features/modelos/components/ListaDoCatalogo.tsx`, `ItemDoCatalogo.tsx` | criar | `TST/unit/features/modelos/components/ListaDoCatalogo.test.tsx` |
| presenter | `SRC/features/modelos/pages/ModelosPage.tsx` (vira o catálogo) | alterar | `TST/unit/features/modelos/pages/ModelosPage.test.tsx` |
| presenter | `SRC/features/modelos/components/ModeloCard.tsx` | remover se sem uso | — |
| e2e | `TST/e2e/catalogo-de-modelos.spec.ts` | criar | roteiro e2e |
| docs | `docs/swagger.json`, `openspec/README.md` | alterar | — |

## Contrato entre camadas

- **URL → filtros:** `?tipo=&maquina=&q=&inativos=1&modelo=<id>`; valores inválidos são descartados.
- **Filtros → API:** `GET /modelos?tipo=&maquina=&maquinaExata=true&q=&ativo=true&ordem=CODIGO&page=&size=20` e `GET /modelos/contagens` com os mesmos filtros.
- **Lista → destaque:** o destaque recebe um `Modelo` da lista; a galeria é carregada por `useGaleriaModelo(modelo.id)`.
- **Compatibilidade:** ver "Ordem de publicação" na spec.

## Dependências externas

Nenhuma nova.

## Impacto no contrato de operação

Nenhum.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Backend sem a spec 016 devolve tudo sem filtrar por tipo | média | Ordem de publicação: backend primeiro |
| Foto grande pesada em rede de fábrica | média | Capa já em cache da lista; fotos vizinhas pré-carregadas; só a atual com carregamento imediato |
| Muitas miniaturas na faixa | baixa | Rolagem horizontal da faixa; carregamento preguiçoso |
| Teclado ←/→ conflita com leitor de tela ou campos | baixa | Ouvinte ignora campos e a faixa; teste de foco |
| Endereço com `modelo` de outro filtro gera loop de correção | baixa | Correção uma vez, com `replace`; teste |
| Testes de transição frágeis (tempo) | média | A troca é por estado e classe; testes afirmam o estado final e a classe de movimento reduzido, não o tempo |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| P7 — mapa de pastas | Regra em `lib/`; `fetch` só no cliente HTTP; componentes falam com hooks |
| P8 — linguagem ubíqua | `Modelo`, `tipo`, `maquina`, `galeria`; testes `it('deve ... quando ...')` |
| P9 — compatibilidade | Dependência do backend declarada, com ordem de publicação |
| P10 — cobertura | Regra nova em `lib/`, medida; componentes medidos por `cover-arquivos` |
| P11 — padrão de teste | Testes novos em AAA, um comportamento por teste, consulta por papel e texto acessível |
| P12 — uma fonte | Spec em `specs/019`; linha na tabela de `openspec/README.md` |
