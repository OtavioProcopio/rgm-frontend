# Plano de implementação — Falhas visíveis de upload e exportação

> Descreve **como**. Deriva da spec e da constituição; não introduz requisito novo.

> **Cenários de aceite:** o repositório não tem `app/tests/bdd/` nem alvo `make bdd` (ver
> `.specify/memory/as-is.md`, seção 4). Cada cenário da spec vira um teste de componente ou
> de módulo com o nome do cenário, no arquivo indicado nas tarefas.

## Decisões técnicas

| Decisão | Escolha | Alternativas descartadas | Por quê |
|---|---|---|---|
| Regra de arquivo | função pura `validarArquivo(arquivo, tipos)` em `shared/lib/arquivoPermitido.ts`, com as listas `TIPOS_DE_EVIDENCIA` (JPEG, PNG, GIF, WebP, PDF, MP4) e `TIPOS_DE_IMAGEM` (JPEG, PNG, WebP) e o limite de 10 MB | constantes repetidas em cada tela, como hoje | uma regra só, medida (RF-06, RF-07, RNF-02). `shared` porque evidências, solicitações e modelos usam |
| Anexo com aviso | hook `useAnexoComAviso()` em `features/evidencias/hooks`: guarda o arquivo que falhou, expõe `estado` (`falhou`, `enviado`), `anexar` e `tentarNovamente` | estado de aviso dentro de cada ação | um lugar só para o reenvio; a abertura usa o mesmo hook e deixa de chamar `evidenciasApi` direto (Princípio 7) |
| Aviso | componente `AvisoFotoNaoEnviada` em `features/evidencias/components`, com papel de alerta, "Tentar novamente" e um botão de saída cujo rótulo quem usa define | toast | decisão da spec; o aviso precisa de botão |
| Onde o aviso aparece nas ações | `useExecutarAcao` devolve `anexo`; a ação mostra o aviso no lugar do formulário e só chama `onClose` quando o usuário sai do aviso | fechar o formulário e mostrar o aviso na página | o formulário já saiu de cena (a ação foi feita) e o usuário não é levado a lugar nenhum (RF-04) |
| Ação aberta sobrevive à mudança de status | `SolicitacaoAcoes` mantém a ação aberta até ela fechar, mesmo que a ação deixe de ser permitida; a página de detalhe passa a renderizar `SolicitacaoAcoes` também em status terminal (sem botões) | condicionar à permissão, como na feature 002 | depois de triar, "Triar" deixa de ser permitida e o aviso sumiria |
| Conclusão com foto | `useExecutarAcao` aceita `anexarAntes`: envia a foto, depois executa a ação; lembra o arquivo já enviado para não repetir | manter foto depois da ação | a API recusa anexo em solicitação encerrada (RF-10, RF-11) |
| Exportações | componente `ExportarPdfButton` em `shared/components` + `baixarArquivo` e `mensagemDeFalhaNaExportacao` em `shared/lib` | corrigir o `catch` nas quatro páginas | as quatro cópias são idênticas; a mensagem fica junto do botão por construção (RF-08) |
| Texto das mensagens | `acaoFeitaSemFoto` em `features/solicitacoes/lib/solicitacaoMessages.ts` | texto solto em cada ação | texto de regra fica em `lib/`, medido |

## Padrões de projeto aplicados

| Padrão | Onde | Problema que resolve | Custo aceito |
|---|---|---|---|
| nenhum | — | — | — |

> Recusado: contexto global de notificações. A spec decidiu por mensagem local.

## Arquivos a criar ou alterar

