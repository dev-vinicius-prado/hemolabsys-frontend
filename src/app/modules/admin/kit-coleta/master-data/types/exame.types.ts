export interface ExameCreateDTO {
  codigoIntegracao?: string;
  nome: string;
  sigla?: string;
}

export interface KitExameInsumoResponseDTO {
  idKitExameInsumo: number;
  idInsumo: number;
  insumoNome: string;
  quantidadePadrao: number;
  obrigatorio: boolean;
}

export interface ExameResponseDTO {
  id: number;
  codigoIntegracao: string;
  nome: string;
  sigla: string;
  ativo: boolean;
  insumos: KitExameInsumoResponseDTO[];
}

export interface KitExameInsumoCreateDTO {
  idInsumo: number;
  quantidadePadrao: number;
  obrigatorio: boolean;
}
