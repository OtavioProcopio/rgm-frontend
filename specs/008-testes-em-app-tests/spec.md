# Especificação — Testes em app/tests espelhando o caminho

> Descreve **o quê** e **por quê**. Não descreve como implementar: sem nome de biblioteca,
> sem esquema de banco, sem assinatura de função.

Origem: decisão do usuário em 2026-10-06, depois que a trava de estrutura do plugin Byte
Union recusou testes novos ao lado do código durante a feature 007. É o item "testes ao
lado do arquivo" do plano de adoção em `.specify/memory/as-is.md`.

Numeração: esta feature é a 008 porque a 007 está em andamento em outra branch.

## Problema

O repositório guarda cada teste ao lado do arquivo que ele testa. O padrão Byte Union,
adotado como padrão único do projeto, exige os testes numa árvore própria, separada por
tipo e espelhando o caminho do arquivo testado. Hoje:

1. A trava do plugin recusa qualquer teste novo ao lado do código. Nenhuma feature consegue
   escrever teste sem contornar a trava ou sem criar um segundo lugar de teste.
2. Os 118 testes de unidade e de componente estão espalhados por 47 pastas de produção; há
   mais 1 teste solto na raiz da aplicação e 9 roteiros de ponta a ponta numa pasta à parte.
3. Com teste e produção misturados, a medição de cobertura e a análise estática precisam de
   regras de exclusão por nome de arquivo.

Custo de não resolver: a feature 007 está parada, e toda feature seguinte para no mesmo
ponto.

## Objetivo

Todo teste do repositório vive na árvore de testes, no caminho que espelha o arquivo
testado, e a trava do plugin aceita os testes novos sem exceção. Nenhum teste muda de
comportamento: a mesma quantidade roda, com o mesmo resultado e a mesma cobertura.

## Fora de escopo

- Mudar o que qualquer teste verifica, renomear testes ou reescrevê-los no padrão de nome e
  de blocos da constituição (fica para quando cada arquivo for tocado por uma feature).
- Mover o código de produção para as camadas do padrão (`adapters`, `core`, `infra`): é
  outro item do plano de adoção.
- Criar testes de integração ou de aceite que hoje não existem.
- Mudar o limite de cobertura ou a lista do que a cobertura mede.
- Mudar os alvos do contrato de operação além do necessário para os testes continuarem
  rodando.
- O repositório do backend, que terá a sua própria especificação.
- A feature 007, que será retomada depois desta e adequará os próprios testes.

## Personas e cenários de uso

- **Quem desenvolve** cria um teste novo e precisa saber, sem pensar, onde ele mora.
- **Quem desenvolve** abre um arquivo de produção e quer achar o teste dele.
- **Quem revisa** quer ver, num PR, o teste no lugar previsível.
- **A esteira de integração** roda análise estática, tipos, testes, cobertura e build.

## Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | Todo teste de unidade e de componente deve estar na árvore de testes de unidade, no caminho que espelha o do arquivo testado a partir de dentro da pasta de código: o teste de `app/src/shared/lib/x` fica em `app/tests/unit/shared/lib/x` | obrigatório |
| RF-02 | Nenhum arquivo de teste deve restar ao lado do código de produção | obrigatório |
| RF-03 | O teste de um arquivo deve ter o mesmo nome de hoje; só o lugar muda | obrigatório |
| RF-04 | Os utilitários compartilhados pelos testes (dublês, fábricas de dados, provedores de teste) devem sair da pasta de código e ficar em `app/tests/support` | obrigatório |
| RF-05 | O teste solto na raiz da aplicação, que confere a configuração do servidor web, deve ir para os testes de unidade, em `app/tests/unit` | obrigatório |
| RF-06 | Os roteiros de ponta a ponta devem ir para `app/tests/e2e`, e a ferramenta que os executa deve continuar encontrando os 9 | obrigatório |
| RF-07 | Todos os testes que passam hoje devem continuar passando, sem nenhum removido, ignorado ou alterado no que verifica | obrigatório |
| RF-08 | A análise estática e a verificação de tipos devem continuar cobrindo os arquivos de teste | obrigatório |
| RF-09 | A cobertura deve continuar medindo os mesmos arquivos de produção | obrigatório |
| RF-10 | Criar um teste novo no caminho espelhado deve ser aceito pela trava de estrutura do plugin | obrigatório |
| RF-11 | A documentação do repositório (constituição, retrato as-is e guia de contribuição, onde citarem o lugar dos testes) deve dizer o lugar novo | obrigatório |

