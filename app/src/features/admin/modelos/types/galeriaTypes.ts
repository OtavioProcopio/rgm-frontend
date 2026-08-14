export type FotoGaleria = {
  id: string;
  modeloId: string;
  publicUrl: string;
  identificacao: string;
  principal: boolean;
  enviadaPorUsuarioId: string | null;
  criadoEm: string;
};

export type EditarFotoGaleriaRequest = {
  identificacao?: string;
  principal?: boolean;
};
