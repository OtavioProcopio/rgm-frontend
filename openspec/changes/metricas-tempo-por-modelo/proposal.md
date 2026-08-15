## Why

O backend (rgm-backend, change `metricas-tempo-por-modelo`) passa a expor um
ranking de modelos por tempo medio de resolucao e intervalo medio entre
solicitacoes. Sem uma interface, essa comparacao fica inacessivel aos
gestores — o objetivo deste change e expor essa comparacao no Dashboard, no
detalhe do modelo e via export PDF, seguindo a decisao ja tomada com o
usuario (metrica: as duas; superficies: Dashboard, Detalhe do modelo e PDF).

## What Changes

- Aba "Modelos" do Dashboard (`ModelosTab`) ganha uma tabela ordenavel de
  ranking (tempo medio de resolucao / intervalo medio entre solicitacoes),
  paginada, consumindo o novo endpoint do backend, com botao de exportar PDF.
- Pagina de detalhe do modelo (`ModeloDashboard`, dentro de
  `ModeloDetalhePage`) ganha dois novos KPIs (tempo medio de resolucao e
  intervalo medio entre solicitacoes), calculados no cliente a partir das
  solicitacoes daquele modelo ja carregadas na pagina — sem nova chamada de
  API, reaproveitando o padrao ja usado pelos KPIs existentes daquele
  componente (total/abertas/concluidas/taxa de sucesso).

## Capabilities

### New Capabilities
(nenhuma - estende capacidades existentes)

### Modified Capabilities
- `metricas-dashboard`: nova secao de ranking de modelos por tempo na aba
  Modelos do Dashboard, com ordenacao e export PDF
- `modelos`: o mini-dashboard do detalhe do modelo ganha as duas metricas de
  tempo

## Impact

- Novo hook `useMetricasPorModelo` (`features/solicitacoes/hooks`) e funcao
  de API correspondente
- Novo componente de tabela de ranking dentro de `ModelosTab.tsx`
- `ModeloDashboard` (dentro de `ModeloDetalhePage.tsx`) ganha logica de
  calculo client-side das duas metricas a partir do array de solicitacoes ja
  carregado
- Nenhuma mudanca de rota ou de schema de autorizacao
