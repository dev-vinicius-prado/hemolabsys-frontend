// aprovacao.types.ts

export enum StatusAprovacao {
  PENDENTE = 'PENDENTE',
  APROVADO_COORDENADOR = 'APROVADO_COORDENADOR',
  APROVADO_GERENTE = 'APROVADO_GERENTE',
  REPROVADO = 'REPROVADO',
  CANCELADO = 'CANCELADO'
}

export interface SolicitacaoResponseDTO {
  id: number;
  tipo: 'RETIRADA' | 'REPOSICAO';
  insumoId: number;
  insumoDescricao: string;
  setorId: number;
  setorNome: string;
  quantidade: number;
  solicitanteId: number;
  solicitanteNome: string;
  status: StatusAprovacao;
  motivo?: string;
  aprovadorId?: number;
  aprovadorNome?: string;
  dataAprovacao?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AprovarSolicitacaoDTO {
  solicitacaoId: number;
  aprovado: boolean;
  motivo?: string;
}
