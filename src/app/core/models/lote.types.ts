// lote.types.ts

export interface LoteCreateDTO {
  codigoLote: string;
  dataFabricacao: string;
  dataValidade: string;
  quantidadeInicial: number;
  insumoId: number;
  fornecedorId: number;
  numeroNotaFiscal?: string;
}

export interface LoteResponseDTO {
  id: number;
  codigoLote: string;
  dataFabricacao: string;
  dataValidade: string;
  quantidadeInicial: number;
  quantidadeDisponivel: number;
  numeroNotaFiscal?: string;
  ativo: boolean;
  insumoId: number;
  insumoDescricao: string;
  insumoCodigo: string;
  fornecedorId: number;
  fornecedorNome: string;
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
