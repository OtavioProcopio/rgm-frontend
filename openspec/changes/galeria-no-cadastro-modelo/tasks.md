## 1. Fluxo de cadastro em dois passos

- [x] 1.1 Em `NovoModeloPage.tsx`, guardar o `Modelo` retornado por `criarModelo.mutateAsync` em estado local em vez de navegar imediatamente, e verificar com teste que a página permanece montada após o submit bem-sucedido
- [x] 1.2 Renderizar `GaleriaModelo` (reaproveitada de `ModeloDetalhePage`) para o modelo recém-criado quando o passo 2 estiver ativo, com `podeGerenciar` sempre `true` (só GESTOR/ADMINISTRADOR acessam essa rota)
- [x] 1.3 Adicionar um botão "Ir para o detalhe do modelo" (ou equivalente) que navega para `/app/admin/modelos/{id}` a qualquer momento do passo 2, e verificar com teste que funciona com e sem fotos adicionadas
- [x] 1.4 Atualizar o texto de apoio da página (`PageHeader` description) para refletir o novo fluxo

## 2. Regressão

- [x] 2.1 Atualizar `NovoModeloPage.test.tsx` cobrindo: submit cria o modelo e mostra a galeria; adicionar foto usa o hook existente sem novo endpoint; navegar sem fotos funciona
- [x] 2.2 Rodar `make check-frontend` (lint + typecheck + testes + build) e confirmar que passa
