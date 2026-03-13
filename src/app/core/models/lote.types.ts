// lote.types.ts

export interface CreateLoteDTO {
  codigo: string;
  insumoId: number;
  quantidadeOriginal: number;
  dataFabricacao: string;
  dataValidade: string;
  fornecedorId?: number;
}

export interface UpdateLoteDTO {
  id: number;
  codigo: string;
  insumoId: number;
  quantidadeOriginal: number;
  dataFabricacao: string;
  dataValidade: string;
  fornecedorId?: number;
}

export interface LoteResponseDTO {
  id: number;
  codigo: string;
  insumoId: number;
  insumoDescricao: string;
  quantidadeOriginal: number;
  quantidadeAtual: number;
  dataFabricacao: string;
  dataValidade: string;
  fornecedorId?: number;
  fornecedorNome?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EstoqueLoteResponseDTO {
  estoqueLoteId: number;
  loteId: number;
  codigoLote: string;
  insumoNome: string;
  almoxarifadoNome: string;
  dataValidade: string;
  quantidade: number;
}
