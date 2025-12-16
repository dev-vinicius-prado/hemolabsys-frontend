// basic-catalogs.types.ts

// Setor
export interface CreateSetorDTO {
  nome: string;
}

export interface UpdateSetorDTO {
  id: number;
  nome: string;
}

export interface SetorResponseDTO {
  id: number;
  nome: string;
}

// Tipo de Embalagem
export interface CreateTipoEmbalagemDTO {
  descricao: string;
  usuario?: string;
  dataAtualizacao?: string;
}

export interface UpdateTipoEmbalagemDTO {
  id: number;
  descricao: string;
  usuario?: string;
  dataAtualizacao?: string;
}

export interface TipoEmbalagemResponseDTO {
  id: number;
  descricao: string;
  usuario?: string;
  dataAtualizacao?: string;
}

// Marca
export interface CreateMarcaDTO {
  nome: string;
}

export interface UpdateMarcaDTO {
  id: number;
  nome: string;
}

export interface MarcaResponseDTO {
  id: number;
  nome: string;
}

// Unidade de Medida
export interface CreateUnidadeMedidaDTO {
  descricao: string;
}

export interface UnidadeMedidaResponseDTO {
  id: number;
  descricao: string;
}
