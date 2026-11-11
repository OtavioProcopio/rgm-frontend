import { useEffect } from 'react';

import { useGaleriaModelo } from '@/features/admin/modelos/hooks/useGaleriaModelo';
import { useMaquinas } from '@/features/admin/modelos/hooks/useMaquinas';
import { useTiposModelo } from '@/features/admin/modelos/hooks/useTiposModelo';
import { EmptyState } from '@/shared/components/EmptyState/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState/LoadingState';
import { PageHeader } from '@/shared/components/PageHeader/PageHeader';
import { Button } from '@/shared/components/Button/Button';
import { nomeDoTipoDeModelo } from '@/shared/lib/rotulos';

import { DestaqueDoModelo } from '../components/DestaqueDoModelo';
import { FiltrosDoCatalogo } from '../components/FiltrosDoCatalogo';
import { ListaDoCatalogo } from '../components/ListaDoCatalogo';
import { useAberturaDoCatalogo } from '../hooks/useAberturaDoCatalogo';
import { useBuscaDoCatalogo } from '../hooks/useBuscaDoCatalogo';
import { useCatalogoDeModelos } from '../hooks/useCatalogoDeModelos';
import { useContagensDeModelos } from '../hooks/useContagensDeModelos';
import { useCopiarLink } from '../hooks/useCopiarLink';
import { useFiltrosDoCatalogo } from '../hooks/useFiltrosDoCatalogo';
import { usePrefetchGaleria } from '../hooks/usePrefetchGaleria';
import { useTeclasDoCatalogo } from '../hooks/useTeclasDoCatalogo';
import { botoesDoCatalogo, totaisPorMaquina, totaisPorTipo } from '../lib/botoesDoCatalogo';
import {
  TAMANHO_DO_BLOCO,
  buscaCurtaDemais,
  escreverFiltros,
  paraConsulta,
  temFiltro,
} from '../lib/filtrosDoCatalogo';
import { posicaoNoCatalogo } from '../lib/posicaoNoCatalogo';

const AVISOS = {
  foraDoFiltro: 'Este modelo não estava no filtro escolhido; mostrando todos os modelos.',
  naoEncontrado: 'Modelo não encontrado.',
} as const;

