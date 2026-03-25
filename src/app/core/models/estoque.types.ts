export type TipoMovimentacao = 'ENTRADA' | 'SAIDA' | 'ATRASO' | 'AJUSTE_ENTRADA' | 'AJUSTE_SAIDA' | 'DESCARTE';

export interface EstoqueTotalResponseDTO {
  almoxarifadoNome: string;
  estoqueMaximo?: number;
  estoqueMinimo: number;
  insumoId: number;
  insumoNome: string;
  quantidadeTotal: number;
  status: 'OK' | 'BAIXO' | 'CRITICO';
}

export interface EstoqueInsumoConfigDTO {
  almoxarifadoId: number;
  insumoId: number;
  estoqueMinimo: number;
  estoqueMaximo?: number;
  localizacao?: string;
}

export interface EstoqueInsumoResponseDTO {
  id: number;
  almoxarifadoId: number;
  almoxarifadoNome: string;
  insumoId: number;
  insumoNome: string;
  insumoCodigo: string;
  estoqueMinimo: number;
  estoqueMaximo?: number;
  localizacao?: string;
}
