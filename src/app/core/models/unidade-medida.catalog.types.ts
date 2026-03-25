export interface UnidadeMedidaCreateDTO {
  descricao: string;
  simbolo: string;
  tipoMedida: TipoMedida;
  fatorConversao: number;
  unidadeBase?: string;
  precisaoDecimais: number;
  normaReferencia?: string;
  ativo: boolean;
}

export interface UnidadeMedidaUpdateDTO {
  id: number;
  descricao: string;
  simbolo: string;
  tipoMedida: TipoMedida;
  fatorConversao: number;
  unidadeBase?: string;
  precisaoDecimais: number;
  normaReferencia?: string;
  ativo: boolean;
}

export type TipoMedida = 'VOLUME' | 'PESO' | 'QUANTIDADE' | 'OUTROS';

export interface UnidadeMedidaResponseDTO {
  id: number;
  descricao: string;
  simbolo: string;
  tipoMedida: TipoMedida;
  fatorConversao: number;
  unidadeBase?: string;
  precisaoDecimais: number;
  normaReferencia?: string;
  ativo: boolean;
}
