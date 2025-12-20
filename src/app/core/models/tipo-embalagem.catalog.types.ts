// Tipo de Embalagem
export interface TipoEmbalagemCreateDTO {
  descricao: string;
  usuario?: string;
  dataAtualizacao?: string;
}

export interface TipoEmbalagemUpdateDTO {
  id: number;
  descricao: string;
  auditInfo: any;
}

export interface TipoEmbalagemResponseDTO {
  id: number;
  descricao: string;
  auditInfo: any;
}