/** O catálogo de modelos: filtros por botão, o modelo em destaque com fotos e a lista ao lado. */
export function ModelosPage() {
  const filtrosDaUrl = useFiltrosDoCatalogo();
  const { filtros, definirModelo, substituirFiltros } = filtrosDaUrl;
  const consulta = paraConsulta(filtros);

  const abertura = useAberturaDoCatalogo({ filtros, substituirFiltros, definirModelo });
  const catalogo = useCatalogoDeModelos(consulta, abertura.paginaInicial, abertura.pronta);
  const contagens = useContagensDeModelos(consulta);
  const { data: tipos } = useTiposModelo();
  const { data: maquinas } = useMaquinas();
  const copia = useCopiarLink();
  const busca = useBuscaDoCatalogo(filtros.q, filtrosDaUrl.definirBusca);

  const { modelos, total } = catalogo;
  const destaque = modelos.find((modelo) => modelo.id === filtros.modelo) ?? null;
  const posicao = destaque
    ? posicaoNoCatalogo(modelos, destaque.id, catalogo.primeiraPagina, TAMANHO_DO_BLOCO, total)
    : null;

  // O primeiro do resultado vira o destaque quando o endereço não diz qual (ou diz um que sumiu).
  useEffect(() => {
    if (abertura.pronta && modelos.length > 0 && !destaque) definirModelo(modelos[0].id);
  }, [abertura.pronta, modelos, destaque, definirModelo]);

  const galeria = useGaleriaModelo(destaque?.id);
  usePrefetchGaleria([posicao?.anterior?.id, posicao?.proximo?.id]);

  const fotosDaGaleria = (galeria.data ?? [])
    .slice()
    .sort((a, b) => Number(b.principal) - Number(a.principal))
    .map((foto) => foto.publicUrl);
  const fotos = fotosDaGaleria.length
    ? fotosDaGaleria
    : destaque?.fotoCapaUrl
      ? [destaque.fotoCapaUrl]
      : [];

  function linkDoModelo(id: string) {
    return { search: `?${escreverFiltros({ ...filtros, modelo: id }).toString()}` };
  }

  async function avancar() {
    if (posicao?.proximo) definirModelo(posicao.proximo.id);
    else if (posicao?.faltaCarregarDepois) {
      const novos = await catalogo.carregarDepois();
      if (novos[0]) definirModelo(novos[0].id);
    }
  }

  async function voltar() {
    if (posicao?.anterior) definirModelo(posicao.anterior.id);
    else if (posicao?.faltaCarregarAntes) {
      const novos = await catalogo.carregarAntes();
      const ultimo = novos.at(-1);
      if (ultimo) definirModelo(ultimo.id);
    }
  }

  useTeclasDoCatalogo(
    () => void voltar(),
    () => void avancar(),
  );

  const opcoesDeTipo = (tipos ?? [])
    .filter((tipo) => tipo.ativo)
    .map((tipo) => ({ valor: tipo.nome, rotulo: nomeDoTipoDeModelo(tipo.nome) }));
  const opcoesDeMaquina = (maquinas ?? [])
    .filter((maquina) => maquina.ativo)
    .map((maquina) => ({ valor: maquina.nome, rotulo: maquina.nome }));

  const restantesDepois = Math.max(
    total - (catalogo.primeiraPagina * TAMANHO_DO_BLOCO + modelos.length),
    0,
  );
  const restantesAntes = catalogo.primeiraPagina * TAMANHO_DO_BLOCO;
  const aguardando = !abertura.pronta || catalogo.carregando;

  return (
    <section className="space-y-4">
      <PageHeader title="Modelos" description="Visualize os modelos de máquinas disponíveis." />

      {abertura.aviso ? (
        <p role="status" className="rounded-md bg-warning-soft px-4 py-2 text-sm text-warning-fg">
          {AVISOS[abertura.aviso]}
        </p>
      ) : null}

      <FiltrosDoCatalogo
        tipos={botoesDoCatalogo('Todos', opcoesDeTipo, totaisPorTipo(contagens.data), filtros.tipo)}
        maquinas={botoesDoCatalogo(
          'Todas',
          opcoesDeMaquina,
          totaisPorMaquina(contagens.data),
          filtros.maquina,
        )}
        onTipo={filtrosDaUrl.escolherTipo}
        onMaquina={filtrosDaUrl.escolherMaquina}
        busca={busca.digitado}
        onBusca={busca.setDigitado}
        buscaCurta={buscaCurtaDemais(busca.digitado)}
        inativos={filtros.inativos}
        onInativos={filtrosDaUrl.definirInativos}
        temFiltro={temFiltro(filtros)}
        onLimpar={filtrosDaUrl.limpar}
      />

      {catalogo.erro ? (
        <ErrorState
          title="Não foi possível carregar os modelos."
          description="Verifique a conexão e tente novamente."
          onRetry={catalogo.tentarDeNovo}
        />
      ) : aguardando ? (
        <LoadingState title="Carregando modelos..." linhas={6} />
      ) : modelos.length === 0 ? (
        <EmptyState
          title="Nenhum modelo neste filtro"
          description="Troque os filtros ou limpe a busca."
          action={
            <Button variant="secondary" onClick={filtrosDaUrl.limpar}>
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <div className="grid items-start gap-4 min-[800px]:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
          {destaque && posicao ? (
            <DestaqueDoModelo
              modelo={destaque}
              numero={posicao.numero}
              total={total}
              podeVoltar={posicao.anterior !== null || posicao.faltaCarregarAntes}
              podeAvancar={posicao.proximo !== null || posicao.faltaCarregarDepois}
              aoVoltar={() => void voltar()}
              aoAvancar={() => void avancar()}
              fotos={fotos}
              carregandoFotos={galeria.isLoading}
              erroNasFotos={galeria.isError}
              aoTentarFotos={() => void galeria.refetch()}
              estadoDaCopia={copia.estado}
              aoCopiar={() => void copia.copiar()}
            />
          ) : (
            <LoadingState title="Carregando o modelo..." linhas={6} />
          )}
          <ListaDoCatalogo
            modelos={modelos}
            destaqueId={destaque?.id ?? ''}
            linkDoModelo={linkDoModelo}
            total={total}
            restantesDepois={restantesDepois}
            restantesAntes={restantesAntes}
            buscandoDepois={catalogo.buscandoDepois}
            buscandoAntes={catalogo.buscandoAntes}
            erroNoBloco={catalogo.erroNoBloco}
            aoCarregarDepois={() => void catalogo.carregarDepois()}
            aoCarregarAntes={() => void catalogo.carregarAntes()}
          />
        </div>
      )}
    </section>
  );
}
