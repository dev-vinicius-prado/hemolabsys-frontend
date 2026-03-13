// estoque.types.ts

export interface EstoqueResponseDTO {
  id: number;
  insumoId: number;
  insumoDescricao: string;
  setorId: number;
  setorNome: string;
  quantidadeAtual: number;
  quantidadeMinima: number;
}

export interface EntradaEstoqueDTO {
  insumoId: number;
  setorId: number;
  quantidade: number;
  loteId: number;
  dataValidade: string; // LocalDate convertido para ISO string (YYYY-MM-DD)
}

export interface SaidaEstoqueDTO {
  insumoId: number;
  setorId: number;
  quantidade: number;
}

// Para as movimentações
export enum TipoMovimentacao {
  ENTRADA = 'E',
  SAIDA = 'S',
  AJUSTE = 'A'
}

export interface MovimentacaoResponseDTO {
  id: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  dataMovimentacao: string;
  insumoId: number;
  insumoDescricao: string;
  setorId: number;
  setorNome: string;
  usuarioId: number;
  usuarioNome: string;
  loteId?: number;
  loteCodigo?: string;
  dataValidade?: string;
  motivo?: string;
}

export interface EstoqueTotalResponseDTO {
  insumoId: number;
  insumoNome: string;
  almoxarifadoNome: string;
  quantidadeTotal: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  status: 'OK' | 'BAIXO' | 'CRITICO';
}
