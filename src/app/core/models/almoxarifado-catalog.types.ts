export interface AlmoxarifadoCreateDTO {
  codigo: string;
  descricao: string;
  empresaId: number;
  tipo: TipoServico;
}
export interface AlmoxarifadoResponseDTO {
  auditInfo?: string;
  codigo: string;
  descricao: string;
  empresaId: number;
  empresaRazaoSocial?: string;
  id: number;
  tipo: TipoServico;
}

export type TipoServico = 'ALMOXARIFADO' | 'SERVICO_EAC' | 'SERVICO_POSTO_COLETA' | 'SERVICO_LABORATORIO_CENTRAL';
