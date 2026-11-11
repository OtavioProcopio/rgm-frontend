import type { Modelo } from '@/features/admin/modelos/types/modeloTypes';
import type { FotoGaleria } from '@/features/admin/modelos/types/galeriaTypes';

export function criarModelo(extra: Partial<Modelo> = {}): Modelo {
  return {
    id: 'm1',
    codigo: 'FB-1001',
    versao: 1,
    descricao: 'Carcaça de bomba',
    observacoes: null,
    fotoCapaUrl: null,
    ativo: true,
    maquina: 'FBOX',
    tipo: 'RESINA',
    temPendenciaAberta: false,
    criadoEm: '2026-01-01T00:00:00Z',
    atualizadoEm: '2026-01-01T00:00:00Z',
    ...extra,
  };
}

export function criarFoto(extra: Partial<FotoGaleria> = {}): FotoGaleria {
  return {
    id: 'f1',
    modeloId: 'm1',
    publicUrl: 'https://img/f1.jpg',
    identificacao: 'Foto',
    principal: false,
    enviadaPorUsuarioId: null,
    criadoEm: '2026-01-01T00:00:00Z',
    ...extra,
  };
}

/** `quantos` modelos em ordem de código ("M-000", "M-001"…), prontos para dividir em blocos. */
export function criarModelos(quantos: number, extra: Partial<Modelo> = {}): Modelo[] {
  return Array.from({ length: quantos }, (_, i) =>
    criarModelo({
      id: `id-${String(i).padStart(3, '0')}`,
      codigo: `M-${String(i).padStart(3, '0')}`,
      descricao: `Modelo ${i}`,
      ...extra,
    }),
  );
}
