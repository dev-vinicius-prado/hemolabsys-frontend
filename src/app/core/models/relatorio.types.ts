// relatorio.types.ts

import { TipoMovimentacao } from "./estoque.types";

export interface FiltroRelatorioDTO {
  dataInicio?: string;
  dataFim?: string;
  setorId?: number;
  insumoId?: number;
  tipoMovimentacao?: TipoMovimentacao;
  usuarioId?: number;
}

export interface RelatorioConsumoDTO {
  periodo: string;
  insumoId: number;
  insumoDescricao: string;
  quantidadeConsumida: number;
  quantidadeVencida: number;
  valorTotal: number;
  percentualDesperdicio: number;
}