| Camada | Arquivo | Ação | Teste |
|---|---|---|---|
| core/domain | `app/src/shared/lib/arquivoPermitido.ts` | criar | `app/src/shared/lib/arquivoPermitido.test.ts` |
| core/domain | `app/src/shared/lib/exportacao.ts` | criar: `baixarArquivo`, `mensagemDeFalhaNaExportacao` | `app/src/shared/lib/exportacao.test.ts` |
| core/domain | `app/src/features/solicitacoes/lib/solicitacaoMessages.ts` | alterar: `acaoFeitaSemFoto`, `mensagemFotoNaoEnviadaAntes` | `solicitacaoMessages.test.ts` |
| hook | `app/src/features/evidencias/hooks/useAnexoComAviso.ts` | criar | `app/src/features/evidencias/hooks/useAnexoComAviso.test.ts` |
| hook | `app/src/features/solicitacoes/hooks/useExecutarAcao.ts` | alterar: aviso, `anexarAntes` | `useExecutarAcao.test.ts` |
| presenters | `app/src/features/evidencias/components/AvisoFotoNaoEnviada.tsx` | criar | `AvisoFotoNaoEnviada.test.tsx` |
| presenters | `app/src/features/evidencias/components/EvidenciaUploader.tsx` | alterar: usa `validarArquivo` | `EvidenciaUploader.test.tsx` |
| presenters | `app/src/features/solicitacoes/actions/{Triar,Devolver,Encerrar}Action.tsx` | alterar: aviso; foto antes na conclusão | `.test.tsx` de cada um |
| presenters | `app/src/features/solicitacoes/components/SolicitacaoAcoes.tsx` e `pages/SolicitacaoDetalhePage.tsx` | alterar: ação aberta sobrevive | `SolicitacaoAcoes.test.tsx` |
| presenters | `app/src/features/solicitacoes/pages/NovaSolicitacaoPage.tsx` | alterar: aviso, sem navegação automática, `validarArquivo` | `NovaSolicitacaoPage.test.tsx` |
| presenters | `app/src/features/admin/modelos/components/AdicionarFotoGaleriaForm.tsx` | alterar: usa `validarArquivo` | teste existente |
| presenters | `app/src/shared/components/ExportarPdfButton/ExportarPdfButton.tsx` | criar | `ExportarPdfButton.test.tsx` |
| presenters | `SolicitacoesPage.tsx`, `ModelosTab.tsx`, `admin/modelos/pages/ModelosPage.tsx`, `admin/modelos/pages/ModeloDetalhePage.tsx` | alterar: usam `ExportarPdfButton` | testes existentes das páginas |

## Contrato entre camadas

- `validarArquivo(arquivo, tipos?)` → mensagem de erro ou `null`.
- `useAnexoComAviso()` → `{ estado, enviando, anexar(solicitacaoId, file, opcoes), tentarNovamente() }`;
  `anexar` e `tentarNovamente` devolvem `true` quando o envio é aceito.
- `useExecutarAcao(solicitacaoId, onConcluida)` → `{ erro, anexo, executar(acao, evidencia?) }`,
  com `evidencia = { file, tipo, descricao, feito, anexarAntes? }`. `feito` é a frase da ação
  já concluída, usada no aviso.
- `ExportarPdfButton` recebe `buscar: () => Promise<Blob>` e `nomeDoArquivo: () => string`.

## Dependências externas

Nenhuma nova.

## Impacto no contrato de operação

Nenhum.

## Riscos

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Foto da conclusão enviada e conclusão recusada deixa uma evidência "Conclusão" numa solicitação ainda em validação | baixa | a foto fica visível no detalhe e pode ser excluída; nova tentativa não a duplica (RF-11) |
| Vídeo MP4 e GIF passam a ser aceitos e a pré-visualização só trata imagem | certa | `EvidenciaPreview` já mostra link para o que não é imagem |

## Conformidade com a constituição

| Princípio | Como este plano o respeita |
|---|---|
| Contrato de operação (1) | Só `make validate`; nenhum alvo novo |
| Arquitetura limpa (2) e mapa do legado (7) | Regra em `lib/`, envio em `hooks/`, tela em `components/`, `actions/` e `pages/`; `NovaSolicitacaoPage` deixa de importar `evidenciasApi` |
| Testes provam a entrega (3, 11) | Teste novo ou alterado com `it('deve ... quando ...')`, Arrange/Act/Assert, consulta por papel e texto |
| Simplicidade defensável (4) | Ver padrões aplicados e recusados |
| Autoria (5) e idioma (6) | Commits só com o autor do git; artefatos em português |
| Linguagem ubíqua (8) | Tipos de evidência como na API (`INSTRUCAO_SERVICO`, `CONCLUSAO`, `DEVOLUCAO`, `ABERTURA`) |
| Compatibilidade com o backend (9) | Tudo funciona com a v1.5.0; a ordem foto-depois-ação na conclusão é exigida por ela |
| Cobertura não regride (10) | Regras em `lib/`; `shared/components` e `actions/` medidos; nenhuma exclusão acrescentada |
| Uma fonte de especificação (12) | Spec nesta pasta; linha acrescentada em `openspec/README.md` |
