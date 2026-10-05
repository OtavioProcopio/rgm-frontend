## Why

Hoje, ao cadastrar um modelo (`NovoModeloPage`), o usuário é redirecionado
imediatamente para o detalhe do modelo, e a página do próprio formulário já
avisa: "A galeria de fotos pode ser adicionada depois, na página de
detalhes." Isso funciona, mas exige um passo extra e desconectado —
cadastrar, depois navegar até o detalhe, depois abrir a galeria. Como o
modelo criado já tem um `id` disponível assim que a criação retorna, é
barato deixar o usuário adicionar as fotos ali mesmo, antes de sair da
página, sem nenhuma mudança de backend.

## What Changes

- `NovoModeloPage` passa a ter dois passos: (1) formulário de dados do
  modelo (como hoje) e (2) após criar com sucesso, a mesma seção de galeria
  usada no detalhe do modelo (`GaleriaModelo`), permitindo adicionar 0..N
  fotos antes de seguir.
- Um botão "Concluir" (ou navegação normal) leva ao detalhe do modelo a
  qualquer momento do passo 2 — adicionar fotos nunca é obrigatório.
- Nenhuma mudança de API: reaproveita os endpoints de galeria já existentes
  (`AdicionarFotoGaleriaUseCase` no backend, já usado no detalhe do
  modelo).
- O aviso atual ("a galeria pode ser adicionada depois") é ajustado para
  refletir que agora dá para adicionar na hora, sem perder a opção de
  pular.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `modelos`: o cadastro de modelo passa a oferecer, logo após a criação, a
  mesma interface de galeria do detalhe, antes de redirecionar.

## Impact

- `app/src/features/admin/modelos/pages/NovoModeloPage.tsx`: passa a
  controlar um estado de "modelo recém-criado" e renderizar
  `GaleriaModelo` (já existente, reaproveitada de
  `ModeloDetalhePage`) nesse passo, em vez de navegar imediatamente.
- Nenhuma mudança em `GaleriaModelo.tsx`, `AdicionarFotoGaleriaForm.tsx`
  ou nos hooks/endpoints de galeria — reuso direto.
- Sem mudança de backend.
- Testes: `NovoModeloPage.test.tsx` precisa cobrir o novo passo (galeria
  aparece após criar, navegação funciona com ou sem fotos adicionadas).
