// dashboard.types.ts

export interface DashboardOverviewDTO {
  totalItens: number;
  itensCriticos: number;
  consumoDiario: number;
  vencimentosProximos: number;
  alertasPendentes: number;
}

export interface AlertaResponseDTO {
  id: number;
  tipo: 'ESTOQUE_MINIMO' | 'VENCIMENTO_PROXIMO' | 'VENCIDO' | 'OUTRO';
  nivel: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  titulo: string;
  descricao: string;
  insumoId?: number;
  insumoDescricao?: string;
  loteId?: number;
  loteCodigo?: string;
  dataValidade?: string;
  setorId?: number;
  setorNome?: string;
  dataCriacao: string;
  lido: boolean;
}
