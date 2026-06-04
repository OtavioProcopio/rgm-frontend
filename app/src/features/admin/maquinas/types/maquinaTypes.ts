export type Maquina = {
  id: string;
  nome: string;
  codigo: string;
  descricao: string | null;
  ativa: boolean;
  criadaEm: string;
  atualizadaEm: string;
};

export type MaquinasFilters = {
  page: number;
  size: number;
};

export type CriarMaquinaRequest = {
  nome: string;
  codigo: string;
  descricao?: string;
};

export type EditarMaquinaRequest = {
  nome: string;
  codigo: string;
  descricao?: string;
};
