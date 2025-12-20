// Tipo de Embalagem
export interface TipoEmbalagemCreateDTO {
  descricao: string;
  usuario?: string;
  dataAtualizacao?: string;
}

export interface TipoEmbalagemUpdateDTO {
  id: number;
  descricao: string;
  audityInfo: any;
}

export interface TipoEmbalagemResponseDTO {
  id: number;
  descricao: string;
  audityInfo: any;
}