## Requisitos não funcionais

| ID | Requisito | Critério mensurável |
|---|---|---|
| RNF-01 | Nenhum teste perdido | mesma quantidade de arquivos de teste e de testes antes e depois: 119 arquivos e 777 testes na `develop` de 2026-10-06 |
| RNF-02 | Cobertura preservada | mesma cobertura de linhas de antes (99,71%), com diferença de no máximo 0,01 ponto |
| RNF-03 | Nenhum teste ao lado do código | 0 arquivos de teste fora da árvore de testes |
| RNF-04 | Histórico preservado | 100% dos arquivos movidos reconhecidos como renomeação pelo controle de versão |
| RNF-05 | Dependências | 0 dependências novas |
| RNF-06 | Validação | `make validate` verde, com 0 erros de análise estática e de tipos |

## Critérios de aceite

```gherkin
# language: pt
Funcionalidade: Testes em app/tests espelhando o caminho

  Cenário: Teste no caminho espelhado
    Dado um arquivo de produção que tinha teste ao lado
    Quando procuro o teste dele
    Então ele está em `app/tests/unit`, no mesmo caminho que o arquivo tem dentro de `app/src`
    E tem o mesmo nome de antes

  Cenário: Nenhum teste ao lado do código
    Dado o repositório depois da reorganização
    Quando listo os arquivos de teste fora da árvore de testes
    Então a lista está vazia

  Cenário: Utilitários de teste no lugar definido
    Dado os utilitários compartilhados pelos testes
    Quando procuro por eles
    Então estão todos em `app/tests/support`
    E nenhum resta dentro de `app/src`

  Cenário: Teste da configuração do servidor web
    Dado o teste que confere a configuração do servidor web
    Quando procuro por ele
    Então ele está em `app/tests/unit`, e não na raiz da aplicação

  Cenário: Roteiros de ponta a ponta
    Dado os roteiros de ponta a ponta
    Quando procuro por eles
    Então estão todos em `app/tests/e2e`
    E a ferramenta que os executa lista os 9

  Cenário: Mesmos testes, mesmo resultado
    Dado a suíte de testes de antes da reorganização, com 119 arquivos e 777 testes passando
    Quando rodo a suíte depois da reorganização
    Então rodam 119 arquivos e 777 testes
    E todos passam
    Mas nenhum teste foi ignorado

  Cenário: Análise estática e tipos enxergam os testes
    Dado um erro de tipo introduzido de propósito num arquivo de teste movido
    Quando rodo a validação
    Então a validação falha apontando o arquivo

  Cenário: Cobertura mede os mesmos arquivos
    Dado o relatório de cobertura de antes da reorganização
    Quando gero o relatório depois
    Então a lista de arquivos de produção medidos é a mesma
    E a cobertura de linhas difere em no máximo 0,01 ponto

  Cenário: Teste novo é aceito pela trava
    Dado a trava de estrutura do plugin ativa
    Quando crio um teste novo no caminho espelhado
    Então a trava aceita

  Cenário: Teste novo ao lado do código é recusado
    Dado a trava de estrutura do plugin ativa
    Quando tento criar um teste novo ao lado do código
    Então a trava recusa

  Cenário: Documentação aponta o lugar novo
    Dado a constituição e o retrato as-is do repositório
    Quando leio onde ficam os testes
    Então os dois apontam a árvore de testes com caminho espelhado
```

## Ambiguidades

Nenhuma em aberto.

## Esclarecimentos

| Pergunta | Resposta do usuário | Data |
|---|---|---|
| O caminho espelhado inclui a pasta `src`? (RF-01) | Não: `app/tests/unit/shared/lib/x.test.ts` | 2026-10-06 |
| Para onde vão os utilitários de teste? (RF-04) | `app/tests/support` | 2026-10-06 |
| O teste da configuração do servidor web é de unidade ou de integração? (RF-05) | Unidade: `app/tests/unit` | 2026-10-06 |
| Os roteiros de ponta a ponta entram nesta reorganização? (RF-06) | Sim, para `app/tests/e2e` | 2026-10-06 |

## Métricas de sucesso

- A feature 007 é retomada e escreve os testes dela sem bater na trava.
- Nenhum PR seguinte cria teste ao lado do código.
- A esteira de integração passa no PR desta reorganização sem mudança no número de testes.
